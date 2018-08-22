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


#ifndef __EVENTQUEUE_H__
#define __EVENTQUEUE_H__
#ifdef __cplusplus
extern "C" {
#endif


#include <stdint.h>


typedef struct eventqueue_t eventqueue_t;

typedef struct eventqueue_item_t {
	int       event;
	uintptr_t data1;
	uintptr_t data2;
	struct eventqueue_item_t* next_;
} eventqueue_item_t;


eventqueue_t*         eventqueue_new        ();
void                  eventqueue_unref      (eventqueue_t*);

void                  eventqueue_push       (eventqueue_t*, int event, uintptr_t data1, uintptr_t data2);
eventqueue_item_t*    eventqueue_pop        (eventqueue_t*);

void                  eventqueue_item_unref (eventqueue_item_t*);


#ifdef __cplusplus
} /* /extern "C" */
#endif
#endif /* __EVENTQUEUE_H__ */
