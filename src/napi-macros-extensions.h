#include <napi-macros.h>

#undef NAPI_UTF8
#define NAPI_UTF8(name, val) \
  size_t name##_size = 0; \
  NAPI_STATUS_THROWS(napi_get_value_string_utf8(env, val, NULL, 0, &name##_size)); \
  name##_size++; \
  char name[name##_size]; \
  size_t name##_len; \
  NAPI_STATUS_THROWS(napi_get_value_string_utf8(env, val, (char *) &name, name##_size, &name##_len));

#define NAPI_DCN_CONTEXT() \
  dcn_context_t* dcn_context; \
  NAPI_STATUS_THROWS(napi_get_value_external(env, argv[0], (void**)&dcn_context));

#define NAPI_RETURN_UNDEFINED() \
  return 0;

#define NAPI_RETURN_AND_FREE_STRING(name) \
  napi_value return_utf8; \
  napi_create_string_utf8(env, name, NAPI_AUTO_LENGTH, &return_utf8); \
  free(name); \
  return return_utf8;
