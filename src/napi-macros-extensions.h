#include <napi-macros.h>

#define NAPI_DCN_CONTEXT() \
  dcn_context_t* dcn_context; \
  NAPI_STATUS_THROWS(napi_get_value_external(env, argv[0], (void**)&dcn_context));

#define NAPI_DC_CHAT() \
  dc_chat_t* dc_chat; \
  NAPI_STATUS_THROWS(napi_get_value_external(env, argv[0], (void**)&dc_chat));

#define NAPI_DC_CHATLIST() \
  dc_chatlist_t* dc_chatlist; \
  NAPI_STATUS_THROWS(napi_get_value_external(env, argv[0], (void**)&dc_chatlist));

#define NAPI_DC_CONTACT() \
  dc_contact_t* dc_contact; \
  NAPI_STATUS_THROWS(napi_get_value_external(env, argv[0], (void**)&dc_contact));

#define NAPI_DC_LOT() \
  dc_lot_t* dc_lot; \
  NAPI_STATUS_THROWS(napi_get_value_external(env, argv[0], (void**)&dc_lot));

#define NAPI_DC_MSG() \
  dc_msg_t* dc_msg; \
  NAPI_STATUS_THROWS(napi_get_value_external(env, argv[0], (void**)&dc_msg));

#define NAPI_RETURN_UNDEFINED() \
  return 0;

#define NAPI_RETURN_UINT64(name) \
  napi_value return_int64; \
  NAPI_STATUS_THROWS(napi_create_bigint_int64(env, name, &return_int64)); \
  return return_int64;

#define NAPI_RETURN_AND_FREE_STRING(name) \
  napi_value return_value; \
  if (name == NULL) { \
    NAPI_STATUS_THROWS(napi_get_null(env, &return_value)); \
    return return_value; \
  } \
  NAPI_STATUS_THROWS(napi_create_string_utf8(env, name, NAPI_AUTO_LENGTH, &return_value)); \
  free(name); \
  return return_value;
