// TODO remove this file

/*******************************************************************************
 *
 *                              Delta Chat Core
 *                      Copyright (C) 2017 Björn Petersen
 *                   Contact: r10s@b44t.com, http://b44t.com
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program.  If not, see http://www.gnu.org/licenses/ .
 *
 ******************************************************************************/


#include <stdlib.h>
#include <string.h>
#include <uv.h>
#include "strtable.h"
#include <deltachat-ffi/deltachat.h>


typedef struct strtable_t {
  uv_mutex_t mutex;
  char*      str[DC_STR_COUNT];
} strtable_t;

strtable_t* strtable_new()
{
  strtable_t* strtable = calloc(1, sizeof(strtable_t));
  if (strtable == NULL) {
    exit(666);
  }

  uv_mutex_init(&strtable->mutex);

  return strtable;
}

void strtable_unref(strtable_t* strtable)
{
  if (strtable == NULL) {
    return;
  }

  for (int i = 0; i < DC_STR_COUNT; i++) {
    free(strtable->str[i]);
  }

  uv_mutex_destroy(&strtable->mutex);

  free(strtable);
}

void strtable_set_str(strtable_t* strtable, int i, const char* str)
{
  if (strtable == NULL || i < 0 || i >= DC_STR_COUNT) {
    return;
  }

  uv_mutex_lock(&strtable->mutex);
    free(strtable->str[i]);
    strtable->str[i] = str? strdup(str) : NULL;
  uv_mutex_unlock(&strtable->mutex);
}

char* strtable_get_str(strtable_t* strtable, int i)
{
  char* str = NULL;

  if (strtable == NULL || i < 0 || i >= DC_STR_COUNT) {
    return NULL;
  }

  uv_mutex_lock(&strtable->mutex);
    str = strtable->str[i]? strdup(strtable->str[i]) : NULL;
  uv_mutex_unlock(&strtable->mutex);

  return str;
}


void strtable_clear(strtable_t* strtable)
{
  uv_mutex_lock(&strtable->mutex);
    for (int i=0; i<DC_STR_COUNT; i++) {
      free(strtable->str[i]);
      strtable->str[i] = NULL;
    }
  uv_mutex_unlock(&strtable->mutex);
}
