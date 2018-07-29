#include <napi-macros.h>

#undef NAPI_UTF8

#define NAPI_UTF8(name, val) \
  size_t name##_size = 0; \
  NAPI_STATUS_THROWS(napi_get_value_string_utf8(env, val, NULL, 0, &name##_size)); \
  char* name = malloc((name##_size + 1) * sizeof(char)); \
  size_t name##_len; \
  NAPI_STATUS_THROWS(napi_get_value_string_utf8(env, val, name, name##_size + 1, &name##_len)); \
  name[name##_size] = '\0';

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

#define NAPI_RETURN_UNDEFINED() \
  return 0;

#define NAPI_RETURN_AND_FREE_STRING(name) \
  napi_value return_utf8; \
  napi_create_string_utf8(env, name, NAPI_AUTO_LENGTH, &return_utf8); \
  free(name); \
  return return_utf8;
