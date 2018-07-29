#define NAPI_EXPERIMENTAL

#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <node_api.h>
#include <uv.h>
#include <deltachat.h>
#include "napi-macros-extensions.h"

/**
 * Custom context
 */
typedef struct dcn_context_t {
  dc_context_t* dc_context;
  napi_threadsafe_function threadsafe_event_handler;
  uv_thread_t smtp_thread;
  uv_thread_t imap_thread;
  int loop_thread;
  int is_offline;
} dcn_context_t;

/**
 * Event struct for calling back to JavaScript
 */
typedef struct dcn_event_t {
  int event;
  uintptr_t data1_int;
  uintptr_t data2_int;
  char* data2_str;
} dcn_event_t;

static uintptr_t dc_event_handler(dc_context_t* dc_context, int event, uintptr_t data1, uintptr_t data2)
{
  dcn_context_t* dcn_context = (dcn_context_t*)dc_get_userdata(dc_context);

  switch (event) {
    case DC_EVENT_IS_OFFLINE:
      return dcn_context->is_offline;

    default:
      if (dcn_context->threadsafe_event_handler) {
        dcn_event_t* dcn_event = calloc(1, sizeof(dcn_event_t));
        dcn_event->event = event;
        dcn_event->data1_int = data1;
        dcn_event->data2_int = data2;
        dcn_event->data2_str = (DC_EVENT_DATA2_IS_STRING(event) && data2) ? strdup((char*)data2) : NULL;
        napi_call_threadsafe_function(dcn_context->threadsafe_event_handler, dcn_event, napi_tsfn_blocking);
      } else {
        printf("Warning: threadsafe_event_handler not set :/\n");
      }
      break;
  }

  return 0;
}

static void call_js_event_handler(napi_env env, napi_value js_callback, void* context, void* data)
{
  dcn_event_t* dcn_event = (dcn_event_t*)data;

  napi_value global;
  napi_status status = napi_get_global(env, &global);

  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to get global");
  }

  const int argc = 3;
  napi_value argv[argc];

  status = napi_create_int32(env, dcn_event->event, &argv[0]);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to create argv[0] for event_handler arguments");
  }

  status = napi_create_int32(env, dcn_event->data1_int, &argv[1]);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to create argv[1] for event_handler arguments");
  }

  if (dcn_event->data2_str) {
    status = napi_create_string_utf8(env, dcn_event->data2_str, NAPI_AUTO_LENGTH, &argv[2]);
    if (status != napi_ok) {
      napi_throw_error(env, NULL, "Unable to create argv[2] for event_handler arguments");
    }
    free(dcn_event->data2_str);
  } else {
    status = napi_create_int32(env, dcn_event->data2_int, &argv[2]);
    if (status != napi_ok) {
      napi_throw_error(env, NULL, "Unable to create argv[2] for event_handler arguments");
    }
  }

  free(dcn_event);
  dcn_event = NULL;

  napi_value result;
  status = napi_call_function(
    env,
    global,
    js_callback,
    argc,
    argv,
    &result);

  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to call event_handler callback");
  }
}

static void imap_thread_func(void* arg)
{
  dcn_context_t* dcn_context = (dcn_context_t*)arg;
  dc_context_t* dc_context = dcn_context->dc_context;

  napi_acquire_threadsafe_function(dcn_context->threadsafe_event_handler);

  while (dcn_context->loop_thread) {
    dc_perform_imap_jobs(dc_context);
    dc_perform_imap_fetch(dc_context);
    dc_perform_imap_idle(dc_context);
  }

  napi_release_threadsafe_function(dcn_context->threadsafe_event_handler, napi_tsfn_release);
}

static void smtp_thread_func(void* arg)
{
  dcn_context_t* dcn_context = (dcn_context_t*)arg;
  dc_context_t* dc_context = dcn_context->dc_context;

  napi_acquire_threadsafe_function(dcn_context->threadsafe_event_handler);

  while (dcn_context->loop_thread) {
    dc_perform_smtp_jobs(dc_context);
    dc_perform_smtp_idle(dc_context);
  }

  napi_release_threadsafe_function(dcn_context->threadsafe_event_handler, napi_tsfn_release);
}

/**
 * Main context.
 */

void dcn_context_finalize(napi_env env, void* data, void* hint) {
  if (data) {
    dcn_context_t* dcn_context = (dcn_context_t*)data;
    dc_context_unref(dcn_context->dc_context);
    free(dcn_context);
  }
}

NAPI_METHOD(dcn_context_new) {
  // dc_openssl_init_not_required(); // TODO: if node.js inits OpenSSL on its own, this line should be uncommented

  dcn_context_t* dcn_context = calloc(1, sizeof(dcn_context_t));
  dcn_context->dc_context = dc_context_new(dc_event_handler, dcn_context, NULL);
  dcn_context->threadsafe_event_handler = NULL;
  dcn_context->imap_thread = 0;
  dcn_context->smtp_thread = 0;
  dcn_context->loop_thread = 0;
  dcn_context->is_offline = 0;

  napi_value result;
  NAPI_STATUS_THROWS(napi_create_external(env, dcn_context,
                                          dcn_context_finalize,
                                          NULL, &result));
  return result;
}

/**
 * dcn_context_t
 */

//NAPI_METHOD(dcn_add_address_book) {}

//NAPI_METHOD(dcn_add_contact_to_chat) {}

//NAPI_METHOD(dcn_archive_chat) {}

//NAPI_METHOD(dcn_block_contact) {}

//NAPI_METHOD(dcn_check_password) {}

//NAPI_METHOD(dcn_check_qr) {}

//NAPI_METHOD(dcn_close) {}

NAPI_METHOD(dcn_configure) {
  NAPI_ARGV(1);
  NAPI_DCN_CONTEXT();

  dc_configure(dcn_context->dc_context);

  NAPI_RETURN_UNDEFINED();
}

//NAPI_METHOD(dcn_continue_key_transfer) {}

NAPI_METHOD(dcn_create_chat_by_contact_id) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  NAPI_INT32(contact_id, argv[1]);

  uint32_t chat_id = dc_create_chat_by_contact_id(dcn_context->dc_context, contact_id);

  NAPI_RETURN_UINT32(chat_id);
}

NAPI_METHOD(dcn_create_chat_by_msg_id) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  NAPI_INT32(msg_id, argv[1]);

  uint32_t chat_id = dc_create_chat_by_msg_id(dcn_context->dc_context, msg_id);

  NAPI_RETURN_UINT32(chat_id);
}

NAPI_METHOD(dcn_create_contact) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  NAPI_UTF8(name, argv[1]);
  NAPI_UTF8(addr, argv[2]);

  uint32_t contact_id = dc_create_contact(dcn_context->dc_context, name, addr);

  free(name);
  free(addr);

  NAPI_RETURN_UINT32(contact_id);
}

NAPI_METHOD(dcn_create_group_chat) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  NAPI_INT32(verified, argv[1]);
  NAPI_UTF8(chat_name, argv[2]);

  uint32_t chat_id = dc_create_group_chat(dcn_context->dc_context, verified, chat_name);

  free(chat_name);

  NAPI_RETURN_UINT32(chat_id);
}

//NAPI_METHOD(dcn_delete_chat) {}

//NAPI_METHOD(dcn_delete_contact) {}

//NAPI_METHOD(dcn_delete_msgs) {}

//NAPI_METHOD(dcn_forward_msgs) {}

//NAPI_METHOD(dcn_get_blobdir) {}

//NAPI_METHOD(dcn_get_blocked_cnt) {}

//NAPI_METHOD(dcn_get_blocked_contacts) {}

void dc_chat_t_finalize(napi_env env, void* data, void* hint) {
  if (data) {
    dc_chat_unref((dc_chat_t*)data);
  }
}

NAPI_METHOD(dcn_get_chat) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  NAPI_UINT32(chat_id, argv[1]);

  napi_value result;
  dc_chat_t* chat = dc_get_chat(dcn_context->dc_context, chat_id);

  if (chat == NULL) {
    NAPI_STATUS_THROWS(napi_get_null(env, &result));
    return result;
  }

  NAPI_STATUS_THROWS(napi_create_external(env, chat, dc_chat_t_finalize,
                                          NULL, &result));
  return result;
}

//NAPI_METHOD(dcn_get_chat_contacts) {}

//NAPI_METHOD(dcn_get_chat_id_by_contact_id) {}

//NAPI_METHOD(dcn_get_chat_media) {}

//NAPI_METHOD(dcn_get_chat_msgs) {}

void dc_chatlist_t_finalize(napi_env env, void* data, void* hint) {
  if (data) {
    dc_chatlist_unref((dc_chatlist_t*)data);
  }
}

NAPI_METHOD(dcn_get_chatlist) {
  NAPI_ARGV(4);
  NAPI_DCN_CONTEXT();
  NAPI_INT32(listflags, argv[1]);
  NAPI_UTF8(query_str, argv[2]);
  NAPI_UINT32(query_contact_id, argv[3]);

  // query_str HAS to be a string, if empty pass NULL
  char* query_str_null = strlen(query_str) > 0 ? query_str : NULL;
  dc_chatlist_t* chatlist = dc_get_chatlist(dcn_context->dc_context,
                                            listflags,
                                            query_str_null,
                                            query_contact_id);

  free(query_str);

  napi_value result;
  NAPI_STATUS_THROWS(napi_create_external(env,
                                          chatlist,
                                          dc_chatlist_t_finalize,
                                          NULL,
                                          &result));
  return result;
}

NAPI_METHOD(dcn_get_config) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  NAPI_UTF8(key, argv[1]);
  NAPI_UTF8(def, argv[2]);

  char *value = dc_get_config(dcn_context->dc_context, key, def);

  free(key);
  free(def);

  NAPI_RETURN_AND_FREE_STRING(value);
}

NAPI_METHOD(dcn_get_config_int) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  NAPI_UTF8(key, argv[1]);
  NAPI_INT32(def, argv[2]);

  int value = dc_get_config_int(dcn_context->dc_context, key, def);

  free(key);

  NAPI_RETURN_INT32(value);
}

void dc_contact_t_finalize(napi_env env, void* data, void* hint) {
  if (data) {
    dc_contact_unref((dc_contact_t*)data);
  }
}

NAPI_METHOD(dcn_get_contact) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  NAPI_UINT32(contact_id, argv[1]);

  napi_value result;
  dc_contact_t* contact = dc_get_contact(dcn_context->dc_context, contact_id);

  if (contact == NULL) {
    NAPI_STATUS_THROWS(napi_get_null(env, &result));
    return result;
  }

  NAPI_STATUS_THROWS(napi_create_external(env, contact, dc_contact_t_finalize,
                                          NULL, &result));
  return result;
}

//NAPI_METHOD(dcn_get_contact_encrinfo) {}

//NAPI_METHOD(dcn_get_contacts) {}

//NAPI_METHOD(dcn_get_fresh_msg_cnt) {}

//NAPI_METHOD(dcn_get_fresh_msgs) {}

NAPI_METHOD(dcn_get_info) {
  NAPI_ARGV(1);
  NAPI_DCN_CONTEXT();

  char *str = dc_get_info(dcn_context->dc_context);

  NAPI_RETURN_AND_FREE_STRING(str);
}

void dc_msg_t_finalize(napi_env env, void* data, void* hint) {
  if (data) {
    dc_msg_unref((dc_msg_t*)data);
  }
}

NAPI_METHOD(dcn_get_msg) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  NAPI_UINT32(msg_id, argv[1]);

  napi_value result;
  dc_msg_t* msg = dc_get_msg(dcn_context->dc_context, msg_id);

  if (msg == NULL) {
    NAPI_STATUS_THROWS(napi_get_null(env, &result));
    return result;
  }

  NAPI_STATUS_THROWS(napi_create_external(env, msg, dc_msg_t_finalize,
                                          NULL, &result));
  return result;
}

NAPI_METHOD(dcn_get_msg_cnt) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  NAPI_UINT32(chat_id, argv[1]);

  int msg_cnt = dc_get_msg_cnt(dcn_context->dc_context, chat_id);

  NAPI_RETURN_INT32(msg_cnt);
}

NAPI_METHOD(dcn_get_msg_info) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  NAPI_UINT32(msg_id, argv[1]);

  char* msg_info = dc_get_msg_info(dcn_context->dc_context, msg_id);

  NAPI_RETURN_AND_FREE_STRING(msg_info);
}

//NAPI_METHOD(dcn_get_next_media) {}

//NAPI_METHOD(dcn_get_securejoin_qr) {}

// TODO remove (only used internally)
//NAPI_METHOD(dcn_get_userdata) {}

//NAPI_METHOD(dcn_imex) {}

//NAPI_METHOD(dcn_imex_has_backup) {}

//NAPI_METHOD(dcn_initiate_key_transfer) {}

// TODO remove? dc_interrupt_imap_idle is used internally
//NAPI_METHOD(dcn_interrupt_imap_idle) {}

// TODO remove? dc_interrupt_smtp_idle is used internally
//NAPI_METHOD(dcn_interrupt_smtp_idle) {}

NAPI_METHOD(dcn_is_configured) {
  NAPI_ARGV(1);
  NAPI_DCN_CONTEXT();

  int status = dc_is_configured(dcn_context->dc_context);

  NAPI_RETURN_INT32(status);
}

//NAPI_METHOD(dcn_is_contact_in_chat) {}

//NAPI_METHOD(dcn_is_open) {}

//NAPI_METHOD(dcn_join_securejoin) {}

//NAPI_METHOD(dcn_marknoticed_chat) {}

//NAPI_METHOD(dcn_marknoticed_contact) {}

//NAPI_METHOD(dcn_markseen_msgs) {}

NAPI_METHOD(dcn_msg_new) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();

  napi_value result;
  dc_msg_t* msg = dc_msg_new(dcn_context->dc_context);

  NAPI_STATUS_THROWS(napi_create_external(env, msg, dc_msg_t_finalize,
                                          NULL, &result));
  return result;
}

NAPI_METHOD(dcn_open) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  NAPI_UTF8(dbfile, argv[1]);
  NAPI_UTF8(blobdir, argv[2]);

  // blobdir may be the empty string or NULL for default blobdir
  int status = dc_open(dcn_context->dc_context, dbfile, blobdir);

  free(dbfile);
  free(blobdir);

  NAPI_RETURN_INT32(status);
}

//NAPI_METHOD(dcn_remove_contact_from_chat) {}

//NAPI_METHOD(dcn_search_msgs) {}

//NAPI_METHOD(dcn_send_audio_msg) {}

//NAPI_METHOD(dcn_send_file_msg) {}

//NAPI_METHOD(dcn_send_image_msg) {}

NAPI_METHOD(dcn_send_msg) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  NAPI_UINT32(chat_id, argv[1]);

  dc_msg_t* dc_msg;
  napi_get_value_external(env, argv[2], (void**)&dc_msg);

  uint32_t msg_id = dc_send_msg(dcn_context->dc_context, chat_id, dc_msg);

  NAPI_RETURN_UINT32(msg_id);
}

NAPI_METHOD(dcn_send_text_msg) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  NAPI_INT32(chat_id, argv[1]);
  NAPI_UTF8(text, argv[2]);

  uint32_t msg_id = dc_send_text_msg(dcn_context->dc_context, chat_id, text);

  free(text);

  NAPI_RETURN_UINT32(msg_id);
}

//NAPI_METHOD(dcn_send_vcard_msg) {}

//NAPI_METHOD(dcn_send_video_msg) {}

//NAPI_METHOD(dcn_send_voice_msg) {}

//NAPI_METHOD(dcn_set_chat_name) {}

//NAPI_METHOD(dcn_set_chat_profile_image) {}

NAPI_METHOD(dcn_set_config) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  NAPI_UTF8(key, argv[1]);
  NAPI_UTF8(value, argv[2]);

  int status = dc_set_config(dcn_context->dc_context, key, value);

  free(key);
  free(value);

  NAPI_RETURN_INT32(status);
}

NAPI_METHOD(dcn_set_config_int) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  NAPI_UTF8(key, argv[1]);
  NAPI_INT32(value, argv[2]);

  int status = dc_set_config_int(dcn_context->dc_context, key, value);

  free(key);

  NAPI_RETURN_INT32(status);
}

NAPI_METHOD(dcn_set_event_handler) {
  NAPI_ARGV(2); //TODO: Make sure we throw a helpful error if we don't get the correct count of arguments
  NAPI_DCN_CONTEXT();
  napi_value callback = argv[1];

  napi_value async_resource_name;
  NAPI_STATUS_THROWS(napi_create_string_utf8(env, "dc_event_callback", NAPI_AUTO_LENGTH, &async_resource_name));

  NAPI_STATUS_THROWS(napi_create_threadsafe_function(
    env,
    callback,
    0,
    async_resource_name,
    100,
    1,
    0,
    NULL, // TODO: file an issue that the finalize parameter should be optional
    dcn_context,
    call_js_event_handler,
    &dcn_context->threadsafe_event_handler));

  NAPI_RETURN_INT32(1);
}

NAPI_METHOD(dcn_set_offline) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  NAPI_INT32(is_offline, argv[1]); // param2: 1=we're offline, 0=we're online again

  dcn_context->is_offline = is_offline;
  if (!is_offline) {
    dc_interrupt_smtp_idle(dcn_context->dc_context);
  }

  NAPI_RETURN_UNDEFINED();
}

//NAPI_METHOD(dcn_set_text_draft) {}

//NAPI_METHOD(dcn_star_msgs) {}

NAPI_METHOD(dcn_start_threads) {
  NAPI_ARGV(1);
  NAPI_DCN_CONTEXT();

  dcn_context->loop_thread = 1;
  uv_thread_create(&dcn_context->imap_thread, imap_thread_func, dcn_context);
  uv_thread_create(&dcn_context->smtp_thread, smtp_thread_func, dcn_context);

  NAPI_RETURN_INT32(1);
}

NAPI_METHOD(dcn_stop_threads) {
  NAPI_ARGV(1);
  NAPI_DCN_CONTEXT();

  dcn_context->loop_thread = 0;

  if (dcn_context->imap_thread && dcn_context->smtp_thread) {
    dc_interrupt_imap_idle(dcn_context->dc_context);
    dc_interrupt_smtp_idle(dcn_context->dc_context);

    uv_thread_join(&dcn_context->imap_thread);
    uv_thread_join(&dcn_context->smtp_thread);

    dcn_context->imap_thread = 0;
    dcn_context->smtp_thread = 0;
  }


  NAPI_RETURN_UNDEFINED();
}

//NAPI_METHOD(dcn_stop_ongoing_process) {}

NAPI_METHOD(dcn_unset_event_handler) {
  NAPI_ARGV(1); //TODO: Make sure we throw a helpful error if we don't get the correct count of arguments
  NAPI_DCN_CONTEXT();

  napi_release_threadsafe_function(dcn_context->threadsafe_event_handler, napi_tsfn_release);

  NAPI_RETURN_INT32(1);
}

/**
 * dc_chat_t
 */

NAPI_METHOD(dcn_chat_get_archived) {
  NAPI_ARGV(1);
  NAPI_DC_CHAT();

  int archived = dc_chat_get_archived(dc_chat);

  NAPI_RETURN_INT32(archived);
}

NAPI_METHOD(dcn_chat_get_draft_timestamp) {
  NAPI_ARGV(1);
  NAPI_DC_CHAT();

  int draft_timestamp = dc_chat_get_draft_timestamp(dc_chat);

  NAPI_RETURN_INT32(draft_timestamp);
}

NAPI_METHOD(dcn_chat_get_id) {
  NAPI_ARGV(1);
  NAPI_DC_CHAT();

  uint32_t chat_id = dc_chat_get_id(dc_chat);

  NAPI_RETURN_UINT32(chat_id);
}

NAPI_METHOD(dcn_chat_get_name) {
  NAPI_ARGV(1);
  NAPI_DC_CHAT();

  char* name = dc_chat_get_name(dc_chat);

  NAPI_RETURN_AND_FREE_STRING(name);
}

NAPI_METHOD(dcn_chat_get_profile_image) {
  NAPI_ARGV(1);
  NAPI_DC_CHAT();

  char* profile_image = dc_chat_get_profile_image(dc_chat);

  if (profile_image == NULL) {
    napi_value result;
    NAPI_STATUS_THROWS(napi_get_null(env, &result));
    return result;
  }

  NAPI_RETURN_AND_FREE_STRING(profile_image);
}

NAPI_METHOD(dcn_chat_get_subtitle) {
  NAPI_ARGV(1);
  NAPI_DC_CHAT();

  char* subtitle = dc_chat_get_subtitle(dc_chat);

  NAPI_RETURN_AND_FREE_STRING(subtitle);
}

NAPI_METHOD(dcn_chat_get_text_draft) {
  NAPI_ARGV(1);
  NAPI_DC_CHAT();

  char* text_draft = dc_chat_get_text_draft(dc_chat);

  if (text_draft == NULL) {
    napi_value result;
    NAPI_STATUS_THROWS(napi_get_null(env, &result));
    return result;
  }

  NAPI_RETURN_AND_FREE_STRING(text_draft);
}

NAPI_METHOD(dcn_chat_get_type) {
  NAPI_ARGV(1);
  NAPI_DC_CHAT();

  int type = dc_chat_get_type(dc_chat);

  NAPI_RETURN_INT32(type);
}

NAPI_METHOD(dcn_chat_is_self_talk) {
  NAPI_ARGV(1);
  NAPI_DC_CHAT();

  int is_self_talk = dc_chat_is_self_talk(dc_chat);

  NAPI_RETURN_INT32(is_self_talk);
}

NAPI_METHOD(dcn_chat_is_unpromoted) {
  NAPI_ARGV(1);
  NAPI_DC_CHAT();

  int is_unpromoted = dc_chat_is_unpromoted(dc_chat);

  NAPI_RETURN_INT32(is_unpromoted);
}

NAPI_METHOD(dcn_chat_is_verified) {
  NAPI_ARGV(1);
  NAPI_DC_CHAT();

  int is_verified = dc_chat_is_verified(dc_chat);

  NAPI_RETURN_INT32(is_verified);
}

/**
 * dc_chatlist_t
 */

NAPI_METHOD(dcn_chatlist_get_chat_id) {
  NAPI_ARGV(2);
  NAPI_DC_CHATLIST();
  NAPI_INT32(index, argv[1]);

  uint32_t chat_id = dc_chatlist_get_chat_id(dc_chatlist, index);

  NAPI_RETURN_UINT32(chat_id);
}

NAPI_METHOD(dcn_chatlist_get_cnt) {
  NAPI_ARGV(1);
  NAPI_DC_CHATLIST();

  int count = dc_chatlist_get_cnt(dc_chatlist);

  NAPI_RETURN_INT32(count);
}

NAPI_METHOD(dcn_chatlist_get_msg_id) {
  NAPI_ARGV(2);
  NAPI_DC_CHATLIST();
  NAPI_INT32(index, argv[1]);

  uint32_t message_id = dc_chatlist_get_msg_id(dc_chatlist, index);

  NAPI_RETURN_UINT32(message_id);
}

void dc_lot_finalize(napi_env env, void* data, void* hint) {
  if (data) {
    dc_lot_unref((dc_lot_t*)data);
  }
}

NAPI_METHOD(dcn_chatlist_get_summary) {
  NAPI_ARGV(3);
  NAPI_DC_CHATLIST();
  NAPI_INT32(index, argv[1]);

  dc_chat_t* dc_chat = NULL;
  napi_get_value_external(env, argv[2], (void**)&dc_chat);

  dc_lot_t* summary = dc_chatlist_get_summary(dc_chatlist, index, dc_chat);

  napi_value result;
  if (summary == NULL) {
    NAPI_STATUS_THROWS(napi_get_null(env, &result));
    return result;
  }

  NAPI_STATUS_THROWS(napi_create_external(env, summary,
                                          dc_lot_finalize,
                                          NULL, &result));
  return result;
}

/**
 * dc_contact_t
 */

NAPI_METHOD(dcn_contact_get_addr) {
  NAPI_ARGV(1);
  NAPI_DC_CONTACT();

  char* addr = dc_contact_get_addr(dc_contact);

  NAPI_RETURN_AND_FREE_STRING(addr);
}

NAPI_METHOD(dcn_contact_get_display_name) {
  NAPI_ARGV(1);
  NAPI_DC_CONTACT();

  char* display_name = dc_contact_get_display_name(dc_contact);

  NAPI_RETURN_AND_FREE_STRING(display_name);
}

NAPI_METHOD(dcn_contact_get_first_name) {
  NAPI_ARGV(1);
  NAPI_DC_CONTACT();

  char* first_name = dc_contact_get_first_name(dc_contact);

  NAPI_RETURN_AND_FREE_STRING(first_name);
}

NAPI_METHOD(dcn_contact_get_id) {
  NAPI_ARGV(1);
  NAPI_DC_CONTACT();

  uint32_t contact_id = dc_contact_get_id(dc_contact);

  NAPI_RETURN_UINT32(contact_id);
}

NAPI_METHOD(dcn_contact_get_name) {
  NAPI_ARGV(1);
  NAPI_DC_CONTACT();

  char* name = dc_contact_get_name(dc_contact);

  NAPI_RETURN_AND_FREE_STRING(name);
}

NAPI_METHOD(dcn_contact_get_name_n_addr) {
  NAPI_ARGV(1);
  NAPI_DC_CONTACT();

  char* name_n_addr = dc_contact_get_name_n_addr(dc_contact);

  NAPI_RETURN_AND_FREE_STRING(name_n_addr);
}

NAPI_METHOD(dcn_contact_is_blocked) {
  NAPI_ARGV(1);
  NAPI_DC_CONTACT();

  int is_blocked = dc_contact_is_blocked(dc_contact);

  NAPI_RETURN_UINT32(is_blocked);
}

NAPI_METHOD(dcn_contact_is_verified) {
  NAPI_ARGV(1);
  NAPI_DC_CONTACT();

  int is_verified = dc_contact_is_verified(dc_contact);

  NAPI_RETURN_UINT32(is_verified);
}

/**
 * dc_lot_t
 */

NAPI_METHOD(dcn_lot_get_id) {
  NAPI_ARGV(1);
  NAPI_DC_LOT();

  uint32_t id = dc_lot_get_id(dc_lot);

  NAPI_RETURN_UINT32(id);
}

NAPI_METHOD(dcn_lot_get_state) {
  NAPI_ARGV(1);
  NAPI_DC_LOT();

  int state = dc_lot_get_state(dc_lot);

  NAPI_RETURN_INT32(state);
}

NAPI_METHOD(dcn_lot_get_text1) {
  NAPI_ARGV(1);
  NAPI_DC_LOT();

  char* text1 = dc_lot_get_text1(dc_lot);

  napi_value result;
  if (text1 == NULL) {
    NAPI_STATUS_THROWS(napi_get_null(env, &result));
    return result;
  }

  NAPI_RETURN_AND_FREE_STRING(text1);
}

NAPI_METHOD(dcn_lot_get_text1_meaning) {
  NAPI_ARGV(1);
  NAPI_DC_LOT();

  int text1_meaning = dc_lot_get_text1_meaning(dc_lot);

  NAPI_RETURN_INT32(text1_meaning);
}

NAPI_METHOD(dcn_lot_get_text2) {
  NAPI_ARGV(1);
  NAPI_DC_LOT();

  char* text2 = dc_lot_get_text2(dc_lot);

  napi_value result;
  if (text2 == NULL) {
    NAPI_STATUS_THROWS(napi_get_null(env, &result));
    return result;
  }

  NAPI_RETURN_AND_FREE_STRING(text2);
}

NAPI_METHOD(dcn_lot_get_timestamp) {
  NAPI_ARGV(1);
  NAPI_DC_LOT();

  int timestamp = dc_lot_get_timestamp(dc_lot);

  NAPI_RETURN_INT32(timestamp);
}

/**
 * dc_msg_t
 */

NAPI_METHOD(dcn_msg_get_chat_id) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  uint32_t chat_id = dc_msg_get_chat_id(dc_msg);

  NAPI_RETURN_UINT32(chat_id);
}

NAPI_METHOD(dcn_msg_get_duration) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  int duration = dc_msg_get_duration(dc_msg);

  NAPI_RETURN_INT32(duration);
}

NAPI_METHOD(dcn_msg_get_file) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  char* file = dc_msg_get_file(dc_msg);

  NAPI_RETURN_AND_FREE_STRING(file);
}

NAPI_METHOD(dcn_msg_get_filebytes) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  uint64_t filebytes = dc_msg_get_filebytes(dc_msg);

  NAPI_RETURN_UINT64(filebytes);
}

NAPI_METHOD(dcn_msg_get_filemime) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  char* filemime = dc_msg_get_filemime(dc_msg);

  NAPI_RETURN_AND_FREE_STRING(filemime);
}

NAPI_METHOD(dcn_msg_get_filename) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  char* filename = dc_msg_get_filename(dc_msg);

  NAPI_RETURN_AND_FREE_STRING(filename);
}

NAPI_METHOD(dcn_msg_get_from_id) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  uint32_t contact_id = dc_msg_get_from_id(dc_msg);

  NAPI_RETURN_UINT32(contact_id);
}

NAPI_METHOD(dcn_msg_get_height) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  int height = dc_msg_get_height(dc_msg);

  NAPI_RETURN_INT32(height);
}

NAPI_METHOD(dcn_msg_get_id) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  uint32_t msg_id = dc_msg_get_id(dc_msg);

  NAPI_RETURN_UINT32(msg_id);
}

NAPI_METHOD(dcn_msg_get_mediainfo) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  dc_lot_t* mediainfo = dc_msg_get_mediainfo(dc_msg);

  napi_value result;
  NAPI_STATUS_THROWS(napi_create_external(env, mediainfo,
                                          dc_lot_finalize,
                                          NULL, &result));
  return result;
}

NAPI_METHOD(dcn_msg_get_setupcodebegin) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  char* setupcodebegin = dc_msg_get_setupcodebegin(dc_msg);

  NAPI_RETURN_AND_FREE_STRING(setupcodebegin);
}

NAPI_METHOD(dcn_msg_get_showpadlock) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  int showpadlock = dc_msg_get_showpadlock(dc_msg);

  NAPI_RETURN_INT32(showpadlock);
}

NAPI_METHOD(dcn_msg_get_state) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  int state = dc_msg_get_state(dc_msg);

  NAPI_RETURN_INT32(state);
}

NAPI_METHOD(dcn_msg_get_summary) {
  NAPI_ARGV(2);
  NAPI_DC_MSG();

  dc_chat_t* dc_chat = NULL;
  napi_get_value_external(env, argv[1], (void**)&dc_chat);

  dc_lot_t* summary = dc_msg_get_summary(dc_msg, dc_chat);

  napi_value result;
  NAPI_STATUS_THROWS(napi_create_external(env, summary,
                                          dc_lot_finalize,
                                          NULL, &result));
  return result;
}

NAPI_METHOD(dcn_msg_get_summarytext) {
  NAPI_ARGV(2);
  NAPI_DC_MSG();
  NAPI_INT32(approx_characters, argv[1]);

  char* summarytext = dc_msg_get_summarytext(dc_msg, approx_characters);

  NAPI_RETURN_AND_FREE_STRING(summarytext);
}

NAPI_METHOD(dcn_msg_get_text) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  char* text = dc_msg_get_text(dc_msg);

  NAPI_RETURN_AND_FREE_STRING(text);
}

NAPI_METHOD(dcn_msg_get_timestamp) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  int timestamp = dc_msg_get_timestamp(dc_msg);

  NAPI_RETURN_INT32(timestamp);
}

NAPI_METHOD(dcn_msg_get_type) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  int type = dc_msg_get_type(dc_msg);

  NAPI_RETURN_INT32(type);
}

NAPI_METHOD(dcn_msg_get_width) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  int width = dc_msg_get_width(dc_msg);

  NAPI_RETURN_INT32(width);
}

NAPI_METHOD(dcn_msg_is_forwarded) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  int is_forwarded = dc_msg_is_forwarded(dc_msg);

  NAPI_RETURN_INT32(is_forwarded);
}

NAPI_METHOD(dcn_msg_is_increation) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  int is_increation = dc_msg_is_increation(dc_msg);

  NAPI_RETURN_INT32(is_increation);
}

NAPI_METHOD(dcn_msg_is_info) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  int is_info = dc_msg_is_info(dc_msg);

  NAPI_RETURN_INT32(is_info);
}

NAPI_METHOD(dcn_msg_is_sent) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  int is_sent = dc_msg_is_sent(dc_msg);

  NAPI_RETURN_INT32(is_sent);
}

NAPI_METHOD(dcn_msg_is_setupmessage) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  int is_setupmessage = dc_msg_is_setupmessage(dc_msg);

  NAPI_RETURN_INT32(is_setupmessage);
}

NAPI_METHOD(dcn_msg_is_starred) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  int is_starred = dc_msg_is_starred(dc_msg);

  NAPI_RETURN_INT32(is_starred);
}

NAPI_METHOD(dcn_msg_latefiling_mediasize) {
  NAPI_ARGV(4);
  NAPI_DC_MSG();
  NAPI_INT32(width, argv[1]);
  NAPI_INT32(height, argv[2]);
  NAPI_INT32(duration, argv[3]);

  dc_msg_latefiling_mediasize(dc_msg, width, height, duration);

  NAPI_RETURN_UNDEFINED();
}

NAPI_METHOD(dcn_msg_set_dimension) {
  NAPI_ARGV(3);
  NAPI_DC_MSG();
  NAPI_INT32(width, argv[1]);
  NAPI_INT32(height, argv[2]);

  dc_msg_set_dimension(dc_msg, width, height);

  NAPI_RETURN_UNDEFINED();
}

NAPI_METHOD(dcn_msg_set_duration) {
  NAPI_ARGV(2);
  NAPI_DC_MSG();
  NAPI_INT32(duration, argv[1]);

  dc_msg_set_duration(dc_msg, duration);

  NAPI_RETURN_UNDEFINED();
}

NAPI_METHOD(dcn_msg_set_file) {
  NAPI_ARGV(3);
  NAPI_DC_MSG();
  NAPI_UTF8(file, argv[1]);
  NAPI_UTF8(filemime, argv[2]);

  char* filemime_null = strlen(filemime) > 0 ? filemime : NULL;
  dc_msg_set_file(dc_msg, file, filemime_null);

  NAPI_RETURN_UNDEFINED();
}

NAPI_METHOD(dcn_msg_set_mediainfo) {
  NAPI_ARGV(3);
  NAPI_DC_MSG();
  NAPI_UTF8(author, argv[1]);
  NAPI_UTF8(trackname, argv[2]);

  char* author_null = strlen(author) > 0 ? author : NULL;
  char* trackname_null = strlen(trackname) > 0 ? trackname : NULL;
  dc_msg_set_mediainfo(dc_msg, author_null, trackname_null);

  NAPI_RETURN_UNDEFINED();
}

NAPI_METHOD(dcn_msg_set_text) {
  NAPI_ARGV(2);
  NAPI_DC_MSG();
  NAPI_UTF8(text, argv[1]);

  dc_msg_set_text(dc_msg, text);

  NAPI_RETURN_UNDEFINED();
}

NAPI_METHOD(dcn_msg_set_type) {
  NAPI_ARGV(2);
  NAPI_DC_MSG();
  NAPI_INT32(type, argv[1]);

  dc_msg_set_type(dc_msg, type);

  NAPI_RETURN_UNDEFINED();
}

NAPI_INIT() {
  /**
   * Main context
   */

  NAPI_EXPORT_FUNCTION(dcn_context_new);

  /**
   * dcn_context_t
   */

  //NAPI_EXPORT_FUNCTION(dcn_add_address_book);
  //NAPI_EXPORT_FUNCTION(dcn_add_contact_to_chat);
  //NAPI_EXPORT_FUNCTION(dcn_archive_chat);
  //NAPI_EXPORT_FUNCTION(dcn_block_contact);
  //NAPI_EXPORT_FUNCTION(dcn_check_password);
  //NAPI_EXPORT_FUNCTION(dcn_check_qr);
  //NAPI_EXPORT_FUNCTION(dcn_close);
  NAPI_EXPORT_FUNCTION(dcn_configure);
  //NAPI_EXPORT_FUNCTION(dcn_continue_key_transfer);
  NAPI_EXPORT_FUNCTION(dcn_create_chat_by_contact_id);
  NAPI_EXPORT_FUNCTION(dcn_create_chat_by_msg_id);
  NAPI_EXPORT_FUNCTION(dcn_create_contact);
  NAPI_EXPORT_FUNCTION(dcn_create_group_chat);
  //NAPI_EXPORT_FUNCTION(dcn_delete_chat);
  //NAPI_EXPORT_FUNCTION(dcn_delete_contact);
  //NAPI_EXPORT_FUNCTION(dcn_delete_msgs);
  //NAPI_EXPORT_FUNCTION(dcn_forward_msgs);
  //NAPI_EXPORT_FUNCTION(dcn_get_blobdir);
  //NAPI_EXPORT_FUNCTION(dcn_get_blocked_cnt);
  //NAPI_EXPORT_FUNCTION(dcn_get_blocked_contacts);
  NAPI_EXPORT_FUNCTION(dcn_get_chat);
  //NAPI_EXPORT_FUNCTION(dcn_get_chat_contacts);
  //NAPI_EXPORT_FUNCTION(dcn_get_chat_id_by_contact_id);
  //NAPI_EXPORT_FUNCTION(dcn_get_chat_media);
  //NAPI_EXPORT_FUNCTION(dcn_get_chat_msgs);
  NAPI_EXPORT_FUNCTION(dcn_get_chatlist);
  NAPI_EXPORT_FUNCTION(dcn_get_config);
  NAPI_EXPORT_FUNCTION(dcn_get_config_int);
  NAPI_EXPORT_FUNCTION(dcn_get_contact);
  //NAPI_EXPORT_FUNCTION(dcn_get_contact_encrinfo);
  //NAPI_EXPORT_FUNCTION(dcn_get_contacts);
  //NAPI_EXPORT_FUNCTION(dcn_get_fresh_msg_cnt);
  //NAPI_EXPORT_FUNCTION(dcn_get_fresh_msgs);
  NAPI_EXPORT_FUNCTION(dcn_get_info);
  NAPI_EXPORT_FUNCTION(dcn_get_msg);
  NAPI_EXPORT_FUNCTION(dcn_get_msg_cnt);
  NAPI_EXPORT_FUNCTION(dcn_get_msg_info);
  //NAPI_EXPORT_FUNCTION(dcn_get_next_media);
  //NAPI_EXPORT_FUNCTION(dcn_get_securejoin_qr);
  //NAPI_EXPORT_FUNCTION(dcn_get_userdata);
  //NAPI_EXPORT_FUNCTION(dcn_imex);
  //NAPI_EXPORT_FUNCTION(dcn_imex_has_backup);
  //NAPI_EXPORT_FUNCTION(dcn_initiate_key_transfer);
  //NAPI_EXPORT_FUNCTION(dcn_interrupt_imap_idle);
  //NAPI_EXPORT_FUNCTION(dcn_interrupt_smtp_idle);
  NAPI_EXPORT_FUNCTION(dcn_is_configured);
  //NAPI_EXPORT_FUNCTION(dcn_is_contact_in_chat);
  //NAPI_EXPORT_FUNCTION(dcn_is_open);
  //NAPI_EXPORT_FUNCTION(dcn_join_securejoin);
  //NAPI_EXPORT_FUNCTION(dcn_marknoticed_chat);
  //NAPI_EXPORT_FUNCTION(dcn_marknoticed_contact);
  //NAPI_EXPORT_FUNCTION(dcn_markseen_msgs);
  NAPI_EXPORT_FUNCTION(dcn_msg_new);
  NAPI_EXPORT_FUNCTION(dcn_open);
  //NAPI_EXPORT_FUNCTION(dcn_remove_contact_from_chat);
  //NAPI_EXPORT_FUNCTION(dcn_search_msgs);
  //NAPI_EXPORT_FUNCTION(dcn_send_audio_msg);
  //NAPI_EXPORT_FUNCTION(dcn_send_file_msg);
  //NAPI_EXPORT_FUNCTION(dcn_send_image_msg);
  NAPI_EXPORT_FUNCTION(dcn_send_msg);
  NAPI_EXPORT_FUNCTION(dcn_send_text_msg);
  //NAPI_EXPORT_FUNCTION(dcn_send_vcard_msg);
  //NAPI_EXPORT_FUNCTION(dcn_send_video_msg);
  //NAPI_EXPORT_FUNCTION(dcn_send_voice_msg);
  //NAPI_EXPORT_FUNCTION(dcn_set_chat_name);
  //NAPI_EXPORT_FUNCTION(dcn_set_chat_profile_image);
  NAPI_EXPORT_FUNCTION(dcn_set_config);
  NAPI_EXPORT_FUNCTION(dcn_set_config_int);
  NAPI_EXPORT_FUNCTION(dcn_set_event_handler);
  NAPI_EXPORT_FUNCTION(dcn_set_offline);
  //NAPI_EXPORT_FUNCTION(dcn_set_text_draft);
  //NAPI_EXPORT_FUNCTION(dcn_star_msgs);
  NAPI_EXPORT_FUNCTION(dcn_start_threads);
  NAPI_EXPORT_FUNCTION(dcn_stop_threads);
  //NAPI_EXPORT_FUNCTION(dcn_stop_ongoing_process);
  NAPI_EXPORT_FUNCTION(dcn_unset_event_handler);

  /**
   * dc_chat_t
   */

  NAPI_EXPORT_FUNCTION(dcn_chat_get_archived);
  NAPI_EXPORT_FUNCTION(dcn_chat_get_draft_timestamp);
  NAPI_EXPORT_FUNCTION(dcn_chat_get_id);
  NAPI_EXPORT_FUNCTION(dcn_chat_get_name);
  NAPI_EXPORT_FUNCTION(dcn_chat_get_profile_image);
  NAPI_EXPORT_FUNCTION(dcn_chat_get_subtitle);
  NAPI_EXPORT_FUNCTION(dcn_chat_get_text_draft);
  NAPI_EXPORT_FUNCTION(dcn_chat_get_type);
  NAPI_EXPORT_FUNCTION(dcn_chat_is_self_talk);
  NAPI_EXPORT_FUNCTION(dcn_chat_is_unpromoted);
  NAPI_EXPORT_FUNCTION(dcn_chat_is_verified);

  /**
   * dc_chatlist_t
   */

  NAPI_EXPORT_FUNCTION(dcn_chatlist_get_chat_id);
  NAPI_EXPORT_FUNCTION(dcn_chatlist_get_cnt);
  NAPI_EXPORT_FUNCTION(dcn_chatlist_get_msg_id);
  NAPI_EXPORT_FUNCTION(dcn_chatlist_get_summary);

  /**
   * dc_contact_t
   */

  NAPI_EXPORT_FUNCTION(dcn_contact_get_addr);
  NAPI_EXPORT_FUNCTION(dcn_contact_get_display_name);
  NAPI_EXPORT_FUNCTION(dcn_contact_get_first_name);
  NAPI_EXPORT_FUNCTION(dcn_contact_get_id);
  NAPI_EXPORT_FUNCTION(dcn_contact_get_name);
  NAPI_EXPORT_FUNCTION(dcn_contact_get_name_n_addr);
  NAPI_EXPORT_FUNCTION(dcn_contact_is_blocked);
  NAPI_EXPORT_FUNCTION(dcn_contact_is_verified);

  /**
   * dc_lot_t
   */

  NAPI_EXPORT_FUNCTION(dcn_lot_get_id);
  NAPI_EXPORT_FUNCTION(dcn_lot_get_state);
  NAPI_EXPORT_FUNCTION(dcn_lot_get_text1);
  NAPI_EXPORT_FUNCTION(dcn_lot_get_text1_meaning);
  NAPI_EXPORT_FUNCTION(dcn_lot_get_text2);
  NAPI_EXPORT_FUNCTION(dcn_lot_get_timestamp);

  /**
   * dc_msg_t
   */

  NAPI_EXPORT_FUNCTION(dcn_msg_get_chat_id);
  NAPI_EXPORT_FUNCTION(dcn_msg_get_duration);
  NAPI_EXPORT_FUNCTION(dcn_msg_get_file);
  NAPI_EXPORT_FUNCTION(dcn_msg_get_filebytes);
  NAPI_EXPORT_FUNCTION(dcn_msg_get_filemime);
  NAPI_EXPORT_FUNCTION(dcn_msg_get_filename);
  NAPI_EXPORT_FUNCTION(dcn_msg_get_from_id);
  NAPI_EXPORT_FUNCTION(dcn_msg_get_height);
  NAPI_EXPORT_FUNCTION(dcn_msg_get_id);
  NAPI_EXPORT_FUNCTION(dcn_msg_get_mediainfo);
  NAPI_EXPORT_FUNCTION(dcn_msg_get_setupcodebegin);
  NAPI_EXPORT_FUNCTION(dcn_msg_get_showpadlock);
  NAPI_EXPORT_FUNCTION(dcn_msg_get_state);
  NAPI_EXPORT_FUNCTION(dcn_msg_get_summary);
  NAPI_EXPORT_FUNCTION(dcn_msg_get_summarytext);
  NAPI_EXPORT_FUNCTION(dcn_msg_get_text);
  NAPI_EXPORT_FUNCTION(dcn_msg_get_timestamp);
  NAPI_EXPORT_FUNCTION(dcn_msg_get_type);
  NAPI_EXPORT_FUNCTION(dcn_msg_get_width);
  NAPI_EXPORT_FUNCTION(dcn_msg_is_forwarded);
  NAPI_EXPORT_FUNCTION(dcn_msg_is_increation);
  NAPI_EXPORT_FUNCTION(dcn_msg_is_info);
  NAPI_EXPORT_FUNCTION(dcn_msg_is_sent);
  NAPI_EXPORT_FUNCTION(dcn_msg_is_setupmessage);
  NAPI_EXPORT_FUNCTION(dcn_msg_is_starred);
  NAPI_EXPORT_FUNCTION(dcn_msg_latefiling_mediasize);
  NAPI_EXPORT_FUNCTION(dcn_msg_set_dimension);
  NAPI_EXPORT_FUNCTION(dcn_msg_set_duration);
  NAPI_EXPORT_FUNCTION(dcn_msg_set_file);
  NAPI_EXPORT_FUNCTION(dcn_msg_set_mediainfo);
  NAPI_EXPORT_FUNCTION(dcn_msg_set_text);
  NAPI_EXPORT_FUNCTION(dcn_msg_set_type);
}
