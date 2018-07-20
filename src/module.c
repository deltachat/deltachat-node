#define NAPI_EXPERIMENTAL
#include <node_api.h>
#include <deltachat.h>
#include <pthread.h>


napi_value napi_threadsafe_function_event_handler = NULL;

pthread_mutex_t mutex_event_handler = PTHREAD_MUTEX_INITIALIZER;
int event_handler_current_event;

napi_value MyFunction(napi_env env, napi_callback_info info) {
  napi_status status;
  
  size_t argc = 1;
  napi_value argv[1];
  status = napi_get_cb_info(env, info, &argc, argv, NULL, NULL);

  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Failed to parse arguments");
  }

  int number = 0;
  status = napi_get_value_int32(env, argv[0], &number);

  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Invalid number was passed as argument");
  }
  
  napi_value myNumber;
  number = number * 2;
  status = napi_create_int32(env, number, &myNumber);

  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to create return value");
  }

  napi_value test;
  int testInt = 3;
  status = napi_create_external(env, testInt, NULL, NULL, &test);

  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to create test value");
  }
  
  return test;
}

// dc_context_new

uintptr_t event_handler_func(dc_context_t* context, int event, uintptr_t data1, uintptr_t data2)
{
    printf("%i\r\n", event);
    if(napi_threadsafe_function_event_handler != NULL) {
      pthread_mutex_lock(&mutex_event_handler);
      printf("a %d", event);
      event_handler_current_event = event;
      napi_call_threadsafe_function(napi_threadsafe_function_event_handler, NULL, napi_tsfn_blocking);
    }
    return 0; // for unhandled events, it is always safe to return 0
}

napi_value napi_dc_context_new(napi_env env, napi_callback_info info) {
  napi_status status;


  size_t argc = 1;
  napi_value argv[1];
  status = napi_get_cb_info(env, info, &argc, argv, NULL, NULL);

  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Failed to parse arguments");
  }

  napi_value context_napi;
  dc_context_t* context = dc_context_new(event_handler_func, NULL, NULL);
  status = napi_create_external(env, context, NULL, NULL, &context_napi);

  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to create external dc_context object");
  }
  
  return context_napi;

}

// dc_perfom_jobs_start
void* imap_thread_func(void* context)
{
    while (true) {
        dc_perform_imap_jobs(context);
        dc_perform_imap_fetch(context);
        dc_perform_imap_idle(context);
    }
}
void* smtp_thread_func(void* context)
{
    while (true) {
        dc_perform_smtp_jobs(context);
        dc_perform_smtp_idle(context);
    }
}

napi_value napi_dc_perform_jobs_start(napi_env env, napi_callback_info info) {
  napi_status status;

  size_t argc = 1;
  napi_value argv[1];
  status = napi_get_cb_info(env, info, &argc, argv, NULL, NULL);

  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Failed to parse arguments");
  }


  dc_context_t* *context;
  status = napi_get_value_external(env, argv[0], &context);

  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Invalid context object got passed");
  }

 
  pthread_t imap_thread, smtp_thread;
  pthread_create(&imap_thread, NULL, imap_thread_func, context);
  pthread_create(&smtp_thread, NULL, smtp_thread_func, context);
  //printf(context);
  

  napi_value return_value;
  status = napi_create_int32(env, 1, &return_value);

  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to create return value");
  }

  return return_value;
}

//dc_set_event_handler_cb

void my_finalize(napi_env env, void* finalize_data, void* finalize_hint)
{
  printf("my_finalize...\n");
}

void my_callback(napi_env env, napi_value js_callback, void* context, void* data)
{
  napi_value global;
  napi_status status = napi_get_global(env, &global);
  
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to get global");
  }

  napi_value argv[1];
  status = napi_create_int32(env, event_handler_current_event, &argv);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to create argv[0] for event_handler arguments");
  }
  
  napi_value result;

  status = napi_call_function(
    env,
    global,
    js_callback,
    1,
    argv,
    &result);
  
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to call event_handler callback");
  }
  printf("b %d\n", event_handler_current_event);
  pthread_mutex_unlock(&mutex_event_handler);
}

napi_value napi_dc_set_event_handler_cb(napi_env env, napi_callback_info info) {
  napi_status status;

  size_t argc = 2;
  napi_value argv[2];
  status = napi_get_cb_info(env, info, &argc, argv, NULL, NULL);

  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Failed to parse arguments");
  }


  dc_context_t* *context;
  status = napi_get_value_external(env, argv[0], &context);

  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Invalid context object got passed");
  }

  napi_value callback = argv[1];
  printf((char)callback + "xxx\n");

  napi_value async_resource_name;
  napi_create_string_utf8(env, "no_name", NAPI_AUTO_LENGTH, &async_resource_name);
  status = napi_create_threadsafe_function(
    env,
    callback,
    0,
    async_resource_name,
    0,
    3,
    0,
    my_finalize,
    NULL,
    my_callback,
    &napi_threadsafe_function_event_handler);

  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to get the threadsafe version of the javascript eventHandler callback");
  }
  


  napi_value return_value;
  status = napi_create_int32(env, 1, &return_value);

  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to create return value");
  }

  return return_value;
}

// Init
napi_value Init(napi_env env, napi_value exports) {
  napi_status status;
  
  napi_value fn_MyFunction;
  status = napi_create_function(env, NULL, 0, MyFunction, NULL, &fn_MyFunction);

  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to wrap native function MyFunction");
  }

  status = napi_set_named_property(env, exports, "MyFunction", fn_MyFunction);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to populate exports with MyFunction");
  }


  napi_value fn_napi_dc_context_new;
  status = napi_create_function(env, NULL, 0, napi_dc_context_new, NULL, &fn_napi_dc_context_new);

  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to wrap native function napi_dc_context_new");
  }

  status = napi_set_named_property(env, exports, "dc_context_new", fn_napi_dc_context_new);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to populate exports with dc_context_new");
  }
  
  napi_value fn_napi_dc_perfom_jobs_start;
  status = napi_create_function(env, NULL, 0, napi_dc_perform_jobs_start, NULL, &fn_napi_dc_perfom_jobs_start);

  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to wrap native function napi_dc_perform_jobs_start");
  }

  status = napi_set_named_property(env, exports, "dc_perform_jobs_start", fn_napi_dc_perfom_jobs_start);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to populate exports with dc_perfom_jobs_start");
  }

  napi_value fn_napi_dc_set_event_handler_cb;
  status = napi_create_function(env, NULL, 0, napi_dc_set_event_handler_cb, NULL, &fn_napi_dc_set_event_handler_cb);

  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to wrap native function napi_dc_set_event_handler_cb");
  }

  status = napi_set_named_property(env, exports, "dc_set_event_handler_cb", fn_napi_dc_set_event_handler_cb);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to populate exports with dc_set_event_handler_cb");
  }
  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
