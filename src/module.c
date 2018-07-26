#define NAPI_EXPERIMENTAL

#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <node_api.h>
#include <pthread.h>
#include <deltachat.h>
#include "napi-macros-extensions.h"

// Context struct we need for some binding specific things. dcn_context_t will
// be applied to the dc_context created in dcn_context_new().
typedef struct dcn_context_t {
  dc_context_t* dc_context;
  napi_threadsafe_function napi_event_handler;
  int is_offline;
} dcn_context_t;

typedef struct dcn_event_t {
  int event;
  uintptr_t data1_int;
  uintptr_t data2_int;
  char* data2_str;
} dcn_event_t;


static uintptr_t dc_event_handler(dc_context_t* dc_context, int event, uintptr_t data1, uintptr_t data2)
{
  printf("dc_event_handler, event: %d\n", event);
  dcn_context_t* dcn_context = (dcn_context_t*)dc_get_userdata(dc_context);

  switch (event) {
    case DC_EVENT_IS_OFFLINE:
      return dcn_context->is_offline;

    default:
      if (dcn_context->napi_event_handler) {
        dcn_event_t* dcn_event = calloc(1, sizeof(dcn_event_t));
        dcn_event->event = event;
        dcn_event->data1_int = data1;
        dcn_event->data2_int = data2;
        dcn_event->data2_str = (DC_EVENT_DATA2_IS_STRING(event) && data2) ? strdup((char*)data2) : NULL;
        napi_call_threadsafe_function(dcn_context->napi_event_handler, dcn_event, napi_tsfn_blocking);
      } else {
        printf("Warning: napi_event_handler not set :/\n");
      }
      break;
  }

  return 0;
}

static void call_js_event_handler(napi_env env, napi_value js_callback, void* context, void* data)
{
  printf("Inside call_js_event_handler\n");
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

NAPI_METHOD(dcn_set_event_handler) {
  NAPI_ARGV(2); //TODO: Make sure we throw a helpful error if we don't get the correct count of arguments
  NAPI_DCN_CONTEXT();
  napi_value callback = argv[1];

  napi_value async_resource_name;
  NAPI_STATUS_THROWS(napi_create_string_utf8(env, "dc_event_callback", NAPI_AUTO_LENGTH, &async_resource_name));

  //TODO: Figure out how to release threadsafe_function
  NAPI_STATUS_THROWS(napi_create_threadsafe_function(
    env,
    callback,
    0,
    async_resource_name,
    0,
    3,
    0,
    NULL, // TODO: file an issue that the finalize parameter should be optional
    dcn_context,
    call_js_event_handler,
    &dcn_context->napi_event_handler));

  NAPI_RETURN_INT32(1);
}

static void* imap_thread_func(void* arg)
{
  dc_context_t* dc_context = (dc_context_t*)arg;

  while (true) {
    dc_perform_imap_jobs(dc_context);
    dc_perform_imap_fetch(dc_context);
    dc_perform_imap_idle(dc_context);
  }

  return NULL;
}

static void* smtp_thread_func(void* arg)
{
  dc_context_t* dc_context = (dc_context_t*)arg;

  while (true) {
    dc_perform_smtp_jobs(dc_context);
    dc_perform_smtp_idle(dc_context);
  }

  return NULL;
}

NAPI_METHOD(dcn_start_threads) {
  NAPI_ARGV(1);
  NAPI_DCN_CONTEXT();

  pthread_t imap_thread;
  pthread_create(&imap_thread, NULL, imap_thread_func, dcn_context->dc_context);

  pthread_t smtp_thread;
  pthread_create(&smtp_thread, NULL, smtp_thread_func, dcn_context->dc_context);

  NAPI_RETURN_INT32(1);
}

/**
 * Bindings to deltachat-core api below
 */

//NAPI_METHOD(dcn_add_address_book) {}

//NAPI_METHOD(dcn_add_contact_to_chat) {}

//NAPI_METHOD(dcn_archive_chat) {}

//NAPI_METHOD(dcn_array_get_cnt) {}

//NAPI_METHOD(dcn_array_get_id) {}

//NAPI_METHOD(dcn_array_get_ptr) {}

//NAPI_METHOD(dcn_array_get_uint) {}

//NAPI_METHOD(dcn_array_unref) {}

//NAPI_METHOD(dcn_block_contact) {}

//NAPI_METHOD(dcn_chat_get_archived) {}

//NAPI_METHOD(dcn_chat_get_draft_timestamp) {}

//NAPI_METHOD(dcn_chat_get_id) {}

//NAPI_METHOD(dcn_chat_get_name) {}

//NAPI_METHOD(dcn_chat_get_profile_image) {}

//NAPI_METHOD(dcn_chat_get_subtitle) {}

//NAPI_METHOD(dcn_chat_get_text_draft) {}

//NAPI_METHOD(dcn_chat_get_type) {}

//NAPI_METHOD(dcn_chat_is_self_talk) {}

//NAPI_METHOD(dcn_chat_is_unpromoted) {}

//NAPI_METHOD(dcn_chat_is_verified) {}

//NAPI_METHOD(dcn_chat_unref) {}

//NAPI_METHOD(dcn_chatlist_get_chat_id) {}

//NAPI_METHOD(dcn_chatlist_get_cnt) {}

//NAPI_METHOD(dcn_chatlist_get_context) {}

//NAPI_METHOD(dcn_chatlist_get_msg_id) {}

//NAPI_METHOD(dcn_chatlist_get_summary) {}

//NAPI_METHOD(dcn_chatlist_unref) {}

//NAPI_METHOD(dcn_check_password) {}

//NAPI_METHOD(dcn_check_qr) {}

//NAPI_METHOD(dcn_close) {}

NAPI_METHOD(dcn_configure) {
  NAPI_ARGV(1);
  NAPI_DCN_CONTEXT();

  dc_configure(dcn_context->dc_context);

  NAPI_RETURN_UNDEFINED();
}

//NAPI_METHOD(dcn_contact_get_addr) {}

//NAPI_METHOD(dcn_contact_get_display_name) {}

//NAPI_METHOD(dcn_contact_get_first_name) {}

//NAPI_METHOD(dcn_contact_get_id) {}

//NAPI_METHOD(dcn_contact_get_name) {}

//NAPI_METHOD(dcn_contact_get_name_n_addr) {}

//NAPI_METHOD(dcn_contact_is_blocked) {}

//NAPI_METHOD(dcn_contact_is_verified) {}

//NAPI_METHOD(dcn_contact_unref) {}

NAPI_METHOD(dcn_context_new) {
  // dc_openssl_init_not_required(); // TODO: if node.js inits OpenSSL on its own, this line should be uncommented

  dcn_context_t* dcn_context = calloc(1, sizeof(dcn_context_t));
  dcn_context->dc_context = dc_context_new(dc_event_handler, dcn_context, NULL);
  dcn_context->napi_event_handler = NULL;
  dcn_context->is_offline = 0;

  napi_value dcn_context_napi;
  napi_status status = napi_create_external(env, dcn_context, NULL, NULL, &dcn_context_napi);

  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to create external dc_context object");
  }

  return dcn_context_napi;
}

//NAPI_METHOD(dcn_context_unref) {}

//NAPI_METHOD(dcn_continue_key_transfer) {}

NAPI_METHOD(dcn_create_chat_by_contact_id) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  NAPI_INT32(contact_id, argv[1]);

  uint32_t chat_id = dc_create_chat_by_contact_id(dcn_context->dc_context, contact_id);

  NAPI_RETURN_INT32(chat_id);
}

NAPI_METHOD(dcn_create_chat_by_msg_id) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  NAPI_INT32(msg_id, argv[1]);

  uint32_t chat_id = dc_create_chat_by_msg_id(dcn_context->dc_context, msg_id);

  NAPI_RETURN_INT32(chat_id);
}

NAPI_METHOD(dcn_create_contact) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  NAPI_UTF8(name, argv[1]);
  NAPI_UTF8(addr, argv[2]);

  uint32_t contact_id = dc_create_contact(dcn_context->dc_context, name, addr);

  NAPI_RETURN_INT32(contact_id);
}

NAPI_METHOD(dcn_create_group_chat) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  NAPI_INT32(verified, argv[1]);
  NAPI_UTF8(chat_name, argv[2]);

  uint32_t chat_id = dc_create_group_chat(dcn_context->dc_context, verified, chat_name);

  NAPI_RETURN_INT32(chat_id);
}

//NAPI_METHOD(dcn_delete_chat) {}

//NAPI_METHOD(dcn_delete_contact) {}

//NAPI_METHOD(dcn_delete_msgs) {}

//NAPI_METHOD(dcn_forward_msgs) {}

//NAPI_METHOD(dcn_get_blobdir) {}

//NAPI_METHOD(dcn_get_blocked_cnt) {}

//NAPI_METHOD(dcn_get_blocked_contacts) {}

//NAPI_METHOD(dcn_get_chat) {}

//NAPI_METHOD(dcn_get_chat_contacts) {}

//NAPI_METHOD(dcn_get_chat_id_by_contact_id) {}

//NAPI_METHOD(dcn_get_chat_media) {}

//NAPI_METHOD(dcn_get_chat_msgs) {}

//NAPI_METHOD(dcn_get_chatlist) {}

NAPI_METHOD(dcn_get_config) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  NAPI_UTF8(key, argv[1]);
  NAPI_UTF8(def, argv[2]);

  char *value = dc_get_config(dcn_context->dc_context, key, def);

  NAPI_RETURN_AND_FREE_STRING(value);
}

NAPI_METHOD(dcn_get_config_int) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  NAPI_UTF8(key, argv[1]);
  NAPI_INT32(def, argv[2]);

  int value = dc_get_config_int(dcn_context->dc_context, key, def);

  NAPI_RETURN_INT32(value);
}

//NAPI_METHOD(dcn_get_contact) {}

//NAPI_METHOD(dcn_get_contact_encrinfo) {}

//NAPI_METHOD(dcn_get_contacts) {}

//NAPI_METHOD(dcn_get_fresh_msg_cnt) {}

//NAPI_METHOD(dcn_get_fresh_msgs) {}

//NAPI_METHOD(dcn_get_info) {}

//NAPI_METHOD(dcn_get_msg) {}

//NAPI_METHOD(dcn_get_msg_cnt) {}

//NAPI_METHOD(dcn_get_msg_info) {}

//NAPI_METHOD(dcn_get_next_media) {}

//NAPI_METHOD(dcn_get_securejoin_qr) {}

//NAPI_METHOD(dcn_get_userdata) {}

//NAPI_METHOD(dcn_imex) {}

//NAPI_METHOD(dcn_imex_has_backup) {}

//NAPI_METHOD(dcn_initiate_key_transfer) {}

//NAPI_METHOD(dcn_interrupt_imap_idle) {}

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

//NAPI_METHOD(dcn_lot_get_id) {}

//NAPI_METHOD(dcn_lot_get_state) {}

//NAPI_METHOD(dcn_lot_get_text1) {}

//NAPI_METHOD(dcn_lot_get_text1_meaning) {}

//NAPI_METHOD(dcn_lot_get_text2) {}

//NAPI_METHOD(dcn_lot_get_timestamp) {}

//NAPI_METHOD(dcn_lot_unref) {}

//NAPI_METHOD(dcn_marknoticed_chat) {}

//NAPI_METHOD(dcn_marknoticed_contact) {}

//NAPI_METHOD(dcn_markseen_msgs) {}

//NAPI_METHOD(dcn_msg_get_chat_id) {}

//NAPI_METHOD(dcn_msg_get_duration) {}

//NAPI_METHOD(dcn_msg_get_file) {}

//NAPI_METHOD(dcn_msg_get_filebytes) {}

//NAPI_METHOD(dcn_msg_get_filemime) {}

//NAPI_METHOD(dcn_msg_get_filename) {}

//NAPI_METHOD(dcn_msg_get_from_id) {}

//NAPI_METHOD(dcn_msg_get_height) {}

//NAPI_METHOD(dcn_msg_get_id) {}

//NAPI_METHOD(dcn_msg_get_mediainfo) {}

//NAPI_METHOD(dcn_msg_get_setupcodebegin) {}

//NAPI_METHOD(dcn_msg_get_showpadlock) {}

//NAPI_METHOD(dcn_msg_get_state) {}

//NAPI_METHOD(dcn_msg_get_summary) {}

//NAPI_METHOD(dcn_msg_get_summarytext) {}

//NAPI_METHOD(dcn_msg_get_text) {}

//NAPI_METHOD(dcn_msg_get_timestamp) {}

//NAPI_METHOD(dcn_msg_get_type) {}

//NAPI_METHOD(dcn_msg_get_width) {}

//NAPI_METHOD(dcn_msg_is_forwarded) {}

//NAPI_METHOD(dcn_msg_is_increation) {}

//NAPI_METHOD(dcn_msg_is_info) {}

//NAPI_METHOD(dcn_msg_is_sent) {}

//NAPI_METHOD(dcn_msg_is_setupmessage) {}

//NAPI_METHOD(dcn_msg_is_starred) {}

//NAPI_METHOD(dcn_msg_latefiling_mediasize) {}

//NAPI_METHOD(dcn_msg_new) {}

//NAPI_METHOD(dcn_msg_set_dimension) {}

//NAPI_METHOD(dcn_msg_set_duration) {}

//NAPI_METHOD(dcn_msg_set_file) {}

//NAPI_METHOD(dcn_msg_set_mediainfo) {}

//NAPI_METHOD(dcn_msg_set_text) {}

//NAPI_METHOD(dcn_msg_set_type) {}

//NAPI_METHOD(dcn_msg_unref) {}

NAPI_METHOD(dcn_open) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  NAPI_UTF8(dbfile, argv[1]);
  NAPI_UTF8(blobdir, argv[2]);

  // blobdir may be the empty string or NULL for default blobdir
  printf("dcn_open dbfile: %s blobdir %s\n", dbfile, blobdir);
  int status = dc_open(dcn_context->dc_context, dbfile, blobdir);

  NAPI_RETURN_INT32(status);
}

//NAPI_METHOD(dcn_remove_contact_from_chat) {}

//NAPI_METHOD(dcn_search_msgs) {}

//NAPI_METHOD(dcn_send_audio_msg) {}

//NAPI_METHOD(dcn_send_file_msg) {}

//NAPI_METHOD(dcn_send_image_msg) {}

//NAPI_METHOD(dcn_send_msg) {}

NAPI_METHOD(dcn_send_text_msg) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  NAPI_INT32(chat_id, argv[1]);
  NAPI_UTF8(text, argv[2]);

  uint32_t msg_id = dc_send_text_msg(dcn_context->dc_context, chat_id, text);

  NAPI_RETURN_INT32(msg_id);
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

  NAPI_RETURN_INT32(status);
}

NAPI_METHOD(dcn_set_config_int) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  NAPI_UTF8(key, argv[1]);
  NAPI_INT32(value, argv[2]);

  int status = dc_set_config_int(dcn_context->dc_context, key, value);

  NAPI_RETURN_INT32(status);
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

//NAPI_METHOD(dcn_stop_ongoing_process) {}

NAPI_INIT() {
  // Setup functions
  NAPI_EXPORT_FUNCTION(dcn_set_event_handler);
  NAPI_EXPORT_FUNCTION(dcn_start_threads);

  // deltachat-core api
  //NAPI_EXPORT_FUNCTION(dcn_add_address_book);
  //NAPI_EXPORT_FUNCTION(dcn_add_contact_to_chat);
  //NAPI_EXPORT_FUNCTION(dcn_archive_chat);
  //NAPI_EXPORT_FUNCTION(dcn_array_get_cnt);
  //NAPI_EXPORT_FUNCTION(dcn_array_get_id);
  //NAPI_EXPORT_FUNCTION(dcn_array_get_ptr);
  //NAPI_EXPORT_FUNCTION(dcn_array_get_uint);
  //NAPI_EXPORT_FUNCTION(dcn_array_unref);
  //NAPI_EXPORT_FUNCTION(dcn_block_contact);
  //NAPI_EXPORT_FUNCTION(dcn_chat_get_archived);
  //NAPI_EXPORT_FUNCTION(dcn_chat_get_draft_timestamp);
  //NAPI_EXPORT_FUNCTION(dcn_chat_get_id);
  //NAPI_EXPORT_FUNCTION(dcn_chat_get_name);
  //NAPI_EXPORT_FUNCTION(dcn_chat_get_profile_image);
  //NAPI_EXPORT_FUNCTION(dcn_chat_get_subtitle);
  //NAPI_EXPORT_FUNCTION(dcn_chat_get_text_draft);
  //NAPI_EXPORT_FUNCTION(dcn_chat_get_type);
  //NAPI_EXPORT_FUNCTION(dcn_chat_is_self_talk);
  //NAPI_EXPORT_FUNCTION(dcn_chat_is_unpromoted);
  //NAPI_EXPORT_FUNCTION(dcn_chat_is_verified);
  //NAPI_EXPORT_FUNCTION(dcn_chat_unref);
  //NAPI_EXPORT_FUNCTION(dcn_chatlist_get_chat_id);
  //NAPI_EXPORT_FUNCTION(dcn_chatlist_get_cnt);
  //NAPI_EXPORT_FUNCTION(dcn_chatlist_get_context);
  //NAPI_EXPORT_FUNCTION(dcn_chatlist_get_msg_id);
  //NAPI_EXPORT_FUNCTION(dcn_chatlist_get_summary);
  //NAPI_EXPORT_FUNCTION(dcn_chatlist_unref);
  //NAPI_EXPORT_FUNCTION(dcn_check_password);
  //NAPI_EXPORT_FUNCTION(dcn_check_qr);
  //NAPI_EXPORT_FUNCTION(dcn_close);
  NAPI_EXPORT_FUNCTION(dcn_configure);
  //NAPI_EXPORT_FUNCTION(dcn_contact_get_addr);
  //NAPI_EXPORT_FUNCTION(dcn_contact_get_display_name);
  //NAPI_EXPORT_FUNCTION(dcn_contact_get_first_name);
  //NAPI_EXPORT_FUNCTION(dcn_contact_get_id);
  //NAPI_EXPORT_FUNCTION(dcn_contact_get_name);
  //NAPI_EXPORT_FUNCTION(dcn_contact_get_name_n_addr);
  //NAPI_EXPORT_FUNCTION(dcn_contact_is_blocked);
  //NAPI_EXPORT_FUNCTION(dcn_contact_is_verified);
  //NAPI_EXPORT_FUNCTION(dcn_contact_unref);
  NAPI_EXPORT_FUNCTION(dcn_context_new);
  //NAPI_EXPORT_FUNCTION(dcn_context_unref);
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
  //NAPI_EXPORT_FUNCTION(dcn_get_chat);
  //NAPI_EXPORT_FUNCTION(dcn_get_chat_contacts);
  //NAPI_EXPORT_FUNCTION(dcn_get_chat_id_by_contact_id);
  //NAPI_EXPORT_FUNCTION(dcn_get_chat_media);
  //NAPI_EXPORT_FUNCTION(dcn_get_chat_msgs);
  //NAPI_EXPORT_FUNCTION(dcn_get_chatlist);
  NAPI_EXPORT_FUNCTION(dcn_get_config);
  NAPI_EXPORT_FUNCTION(dcn_get_config_int);
  //NAPI_EXPORT_FUNCTION(dcn_get_contact);
  //NAPI_EXPORT_FUNCTION(dcn_get_contact_encrinfo);
  //NAPI_EXPORT_FUNCTION(dcn_get_contacts);
  //NAPI_EXPORT_FUNCTION(dcn_get_fresh_msg_cnt);
  //NAPI_EXPORT_FUNCTION(dcn_get_fresh_msgs);
  //NAPI_EXPORT_FUNCTION(dcn_get_info);
  //NAPI_EXPORT_FUNCTION(dcn_get_msg);
  //NAPI_EXPORT_FUNCTION(dcn_get_msg_cnt);
  //NAPI_EXPORT_FUNCTION(dcn_get_msg_info);
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
  //NAPI_EXPORT_FUNCTION(dcn_lot_get_id);
  //NAPI_EXPORT_FUNCTION(dcn_lot_get_state);
  //NAPI_EXPORT_FUNCTION(dcn_lot_get_text1);
  //NAPI_EXPORT_FUNCTION(dcn_lot_get_text1_meaning);
  //NAPI_EXPORT_FUNCTION(dcn_lot_get_text2);
  //NAPI_EXPORT_FUNCTION(dcn_lot_get_timestamp);
  //NAPI_EXPORT_FUNCTION(dcn_lot_unref);
  //NAPI_EXPORT_FUNCTION(dcn_marknoticed_chat);
  //NAPI_EXPORT_FUNCTION(dcn_marknoticed_contact);
  //NAPI_EXPORT_FUNCTION(dcn_markseen_msgs);
  //NAPI_EXPORT_FUNCTION(dcn_msg_get_chat_id);
  //NAPI_EXPORT_FUNCTION(dcn_msg_get_duration);
  //NAPI_EXPORT_FUNCTION(dcn_msg_get_file);
  //NAPI_EXPORT_FUNCTION(dcn_msg_get_filebytes);
  //NAPI_EXPORT_FUNCTION(dcn_msg_get_filemime);
  //NAPI_EXPORT_FUNCTION(dcn_msg_get_filename);
  //NAPI_EXPORT_FUNCTION(dcn_msg_get_from_id);
  //NAPI_EXPORT_FUNCTION(dcn_msg_get_height);
  //NAPI_EXPORT_FUNCTION(dcn_msg_get_id);
  //NAPI_EXPORT_FUNCTION(dcn_msg_get_mediainfo);
  //NAPI_EXPORT_FUNCTION(dcn_msg_get_setupcodebegin);
  //NAPI_EXPORT_FUNCTION(dcn_msg_get_showpadlock);
  //NAPI_EXPORT_FUNCTION(dcn_msg_get_state);
  //NAPI_EXPORT_FUNCTION(dcn_msg_get_summary);
  //NAPI_EXPORT_FUNCTION(dcn_msg_get_summarytext);
  //NAPI_EXPORT_FUNCTION(dcn_msg_get_text);
  //NAPI_EXPORT_FUNCTION(dcn_msg_get_timestamp);
  //NAPI_EXPORT_FUNCTION(dcn_msg_get_type);
  //NAPI_EXPORT_FUNCTION(dcn_msg_get_width);
  //NAPI_EXPORT_FUNCTION(dcn_msg_is_forwarded);
  //NAPI_EXPORT_FUNCTION(dcn_msg_is_increation);
  //NAPI_EXPORT_FUNCTION(dcn_msg_is_info);
  //NAPI_EXPORT_FUNCTION(dcn_msg_is_sent);
  //NAPI_EXPORT_FUNCTION(dcn_msg_is_setupmessage);
  //NAPI_EXPORT_FUNCTION(dcn_msg_is_starred);
  //NAPI_EXPORT_FUNCTION(dcn_msg_latefiling_mediasize);
  //NAPI_EXPORT_FUNCTION(dcn_msg_new);
  //NAPI_EXPORT_FUNCTION(dcn_msg_set_dimension);
  //NAPI_EXPORT_FUNCTION(dcn_msg_set_duration);
  //NAPI_EXPORT_FUNCTION(dcn_msg_set_file);
  //NAPI_EXPORT_FUNCTION(dcn_msg_set_mediainfo);
  //NAPI_EXPORT_FUNCTION(dcn_msg_set_text);
  //NAPI_EXPORT_FUNCTION(dcn_msg_set_type);
  //NAPI_EXPORT_FUNCTION(dcn_msg_unref);
  NAPI_EXPORT_FUNCTION(dcn_open);
  //NAPI_EXPORT_FUNCTION(dcn_remove_contact_from_chat);
  //NAPI_EXPORT_FUNCTION(dcn_search_msgs);
  //NAPI_EXPORT_FUNCTION(dcn_send_audio_msg);
  //NAPI_EXPORT_FUNCTION(dcn_send_file_msg);
  //NAPI_EXPORT_FUNCTION(dcn_send_image_msg);
  //NAPI_EXPORT_FUNCTION(dcn_send_msg);
  NAPI_EXPORT_FUNCTION(dcn_send_text_msg);
  //NAPI_EXPORT_FUNCTION(dcn_send_vcard_msg);
  //NAPI_EXPORT_FUNCTION(dcn_send_video_msg);
  //NAPI_EXPORT_FUNCTION(dcn_send_voice_msg);
  //NAPI_EXPORT_FUNCTION(dcn_set_chat_name);
  //NAPI_EXPORT_FUNCTION(dcn_set_chat_profile_image);
  NAPI_EXPORT_FUNCTION(dcn_set_config);
  NAPI_EXPORT_FUNCTION(dcn_set_config_int);
  NAPI_EXPORT_FUNCTION(dcn_set_offline);
  //NAPI_EXPORT_FUNCTION(dcn_set_text_draft);
  //NAPI_EXPORT_FUNCTION(dcn_star_msgs);
  //NAPI_EXPORT_FUNCTION(dcn_stop_ongoing_process);
}
