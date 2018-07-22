#define NAPI_EXPERIMENTAL

#include <napi-macros.h>
#include <node_api.h>
#include <deltachat.h>
#include <pthread.h>

// Context struct we need for some binding specific things. dcn_context_t will
// be applied to the dc_context created in dcn_context_new().
typedef struct dcn_context_t {
  napi_value napi_threadsafe_function_event_handler;
  pthread_mutex_t mutex_g;
  int current_event_g;
} dcn_context_t;


uintptr_t dc_event_handler(dc_context_t* context, int event, uintptr_t data1, uintptr_t data2)
{
  printf("dc_event_handler, event: %d\n", event);

  /*if (napi_threadsafe_function_event_handler != NULL) {
    pthread_mutex_lock(&mutex_g);
    printf("a %d\n", event);
    current_event_g = event;
    // TODO investigate what the data parameter below does (NULL)
    napi_call_threadsafe_function(napi_threadsafe_function_event_handler, NULL, napi_tsfn_blocking);
  }*/

  return 0;
}

void my_finalize(napi_env env, void* finalize_data, void* finalize_hint)
{
  printf("my_finalize...\n");
}

void my_callback(napi_env env, napi_value js_callback, void* context, void* data)
{
  /*napi_value global;
  napi_status status = napi_get_global(env, &global);

  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to get global");
  }

  napi_value argv[1];
  status = napi_create_int32(env, current_event_g, &argv);
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


  printf("b %d\n", current_event_g);
  //pthread_mutex_unlock(&mutex_g);*/

}

NAPI_METHOD(dcn_context_new) {
  dc_context_t* dc_context = dc_context_new(dc_event_handler, NULL, NULL);
  
  napi_value dc_context_napi;
  napi_status status = napi_create_external(env, dc_context, NULL, NULL, &dc_context_napi);

  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to create external dc_context object");
  }


  return dc_context_napi;
}

NAPI_METHOD(dcn_set_event_handler) {
  NAPI_ARGV(1);

  napi_value callback = argv[0];
  napi_value async_resource_name;

  NAPI_STATUS_THROWS(napi_create_string_utf8(env, "dc_event_callback", NAPI_AUTO_LENGTH, &async_resource_name));

  /*NAPI_STATUS_THROWS(napi_create_threadsafe_function(
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
    &napi_threadsafe_function_event_handler));
  */
}

void* imap_thread_func(void* arg)
{
  /*while (true) {
    dc_perform_imap_jobs(dc_context_g);
    dc_perform_imap_fetch(dc_context_g);
    dc_perform_imap_idle(dc_context_g);
  }*/
}

void* smtp_thread_func(void* arg)
{
  /*while (true) {
    dc_perform_smtp_jobs(dc_context_g);
    dc_perform_smtp_idle(dc_context_g);
  }*/
}

NAPI_METHOD(dcn_start_threads) {
  pthread_t imap_thread;
  pthread_create(&imap_thread, NULL, imap_thread_func, NULL);

  pthread_t smtp_thread;
  pthread_create(&smtp_thread, NULL, smtp_thread_func, NULL);
}

NAPI_INIT() {
  NAPI_EXPORT_FUNCTION(dcn_context_new);
  NAPI_EXPORT_FUNCTION(dcn_set_event_handler);
  NAPI_EXPORT_FUNCTION(dcn_start_threads);
}
