#define NAPI_ASYNC_CARRIER_BEGIN(name) \
  typedef struct name##_carriert_t { \
    napi_ref callback_ref; \
    napi_async_work async_work; \
    dcn_context_t* dcn_context; \

#define NAPI_ASYNC_CARRIER_END(name) \
  } name##_carriert_t; \


NAPI_ASYNC_CARRIER_BEGIN(test)
  int msg_id;
  char* setup_code;
  int result;
NAPI_ASYNC_CARRIER_END(test)
