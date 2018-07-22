#define NAPI_EXPERIMENTAL

#include <napi-macros.h>
#include <node_api.h>
#include <deltachat.h>
#include <pthread.h>

// Context from deltachat-core library.
static dc_context_t* dc_context_g = NULL;

static napi_value napi_threadsafe_function_event_handler = NULL;

static pthread_mutex_t mutex_g = PTHREAD_MUTEX_INITIALIZER;

// Current event in dc_event_handler()
static int current_event_g;

uintptr_t dc_event_handler(dc_context_t* context, int event, uintptr_t data1, uintptr_t data2)
{
  printf("dc_event_handler, event: %d\n", event);

  if (napi_threadsafe_function_event_handler != NULL) {
    pthread_mutex_lock(&mutex_g);
    printf("a %d\n", event);
    current_event_g = event;
    // TODO investigate what the data parameter below does (NULL)
    napi_call_threadsafe_function(napi_threadsafe_function_event_handler, NULL, napi_tsfn_blocking);
  }

  return 0;
}

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
  pthread_mutex_unlock(&mutex_g);
}

NAPI_METHOD(create) {
  dc_context_g = dc_context_new(dc_event_handler, NULL, NULL);
  NAPI_RETURN_INT32(1);
}

NAPI_METHOD(set_event_handler) {
  NAPI_ARGV(1);

  napi_value callback = argv[0];
  napi_value async_resource_name;

  NAPI_STATUS_THROWS(napi_create_string_utf8(env, "dc_event_callback", NAPI_AUTO_LENGTH, &async_resource_name));

  NAPI_STATUS_THROWS(napi_create_threadsafe_function(
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

  NAPI_RETURN_INT32(1);
}

void* imap_thread_func(void* arg)
{
  while (true) {
    dc_perform_imap_jobs(dc_context_g);
    dc_perform_imap_fetch(dc_context_g);
    dc_perform_imap_idle(dc_context_g);
  }
}

void* smtp_thread_func(void* arg)
{
  while (true) {
    dc_perform_smtp_jobs(dc_context_g);
    dc_perform_smtp_idle(dc_context_g);
  }
}

NAPI_METHOD(start_threads) {
  pthread_t imap_thread;
  pthread_create(&imap_thread, NULL, imap_thread_func, NULL);

  pthread_t smtp_thread;
  pthread_create(&smtp_thread, NULL, smtp_thread_func, NULL);

  NAPI_RETURN_INT32(1);
}

NAPI_INIT() {
  NAPI_EXPORT_FUNCTION(create);
  NAPI_EXPORT_FUNCTION(set_event_handler);
  NAPI_EXPORT_FUNCTION(start_threads);
}
