#define NAPI_VERSION 4
#define NAPI_EXPERIMENTAL

#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <node_api.h>
#include <uv.h>
#include <deltachat-ffi/deltachat.h>
#include "napi-macros-extensions.h"

#ifdef DEBUG
#define TRACE(fmt, ...) fprintf(stderr, "> module.c:%d %s() " fmt "\n", __LINE__, __func__, ##__VA_ARGS__)
#else
#define TRACE(fmt, ...)
#endif

/**
 * Custom context
 */
typedef struct dcn_context_t {
  dc_context_t* dc_context;
  napi_threadsafe_function threadsafe_event_handler;
  uv_thread_t event_handler_thread;
  int gc;
} dcn_context_t;



/**
 * Finalize functions. These are called once the corresponding
 * external is garbage collected on the JavaScript side.
 */

static void finalize_chat(napi_env env, void* data, void* hint) {
  if (data) {
    dc_chat_t* chat = (dc_chat_t*)data;
    //TRACE("cleaning up chat %d", dc_chat_get_id(chat));
    dc_chat_unref(chat);
  }
}

static void finalize_chatlist(napi_env env, void* data, void* hint) {
  if (data) {
    //TRACE("cleaning up chatlist object");
    dc_chatlist_unref((dc_chatlist_t*)data);
  }
}

static void finalize_contact(napi_env env, void* data, void* hint) {
  if (data) {
    dc_contact_t* contact = (dc_contact_t*)data;
    //TRACE("cleaning up contact %d", dc_contact_get_id(contact));
    dc_contact_unref(contact);
  }
}

static void finalize_lot(napi_env env, void* data, void* hint) {
  if (data) {
    //TRACE("cleaning up lot");
    dc_lot_unref((dc_lot_t*)data);
  }
}

static void finalize_array(napi_env env, void* data, void* hint) {
  if (data) {
    //TRACE("cleaning up array");
    dc_array_unref((dc_array_t*)data);
  }
}

static void finalize_msg(napi_env env, void* data, void* hint) {
  if (data) {
    dc_msg_t* msg = (dc_msg_t*)data;
    //TRACE("cleaning up message %d", dc_msg_get_id(msg));
    dc_msg_unref(msg);
  }
}

static void finalize_provider(napi_env env, void* data, void* hint) {
  if (data) {
    dc_provider_t* provider = (dc_provider_t*)data;
    //TRACE("cleaning up provider");
    dc_provider_unref(provider);
  }
}

/**
 * Helpers.
 */

static uint32_t* js_array_to_uint32(napi_env env, napi_value js_array, uint32_t* length) {
  *length = 0;
  NAPI_STATUS_THROWS(napi_get_array_length(env, js_array, length));

  uint32_t* array = calloc(*length, sizeof(uint32_t));

  for (uint32_t i = 0; i < *length; i++) {
    napi_value napi_element;
    NAPI_STATUS_THROWS(napi_get_element(env, js_array, i, &napi_element));
    NAPI_STATUS_THROWS(napi_get_value_uint32(env, napi_element, &array[i]));
  }

  return array;
}

static napi_value dc_array_to_js_array(napi_env env, dc_array_t* array) {
  napi_value js_array;

  const int length = dc_array_get_cnt(array);
  NAPI_STATUS_THROWS(napi_create_array_with_length(env, length, &js_array));

  if (length > 0) {
    for (int i = 0; i < length; i++) {
      const uint32_t id = dc_array_get_id(array, i);
      napi_value napi_id;
      NAPI_STATUS_THROWS(napi_create_uint32(env, id, &napi_id));
      NAPI_STATUS_THROWS(napi_set_element(env, js_array, i, napi_id));
    }
  }

  return js_array;
}

/**
 * Main context.
 */

NAPI_METHOD(dcn_context_new) {
  NAPI_ARGV(1);

  NAPI_ARGV_UTF8_MALLOC(db_file, 0);

  TRACE("creating new dc_context");

  dcn_context_t* dcn_context = calloc(1, sizeof(dcn_context_t));
  dcn_context->dc_context = dc_context_new("deltachat-node", db_file, NULL);


  napi_value result;
  NAPI_STATUS_THROWS(napi_create_external(env, dcn_context,
                                          NULL, NULL, &result));
  return result;
}

/**
 * Event struct for calling back to JavaScript
 */
typedef struct dcn_event_t {
  int event;
  uintptr_t data1_int;
  uintptr_t data2_int;
  char* data1_str;
  char* data2_str;
} dcn_event_t;


static void event_handler_thread_func(void* arg)
{
  dcn_context_t* dcn_context = (dcn_context_t*)arg;
  dc_context_t* dc_context = dcn_context->dc_context;


  TRACE("event_handler_thread_func starting");


  dc_event_emitter_t* emitter = dc_get_event_emitter(dc_context);
  dc_event_t* event;
  while ((event = dc_get_next_event(emitter)) != NULL) {
    if (!dcn_context->threadsafe_event_handler) {
      TRACE("threadsafe_event_handler not set, bailing");
      break;
    }

    // Don't process events if we're being garbage collected!
    if (dcn_context->gc == 1) {
      TRACE("dc_context has been destroyed, bailing");
      break;
    }


    napi_status status = napi_call_threadsafe_function(dcn_context->threadsafe_event_handler, event, napi_tsfn_blocking);

    if (status == napi_closing) {
      TRACE("JS function got released, bailing");
      break;
    }
  }

  dc_event_emitter_unref(emitter);

  TRACE("event_handler_thread_func ended");

  napi_release_threadsafe_function(dcn_context->threadsafe_event_handler, napi_tsfn_release);
}

static void call_js_event_handler(napi_env env, napi_value js_callback, void* _context, void* data)
{
  dc_event_t* dc_event = (dc_event_t*)data;

  napi_value global;
  napi_status status = napi_get_global(env, &global);

  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to get global");
  }

#define CALL_JS_CALLBACK_ARGC 3

  const int argc = CALL_JS_CALLBACK_ARGC;
  napi_value argv[CALL_JS_CALLBACK_ARGC];

  const int event_id = dc_event_get_id(dc_event);

  status = napi_create_int32(env, event_id, &argv[0]);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to create argv[0] for event_handler arguments");
  }

  status = napi_create_int32(env, dc_event_get_data1_int(dc_event), &argv[1]);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to create argv[1] for event_handler arguments");
  }

  if DC_EVENT_DATA2_IS_STRING(event_id) {
    char* data2_string = dc_event_get_data2_str(dc_event);
    status = napi_create_string_utf8(env, data2_string, NAPI_AUTO_LENGTH, &argv[2]);
    if (status != napi_ok) {
      napi_throw_error(env, NULL, "Unable to create argv[2] for event_handler arguments");
    }
    free(data2_string);
  } else {
    status = napi_create_int32(env, dc_event_get_data2_int(dc_event), &argv[2]);
    if (status != napi_ok) {
      napi_throw_error(env, NULL, "Unable to create argv[2] for event_handler arguments");
    }
  }

  dc_event_unref(dc_event);
  dc_event = NULL;

  TRACE("calling back into js");

  napi_value result;
  status = napi_call_function(
    env,
    global,
    js_callback,
    argc,
    argv,
    &result);

  if (status != napi_ok) {
    TRACE("Unable to call event_handler callback");
  }
}


NAPI_METHOD(dcn_start_event_handler) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  napi_value callback = argv[1];

  TRACE("calling..");
  napi_value async_resource_name;
  NAPI_STATUS_THROWS(napi_create_string_utf8(env, "dc_event_callback", NAPI_AUTO_LENGTH, &async_resource_name));

  TRACE("creating threadsafe function..");

  NAPI_STATUS_THROWS(napi_create_threadsafe_function(
    env,
    callback,
    0,
    async_resource_name,
    1,
    1,
    NULL,
    NULL,
    dcn_context,
    call_js_event_handler,
    &dcn_context->threadsafe_event_handler));
  TRACE("done");

  dcn_context->gc = 0;
  TRACE("creating uv thread..");
  uv_thread_create(&dcn_context->event_handler_thread, event_handler_thread_func, dcn_context);

  NAPI_RETURN_UNDEFINED();
}


NAPI_METHOD(dcn_context_unref) {
  NAPI_ARGV(1);
  NAPI_DCN_CONTEXT();

  TRACE("Unrefing dc_context");
  dc_context_unref(dcn_context->dc_context);
  dcn_context->dc_context = NULL;

  NAPI_RETURN_UNDEFINED();

}

/**
 * Static functions
 */

NAPI_METHOD(dcn_maybe_valid_addr) {
  NAPI_ARGV(1);
  NAPI_ARGV_UTF8_MALLOC(addr, 0);

  //TRACE("calling..");
  int result = dc_may_be_valid_addr(addr);
  //TRACE("result %d", result);

  free(addr);

  NAPI_RETURN_INT32(result);
}

/**
 * dcn_context_t
 */

NAPI_METHOD(dcn_add_address_book) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UTF8_MALLOC(address_book, 1);

  //TRACE("calling..");
  int result = dc_add_address_book(dcn_context->dc_context, address_book);
  //TRACE("result %d", result);

  free(address_book);

  NAPI_RETURN_INT32(result);
}

NAPI_METHOD(dcn_add_contact_to_chat) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UINT32(chat_id, 1);
  NAPI_ARGV_UINT32(contact_id, 2);

  //TRACE("calling..");
  int result = dc_add_contact_to_chat(dcn_context->dc_context,
                                      chat_id, contact_id);
  //TRACE("result %d", result);

  NAPI_RETURN_INT32(result);
}

NAPI_METHOD(dcn_add_device_msg) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();

  NAPI_ARGV_UTF8_MALLOC(label, 1);

  //TRACE("calling..");
  dc_msg_t* dc_msg = NULL;
  napi_get_value_external(env, argv[2], (void**)&dc_msg);

  uint32_t msg_id = dc_add_device_msg(dcn_context->dc_context, label, dc_msg);

  free(label);
  //TRACE("done");

  NAPI_RETURN_UINT32(msg_id);
}

NAPI_METHOD(dcn_archive_chat) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UINT32(chat_id, 1);
  NAPI_ARGV_INT32(archive, 2);

  //TRACE("calling..");
  dc_archive_chat(dcn_context->dc_context, chat_id, archive);
  //TRACE("done");

  NAPI_RETURN_UNDEFINED();
}

NAPI_METHOD(dcn_block_contact) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UINT32(contact_id, 1);
  NAPI_ARGV_INT32(new_blocking, 2);

  //TRACE("calling..");
  dc_block_contact(dcn_context->dc_context, contact_id, new_blocking);
  //TRACE("done");

  NAPI_RETURN_UNDEFINED();
}

NAPI_METHOD(dcn_check_qr) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UTF8_MALLOC(qr, 1);

  //TRACE("calling..");
  dc_lot_t* lot = dc_check_qr(dcn_context->dc_context, qr);

  free(qr);

  napi_value result;
  if (lot == NULL) {
    NAPI_STATUS_THROWS(napi_get_null(env, &result));
  } else {
    NAPI_STATUS_THROWS(napi_create_external(env, lot,
                                            finalize_lot,
                                            NULL, &result));
  }
  //TRACE("done");

  return result;
}

NAPI_METHOD(dcn_configure) {
  NAPI_ARGV(1);
  NAPI_DCN_CONTEXT();

  TRACE("calling..");
  dc_configure(dcn_context->dc_context);
  TRACE("done");

  NAPI_RETURN_UNDEFINED();
}

NAPI_ASYNC_CARRIER_BEGIN(dcn_continue_key_transfer)
  int msg_id;
  char* setup_code;
  int result;
NAPI_ASYNC_CARRIER_END(dcn_continue_key_transfer)


NAPI_ASYNC_EXECUTE(dcn_continue_key_transfer) {
  NAPI_ASYNC_GET_CARRIER(dcn_continue_key_transfer)
  carrier->result = dc_continue_key_transfer(carrier->dcn_context->dc_context,
                                        carrier->msg_id, carrier->setup_code);
}

NAPI_ASYNC_COMPLETE(dcn_continue_key_transfer) {
  NAPI_ASYNC_GET_CARRIER(dcn_continue_key_transfer)
  if (status != napi_ok) {
    napi_throw_type_error(env, NULL, "Execute callback failed.");
    return;
  }

#define DCN_CONTINUE_KEY_TRANSFER_CALLBACK_ARGC 1

  const int argc = DCN_CONTINUE_KEY_TRANSFER_CALLBACK_ARGC;
  napi_value argv[DCN_CONTINUE_KEY_TRANSFER_CALLBACK_ARGC];
  NAPI_STATUS_THROWS(napi_create_int32(env, carrier->result, &argv[0]));

  NAPI_ASYNC_CALL_AND_DELETE_CB()
  dc_str_unref(carrier->setup_code);
  free(carrier);
}

NAPI_METHOD(dcn_continue_key_transfer) {
  NAPI_ARGV(4);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UINT32(msg_id, 1);
  NAPI_ARGV_UTF8_MALLOC(setup_code, 2);
  NAPI_ASYNC_NEW_CARRIER(dcn_continue_key_transfer);
  carrier->msg_id = msg_id;
  carrier->setup_code = setup_code;

  NAPI_ASYNC_QUEUE_WORK(dcn_continue_key_transfer, argv[3]);
  NAPI_RETURN_UNDEFINED();
}

NAPI_ASYNC_CARRIER_BEGIN(dcn_join_securejoin)
  char* qr_code;
  int result;
NAPI_ASYNC_CARRIER_END(dcn_join_securejoin)


NAPI_ASYNC_EXECUTE(dcn_join_securejoin) {
  NAPI_ASYNC_GET_CARRIER(dcn_join_securejoin)
  carrier->result = dc_join_securejoin(
    carrier->dcn_context->dc_context,
    carrier->qr_code
  );
}

NAPI_ASYNC_COMPLETE(dcn_join_securejoin) {
  NAPI_ASYNC_GET_CARRIER(dcn_join_securejoin)
  if (status != napi_ok) {
    napi_throw_type_error(env, NULL, "Execute callback failed.");
    return;
  }

#define DCN_JOIN_SECURE_CALLBACK_ARGC 1

  const int argc = DCN_JOIN_SECURE_CALLBACK_ARGC;
  napi_value argv[DCN_JOIN_SECURE_CALLBACK_ARGC];
  NAPI_STATUS_THROWS(napi_create_int32(env, carrier->result, &argv[0]));

  NAPI_ASYNC_CALL_AND_DELETE_CB()
  dc_str_unref(carrier->qr_code);
  free(carrier);
}

NAPI_METHOD(dcn_join_securejoin) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UTF8_MALLOC(qr_code, 1);
  NAPI_ASYNC_NEW_CARRIER(dcn_join_securejoin);
  carrier->qr_code = qr_code;

  NAPI_ASYNC_QUEUE_WORK(dcn_join_securejoin, argv[2]);
  NAPI_RETURN_UNDEFINED();
}

NAPI_METHOD(dcn_create_chat_by_contact_id) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_INT32(contact_id, 1);

  //TRACE("calling..");
  uint32_t chat_id = dc_create_chat_by_contact_id(dcn_context->dc_context, contact_id);
  //TRACE("result %d", chat_id);

  NAPI_RETURN_UINT32(chat_id);
}

NAPI_METHOD(dcn_create_chat_by_msg_id) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_INT32(msg_id, 1);

  //TRACE("calling..");
  uint32_t chat_id = dc_create_chat_by_msg_id(dcn_context->dc_context, msg_id);
  //TRACE("result %d", chat_id);

  NAPI_RETURN_UINT32(chat_id);
}

NAPI_METHOD(dcn_create_contact) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UTF8_MALLOC(name, 1);
  NAPI_ARGV_UTF8_MALLOC(addr, 2);

  //TRACE("calling..");
  uint32_t contact_id = dc_create_contact(dcn_context->dc_context, name, addr);
  //TRACE("result %d", contact_id);

  free(name);
  free(addr);

  NAPI_RETURN_UINT32(contact_id);
}

NAPI_METHOD(dcn_create_group_chat) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_INT32(verified, 1);
  NAPI_ARGV_UTF8_MALLOC(chat_name, 2);

  //TRACE("calling..");
  uint32_t chat_id = dc_create_group_chat(dcn_context->dc_context, verified, chat_name);
  //TRACE("result %d", chat_id);

  free(chat_name);

  NAPI_RETURN_UINT32(chat_id);
}

NAPI_METHOD(dcn_delete_chat) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UINT32(chat_id, 1);

  //TRACE("calling..");
  dc_delete_chat(dcn_context->dc_context, chat_id);
  //TRACE("done");

  NAPI_RETURN_UNDEFINED();
}

NAPI_METHOD(dcn_delete_contact) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UINT32(contact_id, 1);

  //TRACE("calling..");
  int result = dc_delete_contact(dcn_context->dc_context, contact_id);
  //TRACE("result %d", result);

  NAPI_RETURN_INT32(result);
}

NAPI_METHOD(dcn_delete_msgs) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  napi_value js_array = argv[1];

  //TRACE("calling..");
  uint32_t length;
  uint32_t* msg_ids = js_array_to_uint32(env, js_array, &length);
  dc_delete_msgs(dcn_context->dc_context, msg_ids, length);
  free(msg_ids);
  //TRACE("done");

  NAPI_RETURN_UNDEFINED();
}

NAPI_METHOD(dcn_forward_msgs) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  napi_value js_array = argv[1];
  NAPI_ARGV_UINT32(chat_id, 2);

  //TRACE("calling..");
  uint32_t length;
  uint32_t* msg_ids = js_array_to_uint32(env, js_array, &length);
  dc_forward_msgs(dcn_context->dc_context, msg_ids, length, chat_id);
  free(msg_ids);
  //TRACE("done");

  NAPI_RETURN_UNDEFINED();
}

NAPI_METHOD(dcn_get_blobdir) {
  NAPI_ARGV(1);
  NAPI_DCN_CONTEXT();

  //TRACE("calling..");
  char* blobdir = dc_get_blobdir(dcn_context->dc_context);
  //TRACE("result %s", blobdir);

  NAPI_RETURN_AND_UNREF_STRING(blobdir);
}

NAPI_METHOD(dcn_get_blocked_cnt) {
  NAPI_ARGV(1);
  NAPI_DCN_CONTEXT();

  //TRACE("calling..");
  int blocked_cnt = dc_get_blocked_cnt(dcn_context->dc_context);
  //TRACE("result %d", blocked_cnt);

  NAPI_RETURN_INT32(blocked_cnt);
}

NAPI_METHOD(dcn_get_blocked_contacts) {
  NAPI_ARGV(1);
  NAPI_DCN_CONTEXT();

  //TRACE("calling..");
  dc_array_t* contacts = dc_get_blocked_contacts(dcn_context->dc_context);
  napi_value js_array = dc_array_to_js_array(env, contacts);
  dc_array_unref(contacts);
  //TRACE("done");

  return js_array;
}

NAPI_METHOD(dcn_get_chat) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UINT32(chat_id, 1);

  //TRACE("calling..");
  napi_value result;
  dc_chat_t* chat = dc_get_chat(dcn_context->dc_context, chat_id);

  if (chat == NULL) {
    NAPI_STATUS_THROWS(napi_get_null(env, &result));
  } else {
    NAPI_STATUS_THROWS(napi_create_external(env, chat, finalize_chat,
                                            NULL, &result));
  }
  //TRACE("done");

  return result;
}

NAPI_METHOD(dcn_get_chat_contacts) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UINT32(chat_id, 1);

  //TRACE("calling..");
  dc_array_t* contacts = dc_get_chat_contacts(dcn_context->dc_context, chat_id);
  napi_value js_array = dc_array_to_js_array(env, contacts);
  dc_array_unref(contacts);
  //TRACE("done");

  return js_array;
}

NAPI_METHOD(dcn_get_chat_id_by_contact_id) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UINT32(contact_id, 1);

  //TRACE("calling..");
  uint32_t chat_id = dc_get_chat_id_by_contact_id(dcn_context->dc_context,
                                                  contact_id);
  //TRACE("result %d", chat_id);

  NAPI_RETURN_UINT32(chat_id);
}

NAPI_METHOD(dcn_get_chat_media) {
  NAPI_ARGV(5);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UINT32(chat_id, 1);
  NAPI_ARGV_INT32(msg_type1, 2);
  NAPI_ARGV_INT32(msg_type2, 3);
  NAPI_ARGV_INT32(msg_type3, 4);

  //TRACE("calling..");
  dc_array_t* msg_ids = dc_get_chat_media(dcn_context->dc_context,
                                          chat_id,
                                          msg_type1,
                                          msg_type2,
                                          msg_type3);
  napi_value js_array = dc_array_to_js_array(env, msg_ids);
  dc_array_unref(msg_ids);
  //TRACE("done");

  return js_array;
}

NAPI_METHOD(dcn_get_mime_headers) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UINT32(msg_id, 1);

  //TRACE("calling..");
  char* headers = dc_get_mime_headers(dcn_context->dc_context, msg_id);
  //TRACE("result %s", headers);

  NAPI_RETURN_AND_UNREF_STRING(headers);
}

NAPI_METHOD(dcn_get_chat_msgs) {
  NAPI_ARGV(4);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UINT32(chat_id, 1);
  NAPI_ARGV_UINT32(flags, 2);
  NAPI_ARGV_UINT32(marker1before, 3);

  //TRACE("calling..");
  dc_array_t* msg_ids = dc_get_chat_msgs(dcn_context->dc_context,
                                         chat_id,
                                         flags,
                                         marker1before);
  napi_value js_array = dc_array_to_js_array(env, msg_ids);
  dc_array_unref(msg_ids);
  //TRACE("done");

  return js_array;
}

NAPI_METHOD(dcn_get_chatlist) {
  NAPI_ARGV(4);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_INT32(listflags, 1);
  NAPI_ARGV_UTF8_MALLOC(query, 2);
  NAPI_ARGV_UINT32(query_contact_id, 3);

  //TRACE("calling..");
  dc_chatlist_t* chatlist = dc_get_chatlist(dcn_context->dc_context,
                                            listflags,
                                            query && query[0] ? query : NULL,
                                            query_contact_id);

  free(query);

  napi_value result;
  NAPI_STATUS_THROWS(napi_create_external(env,
                                          chatlist,
                                          finalize_chatlist,
                                          NULL,
                                          &result));
  //TRACE("done");

  return result;
}

NAPI_METHOD(dcn_get_config) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UTF8_MALLOC(key, 1);

  //TRACE("calling..");
  char *value = dc_get_config(dcn_context->dc_context, key);
  //TRACE("result %s", value);

  free(key);

  NAPI_RETURN_AND_UNREF_STRING(value);
}

NAPI_METHOD(dcn_get_contact) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UINT32(contact_id, 1);

  //TRACE("calling..");
  napi_value result;
  dc_contact_t* contact = dc_get_contact(dcn_context->dc_context, contact_id);

  if (contact == NULL) {
    NAPI_STATUS_THROWS(napi_get_null(env, &result));
  } else {
    NAPI_STATUS_THROWS(napi_create_external(env, contact,
                                            finalize_contact,
                                            NULL, &result));
  }
  //TRACE("done");

  return result;
}

NAPI_METHOD(dcn_get_contact_encrinfo) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UINT32(contact_id, 1);

  //TRACE("calling..");
  char* encr_info = dc_get_contact_encrinfo(dcn_context->dc_context,
                                            contact_id);
  //TRACE("result %s", encr_info);

  NAPI_RETURN_AND_UNREF_STRING(encr_info);
}

NAPI_METHOD(dcn_get_contacts) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UINT32(listflags, 1);
  NAPI_ARGV_UTF8_MALLOC(query, 2);

  //TRACE("calling..");
  dc_array_t* contacts = dc_get_contacts(dcn_context->dc_context, listflags,
                                         query && query[0] ? query : NULL);
  napi_value js_array = dc_array_to_js_array(env, contacts);
  free(query);
  dc_array_unref(contacts);
  //TRACE("done");

  return js_array;
}

NAPI_METHOD(dcn_update_device_chats) {
  NAPI_ARGV(1);
  NAPI_DCN_CONTEXT();

  //TRACE("calling..");
  dc_update_device_chats(dcn_context->dc_context);
  //TRACE("done");

  NAPI_RETURN_UNDEFINED();
}

NAPI_METHOD(dcn_was_device_msg_ever_added) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();

  NAPI_ARGV_UTF8_MALLOC(label, 1);

  //TRACE("calling..");

  uint32_t added = dc_was_device_msg_ever_added(dcn_context->dc_context, label);

  free(label);
  //TRACE("done");

  NAPI_RETURN_UINT32(added);
}

NAPI_METHOD(dcn_get_draft) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UINT32(chat_id, 1);

  //TRACE("calling..");
  napi_value result;
  dc_msg_t* draft = dc_get_draft(dcn_context->dc_context, chat_id);

  if (draft == NULL) {
    NAPI_STATUS_THROWS(napi_get_null(env, &result));
  } else {
    NAPI_STATUS_THROWS(napi_create_external(env, draft, finalize_msg,
                                            NULL, &result));
  }
  //TRACE("done");

  return result;
}

NAPI_METHOD(dcn_get_fresh_msg_cnt) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UINT32(chat_id, 1);

  //TRACE("calling..");
  int msg_cnt = dc_get_fresh_msg_cnt(dcn_context->dc_context, chat_id);
  //TRACE("result %d", msg_cnt);

  NAPI_RETURN_INT32(msg_cnt);
}

NAPI_METHOD(dcn_get_fresh_msgs) {
  NAPI_ARGV(1);
  NAPI_DCN_CONTEXT();

  //TRACE("calling..");
  dc_array_t* msg_ids = dc_get_fresh_msgs(dcn_context->dc_context);
  napi_value js_array = dc_array_to_js_array(env, msg_ids);
  dc_array_unref(msg_ids);
  //TRACE("done");

  return js_array;
}

NAPI_METHOD(dcn_get_info) {
  NAPI_ARGV(1);
  NAPI_DCN_CONTEXT();

  //TRACE("calling..");
  char *str = dc_get_info(dcn_context->dc_context);
  //TRACE("result %s", str);

  NAPI_RETURN_AND_UNREF_STRING(str);
}

NAPI_METHOD(dcn_get_msg) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UINT32(msg_id, 1);

  //TRACE("calling..");
  napi_value result;
  dc_msg_t* msg = dc_get_msg(dcn_context->dc_context, msg_id);

  if (msg == NULL) {
    NAPI_STATUS_THROWS(napi_get_null(env, &result));
  } else {
    NAPI_STATUS_THROWS(napi_create_external(env, msg, finalize_msg,
                                            NULL, &result));
  }
  //TRACE("done");

  return result;
}

NAPI_METHOD(dcn_get_msg_cnt) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UINT32(chat_id, 1);

  //TRACE("calling..");
  int msg_cnt = dc_get_msg_cnt(dcn_context->dc_context, chat_id);
  //TRACE("result %d", msg_cnt);

  NAPI_RETURN_INT32(msg_cnt);
}

NAPI_METHOD(dcn_get_msg_info) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UINT32(msg_id, 1);

  //TRACE("calling..");
  char* msg_info = dc_get_msg_info(dcn_context->dc_context, msg_id);
  //TRACE("result %s", msg_info);

  NAPI_RETURN_AND_UNREF_STRING(msg_info);
}

NAPI_METHOD(dcn_get_next_media) {
  NAPI_ARGV(6);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UINT32(msg_id, 1);
  NAPI_ARGV_INT32(dir, 2);
  NAPI_ARGV_INT32(msg_type1, 3);
  NAPI_ARGV_INT32(msg_type2, 4);
  NAPI_ARGV_INT32(msg_type3, 5);

  //TRACE("calling..");
  uint32_t next_id = dc_get_next_media(dcn_context->dc_context,
                                       msg_id,
                                       dir,
                                       msg_type1,
                                       msg_type2,
                                       msg_type3);
  //TRACE("result %d", next_id);

  NAPI_RETURN_UINT32(next_id);
}

NAPI_METHOD(dcn_set_chat_visibility) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UINT32(chat_id, 1);
  NAPI_ARGV_INT32(visibility, 2);
  //TRACE("calling..");
  dc_set_chat_visibility(dcn_context->dc_context,
                                        chat_id,
                                        visibility);
  //TRACE("result %d", next_id);
  NAPI_RETURN_UNDEFINED();
}

NAPI_METHOD(dcn_get_securejoin_qr) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UINT32(group_chat_id, 1);

  //TRACE("calling..");
  char* code = dc_get_securejoin_qr(dcn_context->dc_context,
                                    group_chat_id);
  //TRACE("result %s", code);

  NAPI_RETURN_AND_UNREF_STRING(code);
}

NAPI_METHOD(dcn_imex) {
  NAPI_ARGV(4);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_INT32(what, 1);
  NAPI_ARGV_UTF8_MALLOC(param1, 2);
  NAPI_ARGV_UTF8_MALLOC(param2, 3);

  //TRACE("calling..");
  dc_imex(dcn_context->dc_context,
          what,
          param1,
          param2 && param2[0] ? param2 : NULL);

  free(param1);
  free(param2);
  //TRACE("done");

  NAPI_RETURN_UNDEFINED();
}

NAPI_METHOD(dcn_imex_has_backup) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UTF8_MALLOC(dir_name, 1);

  //TRACE("calling..");
  char* file = dc_imex_has_backup(dcn_context->dc_context, dir_name);
  //TRACE("result %s", file);

  free(dir_name);

  NAPI_RETURN_AND_UNREF_STRING(file);
}

NAPI_ASYNC_CARRIER_BEGIN(dcn_initiate_key_transfer)
  char* result;
NAPI_ASYNC_CARRIER_END(dcn_initiate_key_transfer)

NAPI_ASYNC_EXECUTE(dcn_initiate_key_transfer) {
  NAPI_ASYNC_GET_CARRIER(dcn_initiate_key_transfer);
  carrier->result = dc_initiate_key_transfer(carrier->dcn_context->dc_context);
}

NAPI_ASYNC_COMPLETE(dcn_initiate_key_transfer) {
  NAPI_ASYNC_GET_CARRIER(dcn_initiate_key_transfer);
  if (status != napi_ok) {
    napi_throw_type_error(env, NULL, "Execute callback failed.");
    return;
  }

#define DCN_INITIATE_KEY_TRANSFER_CALLBACK_ARGC 1

  const int argc = DCN_INITIATE_KEY_TRANSFER_CALLBACK_ARGC;
  napi_value argv[DCN_INITIATE_KEY_TRANSFER_CALLBACK_ARGC];

  if (carrier->result) {
    NAPI_STATUS_THROWS(napi_create_string_utf8(env, carrier->result, NAPI_AUTO_LENGTH, &argv[0]));
  } else {
    NAPI_STATUS_THROWS(napi_get_null(env, &argv[0]));
  }

  NAPI_ASYNC_CALL_AND_DELETE_CB();
  dc_str_unref(carrier->result);
  free(carrier);
}

NAPI_METHOD(dcn_initiate_key_transfer) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();

  NAPI_ASYNC_NEW_CARRIER(dcn_initiate_key_transfer);

  NAPI_ASYNC_QUEUE_WORK(dcn_initiate_key_transfer, argv[1]);
  NAPI_RETURN_UNDEFINED();
}

NAPI_METHOD(dcn_is_configured) {
  NAPI_ARGV(1);
  NAPI_DCN_CONTEXT();

  //TRACE("calling..");
  int result = dc_is_configured(dcn_context->dc_context);
  //TRACE("result %d", result);

  NAPI_RETURN_INT32(result);
}

NAPI_METHOD(dcn_is_contact_in_chat) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UINT32(chat_id, 1);
  NAPI_ARGV_UINT32(contact_id, 2);

  //TRACE("calling..");
  int result = dc_is_contact_in_chat(dcn_context->dc_context,
                                     chat_id, contact_id);
  //TRACE("result %d", result);

  NAPI_RETURN_INT32(result);
}

NAPI_METHOD(dcn_lookup_contact_id_by_addr) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UTF8_MALLOC(addr, 1);

  //TRACE("calling..");
  uint32_t res = dc_lookup_contact_id_by_addr(dcn_context->dc_context, addr);
  //TRACE("result %d", res);

  free(addr);

  NAPI_RETURN_UINT32(res);
}

NAPI_METHOD(dcn_marknoticed_chat) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UINT32(chat_id, 1);

  //TRACE("calling..");
  dc_marknoticed_chat(dcn_context->dc_context, chat_id);
  //TRACE("done");

  NAPI_RETURN_UNDEFINED();
}

NAPI_METHOD(dcn_marknoticed_all_chats) {
  NAPI_ARGV(1);
  NAPI_DCN_CONTEXT();

  //TRACE("calling..");
  dc_marknoticed_all_chats(dcn_context->dc_context);
  //TRACE("done");

  NAPI_RETURN_UNDEFINED();
}

NAPI_METHOD(dcn_marknoticed_contact) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UINT32(contact_id, 1);

  //TRACE("calling..");
  dc_marknoticed_contact(dcn_context->dc_context, contact_id);
  //TRACE("done");

  NAPI_RETURN_UNDEFINED();
}

NAPI_METHOD(dcn_markseen_msgs) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  napi_value js_array = argv[1];

  //TRACE("calling..");
  uint32_t length;
  uint32_t* msg_ids = js_array_to_uint32(env, js_array, &length);
  dc_markseen_msgs(dcn_context->dc_context, msg_ids, length);
  free(msg_ids);
  //TRACE("done");

  NAPI_RETURN_UNDEFINED();
}

NAPI_METHOD(dcn_maybe_network) {
  NAPI_ARGV(1);
  NAPI_DCN_CONTEXT();

  //TRACE("calling..");
  dc_maybe_network(dcn_context->dc_context);
  //TRACE("done");

  NAPI_RETURN_UNDEFINED();
}

NAPI_METHOD(dcn_msg_new) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_INT32(viewtype, 1);

  //TRACE("calling..");
  napi_value result;
  dc_msg_t* msg = dc_msg_new(dcn_context->dc_context, viewtype);

  NAPI_STATUS_THROWS(napi_create_external(env, msg, finalize_msg,
                                          NULL, &result));
  //TRACE("done");

  return result;
}


NAPI_METHOD(dcn_remove_contact_from_chat) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UINT32(chat_id, 1);
  NAPI_ARGV_UINT32(contact_id, 2);

  //TRACE("calling..");
  int result = dc_remove_contact_from_chat(dcn_context->dc_context,
                                           chat_id, contact_id);
  //TRACE("result %d", result);

  NAPI_RETURN_INT32(result);
}

NAPI_METHOD(dcn_search_msgs) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UINT32(chat_id, 1);
  NAPI_ARGV_UTF8_MALLOC(query, 2);

  //TRACE("calling..");
  dc_array_t* msg_ids = dc_search_msgs(dcn_context->dc_context,
                                       chat_id, query);
  napi_value js_array = dc_array_to_js_array(env, msg_ids);
  dc_array_unref(msg_ids);
  free(query);
  //TRACE("done");

  return js_array;
}

NAPI_METHOD(dcn_send_msg) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UINT32(chat_id, 1);

  //TRACE("calling..");
  dc_msg_t* dc_msg = NULL;
  napi_get_value_external(env, argv[2], (void**)&dc_msg);

  uint32_t msg_id = dc_send_msg(dcn_context->dc_context, chat_id, dc_msg);
  //TRACE("done");

  NAPI_RETURN_UINT32(msg_id);
}

NAPI_METHOD(dcn_set_chat_name) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UINT32(chat_id, 1);
  NAPI_ARGV_UTF8_MALLOC(name, 2);

  //TRACE("calling..");
  int result = dc_set_chat_name(dcn_context->dc_context,
                                chat_id,
                                name);
  //TRACE("result %d", result);

  free(name);

  NAPI_RETURN_INT32(result);
}

NAPI_METHOD(dcn_set_chat_profile_image) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UINT32(chat_id, 1);
  NAPI_ARGV_UTF8_MALLOC(image, 2);

  //TRACE("calling..");
  int result = dc_set_chat_profile_image(dcn_context->dc_context,
                                         chat_id,
                                         image && image[0] ? image : NULL);
  //TRACE("result %d", result);

  free(image);

  NAPI_RETURN_INT32(result);
}

NAPI_METHOD(dcn_set_chat_mute_duration) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UINT32(chat_id, 1);
  NAPI_ARGV_INT32(duration, 2);
  
  //TRACE("calling..");
  int result = dc_set_chat_mute_duration(dcn_context->dc_context,
                                         chat_id,
                                         duration);
  //TRACE("result %d", result);

  NAPI_RETURN_INT32(result);
}

NAPI_METHOD(dcn_set_config) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UTF8_MALLOC(key, 1);
  NAPI_ARGV_UTF8_MALLOC(value, 2);

  //TRACE("calling..");
  int status = dc_set_config(dcn_context->dc_context, key,
                             value && value[0] ? value : NULL);
  //TRACE("result %d", status);

  free(key);
  free(value);

  NAPI_RETURN_INT32(status);
}

NAPI_METHOD(dcn_set_draft) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UINT32(chat_id, 1);

  //TRACE("calling..");
  dc_msg_t* dc_msg = NULL;
  napi_get_value_external(env, argv[2], (void**)&dc_msg);

  dc_set_draft(dcn_context->dc_context, chat_id, dc_msg);
  //TRACE("done");

  NAPI_RETURN_UNDEFINED();
}

NAPI_METHOD(dcn_set_stock_translation) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UINT32(stock_id, 1);
  NAPI_ARGV_UTF8_MALLOC(stock_msg, 2);

  int result = dc_set_stock_translation(dcn_context->dc_context, stock_id, stock_msg);
  free(stock_msg);
  NAPI_RETURN_INT32(result);
}

NAPI_METHOD(dcn_star_msgs) {
  NAPI_ARGV(3);
  NAPI_DCN_CONTEXT();
  napi_value js_array = argv[1];
  NAPI_ARGV_INT32(star, 2);

  //TRACE("calling..");
  uint32_t length;
  uint32_t* msg_ids = js_array_to_uint32(env, js_array, &length);
  dc_star_msgs(dcn_context->dc_context, msg_ids, length, star);
  free(msg_ids);
  //TRACE("done");

  NAPI_RETURN_UNDEFINED();
}


NAPI_METHOD(dcn_start_io) {
  NAPI_ARGV(1);
  NAPI_DCN_CONTEXT();

  TRACE("calling..");
  TRACE("done");

  dc_start_io(dcn_context->dc_context);

  NAPI_RETURN_UNDEFINED();
}

NAPI_METHOD(dcn_stop_io) {
  NAPI_ARGV(1);
  NAPI_DCN_CONTEXT();

  dc_stop_io(dcn_context->dc_context);

  NAPI_RETURN_UNDEFINED();
}

NAPI_METHOD(dcn_is_io_running) {
  NAPI_ARGV(1);
  NAPI_DCN_CONTEXT();

  NAPI_RETURN_INT32(dc_is_io_running(dcn_context->dc_context));
}

NAPI_METHOD(dcn_stop_ongoing_process) {
  NAPI_ARGV(1);
  NAPI_DCN_CONTEXT();

  //TRACE("calling..");
  dc_stop_ongoing_process(dcn_context->dc_context);
  //TRACE("done");

  NAPI_RETURN_UNDEFINED();
}

/**
 * dc_chat_t
 */

NAPI_METHOD(dcn_chat_get_archived) {
  NAPI_ARGV(1);
  NAPI_DC_CHAT();

  //TRACE("calling..");
  int archived = dc_chat_get_archived(dc_chat);
  //TRACE("result %d", archived);

  NAPI_RETURN_INT32(archived);
}

NAPI_METHOD(dcn_chat_get_color) {
  NAPI_ARGV(1);
  NAPI_DC_CHAT();

  //TRACE("calling..");
  uint32_t color = dc_chat_get_color(dc_chat);
  //TRACE("result %d", color);

  NAPI_RETURN_UINT32(color);
}

NAPI_METHOD(dcn_chat_get_visibility) {
  NAPI_ARGV(1);
  NAPI_DC_CHAT();

  //TRACE("calling..");
  uint32_t visibility = dc_chat_get_visibility(dc_chat);
  //TRACE("result %d", color);

  NAPI_RETURN_UINT32(visibility);
}

NAPI_METHOD(dcn_chat_get_id) {
  NAPI_ARGV(1);
  NAPI_DC_CHAT();

  //TRACE("calling..");
  uint32_t chat_id = dc_chat_get_id(dc_chat);
  //TRACE("result %d", chat_id);

  NAPI_RETURN_UINT32(chat_id);
}

NAPI_METHOD(dcn_chat_get_name) {
  NAPI_ARGV(1);
  NAPI_DC_CHAT();

  //TRACE("calling..");
  char* name = dc_chat_get_name(dc_chat);
  //TRACE("result %s", name);

  NAPI_RETURN_AND_UNREF_STRING(name);
}

NAPI_METHOD(dcn_chat_get_profile_image) {
  NAPI_ARGV(1);
  NAPI_DC_CHAT();

  //TRACE("calling..");
  char* profile_image = dc_chat_get_profile_image(dc_chat);
  //TRACE("result %s", profile_image);

  NAPI_RETURN_AND_UNREF_STRING(profile_image);
}

NAPI_METHOD(dcn_chat_get_type) {
  NAPI_ARGV(1);
  NAPI_DC_CHAT();

  //TRACE("calling..");
  int type = dc_chat_get_type(dc_chat);
  //TRACE("result %d", type);

  NAPI_RETURN_INT32(type);
}

NAPI_METHOD(dcn_chat_is_self_talk) {
  NAPI_ARGV(1);
  NAPI_DC_CHAT();

  //TRACE("calling..");
  int is_self_talk = dc_chat_is_self_talk(dc_chat);
  //TRACE("result %d", is_self_talk);

  NAPI_RETURN_INT32(is_self_talk);
}

NAPI_METHOD(dcn_chat_is_unpromoted) {
  NAPI_ARGV(1);
  NAPI_DC_CHAT();

  //TRACE("calling..");
  int is_unpromoted = dc_chat_is_unpromoted(dc_chat);
  //TRACE("result %d", is_unpromoted);

  NAPI_RETURN_INT32(is_unpromoted);
}

NAPI_METHOD(dcn_chat_is_verified) {
  NAPI_ARGV(1);
  NAPI_DC_CHAT();

  //TRACE("calling..");
  int is_verified = dc_chat_is_verified(dc_chat);
  //TRACE("result %d", is_verified);

  NAPI_RETURN_INT32(is_verified);
}

NAPI_METHOD(dcn_chat_is_device_talk) {
  NAPI_ARGV(1);
  NAPI_DC_CHAT();

  //TRACE("calling..");
  int is_device_talk = dc_chat_is_device_talk(dc_chat);
  //TRACE("result %d", is_device_talk);

  NAPI_RETURN_INT32(is_device_talk);
}

NAPI_METHOD(dcn_chat_is_muted) {
  NAPI_ARGV(1);
  NAPI_DC_CHAT();

  //TRACE("calling..");
  int is_muted = dc_chat_is_muted(dc_chat);
  //TRACE("result %d", is_muted);

  NAPI_RETURN_INT32(is_muted);
}

/**
 * dc_chatlist_t
 */

NAPI_METHOD(dcn_chatlist_get_chat_id) {
  NAPI_ARGV(2);
  NAPI_DC_CHATLIST();
  NAPI_ARGV_INT32(index, 1);

  //TRACE("calling..");
  uint32_t chat_id = dc_chatlist_get_chat_id(dc_chatlist, index);
  //TRACE("result %d", chat_id);

  NAPI_RETURN_UINT32(chat_id);
}

NAPI_METHOD(dcn_chatlist_get_cnt) {
  NAPI_ARGV(1);
  NAPI_DC_CHATLIST();

  //TRACE("calling..");
  int count = dc_chatlist_get_cnt(dc_chatlist);
  //TRACE("result %d", count);

  NAPI_RETURN_INT32(count);
}

NAPI_METHOD(dcn_chatlist_get_msg_id) {
  NAPI_ARGV(2);
  NAPI_DC_CHATLIST();
  NAPI_ARGV_INT32(index, 1);

  //TRACE("calling..");
  uint32_t message_id = dc_chatlist_get_msg_id(dc_chatlist, index);
  //TRACE("result %d", message_id);

  NAPI_RETURN_UINT32(message_id);
}

NAPI_METHOD(dcn_chatlist_get_summary) {
  NAPI_ARGV(3);
  NAPI_DC_CHATLIST();
  NAPI_ARGV_INT32(index, 1);

  //TRACE("calling..");
  dc_chat_t* dc_chat = NULL;
  napi_get_value_external(env, argv[2], (void**)&dc_chat);

  dc_lot_t* summary = dc_chatlist_get_summary(dc_chatlist, index, dc_chat);

  napi_value result;
  if (summary == NULL) {
    NAPI_STATUS_THROWS(napi_get_null(env, &result));
  } else {
    NAPI_STATUS_THROWS(napi_create_external(env, summary,
                                            finalize_lot,
                                            NULL, &result));
  }
  //TRACE("done");

  return result;
}

/**
 * dc_contact_t
 */

NAPI_METHOD(dcn_contact_get_addr) {
  NAPI_ARGV(1);
  NAPI_DC_CONTACT();

  //TRACE("calling..");
  char* addr = dc_contact_get_addr(dc_contact);
  //TRACE("result %s", addr);

  NAPI_RETURN_AND_UNREF_STRING(addr);
}

NAPI_METHOD(dcn_contact_get_color) {
  NAPI_ARGV(1);
  NAPI_DC_CONTACT();

  //TRACE("calling..");
  uint32_t color = dc_contact_get_color(dc_contact);
  //TRACE("result %d", color);

  NAPI_RETURN_UINT32(color);
}

NAPI_METHOD(dcn_contact_get_display_name) {
  NAPI_ARGV(1);
  NAPI_DC_CONTACT();

  //TRACE("calling..");
  char* display_name = dc_contact_get_display_name(dc_contact);
  //TRACE("result %s", display_name);

  NAPI_RETURN_AND_UNREF_STRING(display_name);
}

NAPI_METHOD(dcn_contact_get_first_name) {
  NAPI_ARGV(1);
  NAPI_DC_CONTACT();

  //TRACE("calling..");
  char* first_name = dc_contact_get_first_name(dc_contact);
  //TRACE("result %s", first_name);

  NAPI_RETURN_AND_UNREF_STRING(first_name);
}

NAPI_METHOD(dcn_contact_get_id) {
  NAPI_ARGV(1);
  NAPI_DC_CONTACT();

  //TRACE("calling..");
  uint32_t contact_id = dc_contact_get_id(dc_contact);
  //TRACE("result %d", contact_id);

  NAPI_RETURN_UINT32(contact_id);
}

NAPI_METHOD(dcn_contact_get_name) {
  NAPI_ARGV(1);
  NAPI_DC_CONTACT();

  //TRACE("calling..");
  char* name = dc_contact_get_name(dc_contact);
  //TRACE("result %s", name);

  NAPI_RETURN_AND_UNREF_STRING(name);
}

NAPI_METHOD(dcn_contact_get_name_n_addr) {
  NAPI_ARGV(1);
  NAPI_DC_CONTACT();

  //TRACE("calling..");
  char* name_n_addr = dc_contact_get_name_n_addr(dc_contact);
  //TRACE("result %s", name_n_addr);

  NAPI_RETURN_AND_UNREF_STRING(name_n_addr);
}

NAPI_METHOD(dcn_contact_get_profile_image) {
  NAPI_ARGV(1);
  NAPI_DC_CONTACT();

  //TRACE("calling..");
  char* profile_image = dc_contact_get_profile_image(dc_contact);
  //TRACE("result %s", profile_image);

  NAPI_RETURN_AND_UNREF_STRING(profile_image);
}

NAPI_METHOD(dcn_contact_is_blocked) {
  NAPI_ARGV(1);
  NAPI_DC_CONTACT();

  //TRACE("calling..");
  int is_blocked = dc_contact_is_blocked(dc_contact);
  //TRACE("result %d", is_blocked);

  NAPI_RETURN_UINT32(is_blocked);
}

NAPI_METHOD(dcn_contact_is_verified) {
  NAPI_ARGV(1);
  NAPI_DC_CONTACT();

  //TRACE("calling..");
  int is_verified = dc_contact_is_verified(dc_contact);
  //TRACE("result %d", is_verified);

  NAPI_RETURN_UINT32(is_verified);
}

/**
 * dc_lot_t
 */

NAPI_METHOD(dcn_lot_get_id) {
  NAPI_ARGV(1);
  NAPI_DC_LOT();

  //TRACE("calling..");
  uint32_t id = dc_lot_get_id(dc_lot);
  //TRACE("result %d", id);

  NAPI_RETURN_UINT32(id);
}

NAPI_METHOD(dcn_lot_get_state) {
  NAPI_ARGV(1);
  NAPI_DC_LOT();

  //TRACE("calling..");
  int state = dc_lot_get_state(dc_lot);
  //TRACE("result %d", state);

  NAPI_RETURN_INT32(state);
}

NAPI_METHOD(dcn_lot_get_text1) {
  NAPI_ARGV(1);
  NAPI_DC_LOT();

  //TRACE("calling..");
  char* text1 = dc_lot_get_text1(dc_lot);
  //TRACE("result %s", text1);

  NAPI_RETURN_AND_UNREF_STRING(text1);
}

NAPI_METHOD(dcn_lot_get_text1_meaning) {
  NAPI_ARGV(1);
  NAPI_DC_LOT();

  //TRACE("calling..");
  int text1_meaning = dc_lot_get_text1_meaning(dc_lot);
  //TRACE("result %d", text1_meaning);

  NAPI_RETURN_INT32(text1_meaning);
}

NAPI_METHOD(dcn_lot_get_text2) {
  NAPI_ARGV(1);
  NAPI_DC_LOT();

  //TRACE("calling..");
  char* text2 = dc_lot_get_text2(dc_lot);
  //TRACE("result %s", text2);

  NAPI_RETURN_AND_UNREF_STRING(text2);
}

NAPI_METHOD(dcn_lot_get_timestamp) {
  NAPI_ARGV(1);
  NAPI_DC_LOT();

  //TRACE("calling..");
  int timestamp = dc_lot_get_timestamp(dc_lot);
  //TRACE("result %d", timestamp);

  NAPI_RETURN_INT32(timestamp);
}

/**
 * dc_msg_t
 */

NAPI_METHOD(dcn_msg_get_chat_id) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  //TRACE("calling..");
  uint32_t chat_id = dc_msg_get_chat_id(dc_msg);
  //TRACE("result %d", chat_id);

  NAPI_RETURN_UINT32(chat_id);
}

NAPI_METHOD(dcn_msg_get_duration) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  //TRACE("calling..");
  int duration = dc_msg_get_duration(dc_msg);
  //TRACE("result %d", duration);

  NAPI_RETURN_INT32(duration);
}

NAPI_METHOD(dcn_msg_get_file) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  //TRACE("calling..");
  char* file = dc_msg_get_file(dc_msg);
  //TRACE("result %s", file);

  NAPI_RETURN_AND_UNREF_STRING(file);
}

NAPI_METHOD(dcn_msg_get_filebytes) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  //TRACE("calling..");
  uint32_t filebytes = dc_msg_get_filebytes(dc_msg);
  //TRACE("result %d", filebytes);

  NAPI_RETURN_INT32(filebytes);
}

NAPI_METHOD(dcn_msg_get_filemime) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  //TRACE("calling..");
  char* filemime = dc_msg_get_filemime(dc_msg);
  //TRACE("result %s", filemime);

  NAPI_RETURN_AND_UNREF_STRING(filemime);
}

NAPI_METHOD(dcn_msg_get_filename) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  //TRACE("calling..");
  char* filename = dc_msg_get_filename(dc_msg);
  //TRACE("result %s", filename);

  NAPI_RETURN_AND_UNREF_STRING(filename);
}

NAPI_METHOD(dcn_msg_get_from_id) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  //TRACE("calling..");
  uint32_t contact_id = dc_msg_get_from_id(dc_msg);
  //TRACE("result %d", contact_id);

  NAPI_RETURN_UINT32(contact_id);
}

NAPI_METHOD(dcn_msg_get_height) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  //TRACE("calling..");
  int height = dc_msg_get_height(dc_msg);
  //TRACE("result %d", height);

  NAPI_RETURN_INT32(height);
}

NAPI_METHOD(dcn_msg_get_id) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  //TRACE("calling..");
  uint32_t msg_id = dc_msg_get_id(dc_msg);
  //TRACE("result %d", msg_id);

  NAPI_RETURN_UINT32(msg_id);
}

NAPI_METHOD(dcn_msg_get_received_timestamp) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  //TRACE("calling..");
  int timestamp = dc_msg_get_received_timestamp(dc_msg);
  //TRACE("result %d", timestamp);

  NAPI_RETURN_INT32(timestamp);
}


NAPI_METHOD(dcn_msg_get_setupcodebegin) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  //TRACE("calling..");
  char* setupcodebegin = dc_msg_get_setupcodebegin(dc_msg);
  //TRACE("result %s", setupcodebegin);

  NAPI_RETURN_AND_UNREF_STRING(setupcodebegin);
}

NAPI_METHOD(dcn_msg_get_showpadlock) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  //TRACE("calling..");
  int showpadlock = dc_msg_get_showpadlock(dc_msg);
  //TRACE("result %d", showpadlock);

  NAPI_RETURN_INT32(showpadlock);
}

NAPI_METHOD(dcn_msg_get_sort_timestamp) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  //TRACE("calling..");
  int timestamp = dc_msg_get_sort_timestamp(dc_msg);
  //TRACE("result %d", timestamp);

  NAPI_RETURN_INT32(timestamp);
}

NAPI_METHOD(dcn_msg_get_state) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  //TRACE("calling..");
  int state = dc_msg_get_state(dc_msg);
  //TRACE("result %d", state);

  NAPI_RETURN_INT32(state);
}

NAPI_METHOD(dcn_msg_get_summary) {
  NAPI_ARGV(2);
  NAPI_DC_MSG();

  //TRACE("calling..");
  dc_chat_t* dc_chat = NULL;
  napi_get_value_external(env, argv[1], (void**)&dc_chat);

  dc_lot_t* summary = dc_msg_get_summary(dc_msg, dc_chat);

  napi_value result;
  NAPI_STATUS_THROWS(napi_create_external(env, summary,
                                          finalize_lot,
                                          NULL, &result));
  //TRACE("done");

  return result;
}

NAPI_METHOD(dcn_msg_get_summarytext) {
  NAPI_ARGV(2);
  NAPI_DC_MSG();
  NAPI_ARGV_INT32(approx_characters, 1);

  //TRACE("calling..");
  char* summarytext = dc_msg_get_summarytext(dc_msg, approx_characters);
  //TRACE("result %s", summarytext);

  NAPI_RETURN_AND_UNREF_STRING(summarytext);
}

NAPI_METHOD(dcn_msg_get_text) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  //TRACE("calling..");
  char* text = dc_msg_get_text(dc_msg);
  //TRACE("result %s", text);

  NAPI_RETURN_AND_UNREF_STRING(text);
}

NAPI_METHOD(dcn_msg_get_timestamp) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  //TRACE("calling..");
  int timestamp = dc_msg_get_timestamp(dc_msg);
  //TRACE("result %d", timestamp);

  NAPI_RETURN_INT32(timestamp);
}

NAPI_METHOD(dcn_msg_get_viewtype) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  //TRACE("calling..");
  int type = dc_msg_get_viewtype(dc_msg);
  //TRACE("result %d", type);

  NAPI_RETURN_INT32(type);
}

NAPI_METHOD(dcn_msg_get_width) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  //TRACE("calling..");
  int width = dc_msg_get_width(dc_msg);
  //TRACE("result %d", width);

  NAPI_RETURN_INT32(width);
}

NAPI_METHOD(dcn_msg_has_deviating_timestamp) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  //TRACE("calling..");
  int has_deviating_timestamp = dc_msg_has_deviating_timestamp(dc_msg);
  //TRACE("result %d", has_deviating_timestamp);

  NAPI_RETURN_INT32(has_deviating_timestamp);
}

NAPI_METHOD(dcn_msg_has_location) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  //TRACE("calling..");
  int has_location = dc_msg_has_location(dc_msg);
  //TRACE("result %d", has_location);

  NAPI_RETURN_INT32(has_location);
}

NAPI_METHOD(dcn_msg_is_forwarded) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  //TRACE("calling..");
  int is_forwarded = dc_msg_is_forwarded(dc_msg);
  //TRACE("result %d", is_forwarded);

  NAPI_RETURN_INT32(is_forwarded);
}

NAPI_METHOD(dcn_msg_is_increation) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  //TRACE("calling..");
  int is_increation = dc_msg_is_increation(dc_msg);
  //TRACE("result %d", is_increation);

  NAPI_RETURN_INT32(is_increation);
}

NAPI_METHOD(dcn_msg_is_info) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  //TRACE("calling..");
  int is_info = dc_msg_is_info(dc_msg);
  //TRACE("result %d", is_info);

  NAPI_RETURN_INT32(is_info);
}

NAPI_METHOD(dcn_msg_is_sent) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  //TRACE("calling..");
  int is_sent = dc_msg_is_sent(dc_msg);
  //TRACE("result %d", is_sent);

  NAPI_RETURN_INT32(is_sent);
}

NAPI_METHOD(dcn_msg_is_setupmessage) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  //TRACE("calling..");
  int is_setupmessage = dc_msg_is_setupmessage(dc_msg);
  //TRACE("result %d", is_setupmessage);

  NAPI_RETURN_INT32(is_setupmessage);
}

NAPI_METHOD(dcn_msg_is_starred) {
  NAPI_ARGV(1);
  NAPI_DC_MSG();

  //TRACE("calling..");
  int is_starred = dc_msg_is_starred(dc_msg);
  //TRACE("result %d", is_starred);

  NAPI_RETURN_INT32(is_starred);
}

NAPI_METHOD(dcn_msg_latefiling_mediasize) {
  NAPI_ARGV(4);
  NAPI_DC_MSG();
  NAPI_ARGV_INT32(width, 1);
  NAPI_ARGV_INT32(height, 2);
  NAPI_ARGV_INT32(duration, 3);

  //TRACE("calling..");
  dc_msg_latefiling_mediasize(dc_msg, width, height, duration);
  //TRACE("done");

  NAPI_RETURN_UNDEFINED();
}

NAPI_METHOD(dcn_msg_set_dimension) {
  NAPI_ARGV(3);
  NAPI_DC_MSG();
  NAPI_ARGV_INT32(width, 1);
  NAPI_ARGV_INT32(height, 2);

  //TRACE("calling..");
  dc_msg_set_dimension(dc_msg, width, height);
  //TRACE("done");

  NAPI_RETURN_UNDEFINED();
}

NAPI_METHOD(dcn_msg_set_duration) {
  NAPI_ARGV(2);
  NAPI_DC_MSG();
  NAPI_ARGV_INT32(duration, 1);

  //TRACE("calling..");
  dc_msg_set_duration(dc_msg, duration);
  //TRACE("done");

  NAPI_RETURN_UNDEFINED();
}

NAPI_METHOD(dcn_msg_set_file) {
  NAPI_ARGV(3);
  NAPI_DC_MSG();
  NAPI_ARGV_UTF8_MALLOC(file, 1);
  NAPI_ARGV_UTF8_MALLOC(filemime, 2);

  //TRACE("calling..");
  dc_msg_set_file(dc_msg, file, filemime && filemime[0] ? filemime : NULL);
  //TRACE("done");

  free(file);
  free(filemime);

  NAPI_RETURN_UNDEFINED();
}

NAPI_METHOD(dcn_msg_set_text) {
  NAPI_ARGV(2);
  NAPI_DC_MSG();
  NAPI_ARGV_UTF8_MALLOC(text, 1);

  //TRACE("calling..");
  dc_msg_set_text(dc_msg, text);
  //TRACE("done");

  free(text);

  NAPI_RETURN_UNDEFINED();
}

/**
 * locations
 */

NAPI_METHOD(dcn_msg_set_location) {
  NAPI_ARGV(3);
  NAPI_DC_MSG();
  NAPI_ARGV_DOUBLE(latitude, 1);
  NAPI_ARGV_DOUBLE(longitude, 2);

  //TRACE("calling..");
  dc_msg_set_location(dc_msg, latitude, longitude);
  //TRACE("done");

  NAPI_RETURN_UNDEFINED();
}

/**
 * locations
 */

NAPI_METHOD(dcn_set_location) {
  NAPI_ARGV(4);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_DOUBLE(latitude, 1);
  NAPI_ARGV_DOUBLE(longitude, 2);
  NAPI_ARGV_DOUBLE(accuracy, 3);

  //TRACE("calling..");
  int result = dc_set_location(dcn_context->dc_context, latitude, longitude, accuracy);
  //TRACE("result %d", result);

  NAPI_RETURN_INT32(result);
}

NAPI_METHOD(dcn_get_locations) {
  NAPI_ARGV(5);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_INT32(chat_id, 1);
  NAPI_ARGV_INT32(contact_id, 2);
  NAPI_ARGV_INT32(timestamp_from, 3);
  NAPI_ARGV_INT32(timestamp_to, 4);

  //TRACE("calling..");
  dc_array_t* locations = dc_get_locations(dcn_context->dc_context,
                                          chat_id,
                                          contact_id,
                                          timestamp_from,
                                          timestamp_to);

  napi_value napi_locations;
  NAPI_STATUS_THROWS(napi_create_external(env, locations,
                                          finalize_array,
                                          NULL, &napi_locations));
  //TRACE("done");

  return napi_locations;
}

NAPI_METHOD(dcn_array_get_cnt) {
  NAPI_ARGV(1);
  NAPI_DC_ARRAY();

  //TRACE("calling..");
  uint32_t size = dc_array_get_cnt(dc_array);

  napi_value napi_size;
  NAPI_STATUS_THROWS(napi_create_uint32(env, size, &napi_size));
  //TRACE("done");

  return napi_size;
}

NAPI_METHOD(dcn_array_get_id) {
  NAPI_ARGV(2);
  NAPI_DC_ARRAY();

  //TRACE("calling..");
  uint32_t index;
  NAPI_STATUS_THROWS(napi_get_value_uint32(env, argv[1], &index));

  uint32_t id = dc_array_get_id(dc_array, index);

  napi_value napi_id;
  NAPI_STATUS_THROWS(napi_create_uint32(env, id, &napi_id));
  //TRACE("done");

  return napi_id;
}

NAPI_METHOD(dcn_array_get_accuracy) {
  NAPI_ARGV(2);
  NAPI_DC_ARRAY();

  //TRACE("calling..");
  uint32_t index;
  NAPI_STATUS_THROWS(napi_get_value_uint32(env, argv[1], &index));

  double accuracy = dc_array_get_accuracy(dc_array, index);

  napi_value napi_accuracy;
  NAPI_STATUS_THROWS(napi_create_double(env, accuracy, &napi_accuracy));
  //TRACE("done");

  return napi_accuracy;
}

NAPI_METHOD(dcn_array_get_longitude) {
  NAPI_ARGV(2);
  NAPI_DC_ARRAY();

  //TRACE("calling..");
  uint32_t index;
  NAPI_STATUS_THROWS(napi_get_value_uint32(env, argv[1], &index));

  double longitude = dc_array_get_longitude(dc_array, index);

  napi_value napi_longitude;
  NAPI_STATUS_THROWS(napi_create_double(env, longitude, &napi_longitude));
  //TRACE("done");

  return napi_longitude;
}

NAPI_METHOD(dcn_array_get_latitude) {
  NAPI_ARGV(2);
  NAPI_DC_ARRAY();

  //TRACE("calling..");
  uint32_t index;
  NAPI_STATUS_THROWS(napi_get_value_uint32(env, argv[1], &index));

  double latitude = dc_array_get_latitude(dc_array, index);

  napi_value napi_latitude;
  NAPI_STATUS_THROWS(napi_create_double(env, latitude, &napi_latitude));
  //TRACE("done");

  return napi_latitude;
}

NAPI_METHOD(dcn_array_get_timestamp) {
  NAPI_ARGV(2);
  NAPI_DC_ARRAY();

  //TRACE("calling..");
  uint32_t index;
  NAPI_STATUS_THROWS(napi_get_value_uint32(env, argv[1], &index));

  int timestamp = dc_array_get_timestamp(dc_array, index);

  napi_value napi_timestamp;
  NAPI_STATUS_THROWS(napi_create_int64(env, timestamp, &napi_timestamp));
  //TRACE("done");

  return napi_timestamp;
}

NAPI_METHOD(dcn_array_get_msg_id) {
  NAPI_ARGV(2);
  NAPI_DC_ARRAY();

  //TRACE("calling..");
  uint32_t index;
  NAPI_STATUS_THROWS(napi_get_value_uint32(env, argv[1], &index));

  uint32_t msg_id = dc_array_get_msg_id(dc_array, index);

  napi_value napi_msg_id;
  NAPI_STATUS_THROWS(napi_create_uint32(env, msg_id, &napi_msg_id));
  //TRACE("done");

  return napi_msg_id;
}

NAPI_METHOD(dcn_array_is_independent) {
  NAPI_ARGV(2);
  NAPI_DC_ARRAY();

  //TRACE("calling..");
  uint32_t index;
  NAPI_STATUS_THROWS(napi_get_value_uint32(env, argv[1], &index));

  int result = dc_array_is_independent(dc_array, index);
  //TRACE("result %d", result);

  NAPI_RETURN_INT32(result);
}

NAPI_METHOD(dcn_array_get_marker) {
  NAPI_ARGV(2);
  NAPI_DC_ARRAY();

  //TRACE("calling..");
  uint32_t index;
  NAPI_STATUS_THROWS(napi_get_value_uint32(env, argv[1], &index));

  char* marker = dc_array_get_marker(dc_array, index);
  //TRACE("result %s", marker);

  NAPI_RETURN_AND_UNREF_STRING(marker);
}

NAPI_METHOD(dcn_array_get_contact_id) {
  NAPI_ARGV(2);
  NAPI_DC_ARRAY();

  //TRACE("calling..");
  uint32_t index;
  NAPI_STATUS_THROWS(napi_get_value_uint32(env, argv[1], &index));

  uint32_t contact_id = dc_array_get_contact_id(dc_array, index);

  napi_value napi_contact_id;
  NAPI_STATUS_THROWS(napi_create_uint32(env, contact_id, &napi_contact_id));
  //TRACE("done");

  return napi_contact_id;
}

NAPI_METHOD(dcn_array_get_chat_id) {
  NAPI_ARGV(2);
  NAPI_DC_ARRAY();

  //TRACE("calling..");
  uint32_t index;
  NAPI_STATUS_THROWS(napi_get_value_uint32(env, argv[1], &index));

  uint32_t chat_id = dc_array_get_chat_id(dc_array, index);

  napi_value napi_chat_id;
  NAPI_STATUS_THROWS(napi_create_uint32(env, chat_id, &napi_chat_id));
  //TRACE("done");

  return napi_chat_id;
}

NAPI_METHOD(dcn_provider_new_from_email) {
  NAPI_ARGV(2);
  NAPI_DCN_CONTEXT();
  NAPI_ARGV_UTF8_MALLOC(email, 1)

  //TRACE("calling..");
  napi_value result;
  dc_provider_t* provider = dc_provider_new_from_email(dcn_context->dc_context, email);

  if (provider == NULL) {
    NAPI_STATUS_THROWS(napi_get_null(env, &result));
  } else {
    NAPI_STATUS_THROWS(napi_create_external(env, provider, finalize_provider,
                                            NULL, &result));
  }
  //TRACE("done");

  return result;
}

NAPI_METHOD(dcn_provider_get_overview_page) {
  NAPI_ARGV(1);
  NAPI_DC_PROVIDER();

  //TRACE("calling..");
  char* overview_page = dc_provider_get_overview_page(dc_provider);
  //TRACE("result %s", overview_page);

  NAPI_RETURN_AND_UNREF_STRING(overview_page);
}

NAPI_METHOD(dcn_provider_get_before_login_hint) {
  NAPI_ARGV(1);
  NAPI_DC_PROVIDER();

  //TRACE("calling..");
  char* before_login_hint = dc_provider_get_before_login_hint(dc_provider);
  //TRACE("result %s", before_login_hint);

  NAPI_RETURN_AND_UNREF_STRING(before_login_hint);
}

NAPI_METHOD(dcn_provider_get_status) {
  NAPI_ARGV(1);
  NAPI_DC_PROVIDER();

  //TRACE("calling..");
  int status = dc_provider_get_status(dc_provider);
  //TRACE("result %s", status);

  NAPI_RETURN_INT32(status)
}

NAPI_INIT() {
  /**
   * Main context
   */

  NAPI_EXPORT_FUNCTION(dcn_context_new);
  NAPI_EXPORT_FUNCTION(dcn_context_unref);
  NAPI_EXPORT_FUNCTION(dcn_start_event_handler);

  /**
   * Static functions
   */

  NAPI_EXPORT_FUNCTION(dcn_maybe_valid_addr);

  /**
   * dcn_context_t
   */

  NAPI_EXPORT_FUNCTION(dcn_add_address_book);
  NAPI_EXPORT_FUNCTION(dcn_add_contact_to_chat);
  NAPI_EXPORT_FUNCTION(dcn_add_device_msg);
  NAPI_EXPORT_FUNCTION(dcn_archive_chat);
  NAPI_EXPORT_FUNCTION(dcn_block_contact);
  NAPI_EXPORT_FUNCTION(dcn_check_qr);
  NAPI_EXPORT_FUNCTION(dcn_configure);
  NAPI_EXPORT_FUNCTION(dcn_continue_key_transfer);
  NAPI_EXPORT_FUNCTION(dcn_create_chat_by_contact_id);
  NAPI_EXPORT_FUNCTION(dcn_create_chat_by_msg_id);
  NAPI_EXPORT_FUNCTION(dcn_create_contact);
  NAPI_EXPORT_FUNCTION(dcn_create_group_chat);
  NAPI_EXPORT_FUNCTION(dcn_delete_chat);
  NAPI_EXPORT_FUNCTION(dcn_delete_contact);
  NAPI_EXPORT_FUNCTION(dcn_delete_msgs);
  NAPI_EXPORT_FUNCTION(dcn_forward_msgs);
  NAPI_EXPORT_FUNCTION(dcn_get_blobdir);
  NAPI_EXPORT_FUNCTION(dcn_get_blocked_cnt);
  NAPI_EXPORT_FUNCTION(dcn_get_blocked_contacts);
  NAPI_EXPORT_FUNCTION(dcn_get_chat);
  NAPI_EXPORT_FUNCTION(dcn_get_chat_contacts);
  NAPI_EXPORT_FUNCTION(dcn_get_chat_id_by_contact_id);
  NAPI_EXPORT_FUNCTION(dcn_get_chat_media);
  NAPI_EXPORT_FUNCTION(dcn_get_mime_headers);
  NAPI_EXPORT_FUNCTION(dcn_get_chat_msgs);
  NAPI_EXPORT_FUNCTION(dcn_get_chatlist);
  NAPI_EXPORT_FUNCTION(dcn_get_config);
  NAPI_EXPORT_FUNCTION(dcn_get_contact);
  NAPI_EXPORT_FUNCTION(dcn_get_contact_encrinfo);
  NAPI_EXPORT_FUNCTION(dcn_get_contacts);
  NAPI_EXPORT_FUNCTION(dcn_update_device_chats);
  NAPI_EXPORT_FUNCTION(dcn_was_device_msg_ever_added);
  NAPI_EXPORT_FUNCTION(dcn_get_draft);
  NAPI_EXPORT_FUNCTION(dcn_get_fresh_msg_cnt);
  NAPI_EXPORT_FUNCTION(dcn_get_fresh_msgs);
  NAPI_EXPORT_FUNCTION(dcn_get_info);
  NAPI_EXPORT_FUNCTION(dcn_get_msg);
  NAPI_EXPORT_FUNCTION(dcn_get_msg_cnt);
  NAPI_EXPORT_FUNCTION(dcn_get_msg_info);
  NAPI_EXPORT_FUNCTION(dcn_get_next_media);
  NAPI_EXPORT_FUNCTION(dcn_set_chat_visibility);
  NAPI_EXPORT_FUNCTION(dcn_get_securejoin_qr);
  NAPI_EXPORT_FUNCTION(dcn_imex);
  NAPI_EXPORT_FUNCTION(dcn_imex_has_backup);
  NAPI_EXPORT_FUNCTION(dcn_initiate_key_transfer);
  NAPI_EXPORT_FUNCTION(dcn_is_configured);
  NAPI_EXPORT_FUNCTION(dcn_is_contact_in_chat);

  NAPI_EXPORT_FUNCTION(dcn_join_securejoin);
  NAPI_EXPORT_FUNCTION(dcn_lookup_contact_id_by_addr);
  NAPI_EXPORT_FUNCTION(dcn_marknoticed_chat);
  NAPI_EXPORT_FUNCTION(dcn_marknoticed_all_chats);
  NAPI_EXPORT_FUNCTION(dcn_marknoticed_contact);
  NAPI_EXPORT_FUNCTION(dcn_markseen_msgs);
  NAPI_EXPORT_FUNCTION(dcn_maybe_network);
  NAPI_EXPORT_FUNCTION(dcn_msg_new);
  NAPI_EXPORT_FUNCTION(dcn_remove_contact_from_chat);
  NAPI_EXPORT_FUNCTION(dcn_search_msgs);
  NAPI_EXPORT_FUNCTION(dcn_send_msg);
  NAPI_EXPORT_FUNCTION(dcn_set_chat_name);
  NAPI_EXPORT_FUNCTION(dcn_set_chat_profile_image);
  NAPI_EXPORT_FUNCTION(dcn_set_chat_mute_duration);
  NAPI_EXPORT_FUNCTION(dcn_set_config);
  NAPI_EXPORT_FUNCTION(dcn_set_draft);
  NAPI_EXPORT_FUNCTION(dcn_set_stock_translation);
  NAPI_EXPORT_FUNCTION(dcn_star_msgs);
  NAPI_EXPORT_FUNCTION(dcn_start_io);
  NAPI_EXPORT_FUNCTION(dcn_stop_io);
  NAPI_EXPORT_FUNCTION(dcn_is_io_running);
  NAPI_EXPORT_FUNCTION(dcn_stop_ongoing_process);

  /**
   * dc_chat_t
   */

  NAPI_EXPORT_FUNCTION(dcn_chat_get_archived);
  NAPI_EXPORT_FUNCTION(dcn_chat_get_color);
  NAPI_EXPORT_FUNCTION(dcn_chat_get_visibility);
  NAPI_EXPORT_FUNCTION(dcn_chat_get_id);
  NAPI_EXPORT_FUNCTION(dcn_chat_get_name);
  NAPI_EXPORT_FUNCTION(dcn_chat_get_profile_image);
  NAPI_EXPORT_FUNCTION(dcn_chat_get_type);
  NAPI_EXPORT_FUNCTION(dcn_chat_is_self_talk);
  NAPI_EXPORT_FUNCTION(dcn_chat_is_unpromoted);
  NAPI_EXPORT_FUNCTION(dcn_chat_is_verified);
  NAPI_EXPORT_FUNCTION(dcn_chat_is_device_talk);
  NAPI_EXPORT_FUNCTION(dcn_chat_is_muted);

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
  NAPI_EXPORT_FUNCTION(dcn_contact_get_color);
  NAPI_EXPORT_FUNCTION(dcn_contact_get_display_name);
  NAPI_EXPORT_FUNCTION(dcn_contact_get_first_name);
  NAPI_EXPORT_FUNCTION(dcn_contact_get_id);
  NAPI_EXPORT_FUNCTION(dcn_contact_get_name);
  NAPI_EXPORT_FUNCTION(dcn_contact_get_name_n_addr);
  NAPI_EXPORT_FUNCTION(dcn_contact_get_profile_image);
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
  NAPI_EXPORT_FUNCTION(dcn_msg_get_received_timestamp);
  NAPI_EXPORT_FUNCTION(dcn_msg_get_setupcodebegin);
  NAPI_EXPORT_FUNCTION(dcn_msg_get_showpadlock);
  NAPI_EXPORT_FUNCTION(dcn_msg_get_sort_timestamp);
  NAPI_EXPORT_FUNCTION(dcn_msg_get_state);
  NAPI_EXPORT_FUNCTION(dcn_msg_get_summary);
  NAPI_EXPORT_FUNCTION(dcn_msg_get_summarytext);
  NAPI_EXPORT_FUNCTION(dcn_msg_get_text);
  NAPI_EXPORT_FUNCTION(dcn_msg_get_timestamp);
  NAPI_EXPORT_FUNCTION(dcn_msg_get_viewtype);
  NAPI_EXPORT_FUNCTION(dcn_msg_get_width);
  NAPI_EXPORT_FUNCTION(dcn_msg_has_deviating_timestamp);
  NAPI_EXPORT_FUNCTION(dcn_msg_has_location);
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
  NAPI_EXPORT_FUNCTION(dcn_msg_set_text);
  NAPI_EXPORT_FUNCTION(dcn_msg_set_location);

  /**
   * dc_location
   */
  NAPI_EXPORT_FUNCTION(dcn_set_location);
  NAPI_EXPORT_FUNCTION(dcn_get_locations);

  /**
   * dc_provider
   */
  NAPI_EXPORT_FUNCTION(dcn_provider_new_from_email);
  NAPI_EXPORT_FUNCTION(dcn_provider_get_overview_page);
  NAPI_EXPORT_FUNCTION(dcn_provider_get_before_login_hint);
  NAPI_EXPORT_FUNCTION(dcn_provider_get_status);

  /**
   * dc_array
   */
  NAPI_EXPORT_FUNCTION(dcn_array_get_cnt);
  NAPI_EXPORT_FUNCTION(dcn_array_get_id);
  NAPI_EXPORT_FUNCTION(dcn_array_get_accuracy);
  NAPI_EXPORT_FUNCTION(dcn_array_get_latitude);
  NAPI_EXPORT_FUNCTION(dcn_array_get_longitude);
  NAPI_EXPORT_FUNCTION(dcn_array_get_timestamp);
  NAPI_EXPORT_FUNCTION(dcn_array_get_msg_id);
  NAPI_EXPORT_FUNCTION(dcn_array_is_independent);
  NAPI_EXPORT_FUNCTION(dcn_array_get_contact_id);
  NAPI_EXPORT_FUNCTION(dcn_array_get_chat_id);
  NAPI_EXPORT_FUNCTION(dcn_array_get_marker);
}

