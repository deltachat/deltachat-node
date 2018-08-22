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
#include <pthread.h>
#include <deltachat.h>
#include "eventqueue.h"


typedef struct eventqueue_t {
	pthread_mutex_t    mutex;
	eventqueue_item_t* first;
} eventqueue_t;


eventqueue_t* eventqueue_new()
{
	eventqueue_t* eventqueue = calloc(1, sizeof(eventqueue_t));
	if (eventqueue==NULL) {
		exit(666);
	}

	pthread_mutex_init(&eventqueue->mutex, NULL);
	eventqueue->first = NULL;

	return eventqueue;
}


/**
 * Release the eventqueue object, empty the queue before.
 */
void eventqueue_unref(eventqueue_t* eventqueue)
{
	if (eventqueue==NULL) {
		return;
	}

	eventqueue_item_t* item = NULL;
	while ((item=eventqueue_pop(eventqueue))!=NULL) {
		eventqueue_item_unref(item);
	}

	pthread_mutex_destroy(&eventqueue->mutex);

	free(eventqueue);
}


/**
 * Add event to eventqueue. If data1/data2 contain strings, they're copied
 */
void eventqueue_push(eventqueue_t* eventqueue, int event, uintptr_t data1, uintptr_t data2)
{
	if (eventqueue==NULL) {
		return;
	}

	eventqueue_item_t* new_item = calloc(1, sizeof(eventqueue_item_t));
	if (new_item==NULL) {
		exit(666);
	}

	new_item->event = event;
	new_item->data1 = (data1 && DC_EVENT_DATA1_IS_STRING(event))? (uintptr_t)strdup((const char*)data1) : data1;
	new_item->data2 = (data2 && DC_EVENT_DATA2_IS_STRING(event))? (uintptr_t)strdup((const char*)data2) : data2;
	new_item->next_ = NULL;

	// add event to end of list
	pthread_mutex_lock(&eventqueue->mutex);
		if (eventqueue->first) {
			eventqueue_item_t* cur = eventqueue->first;
			while (cur->next_) {
				cur = cur->next_;
			}
			cur->next_ = new_item;
		}
		else {
			eventqueue->first = new_item;
		}
	pthread_mutex_unlock(&eventqueue->mutex);

}


/**
 * Get the oldest object from the eventqueue.
 * The size of the eventqueue shrinks by one.
 * The returned event must be freed using eventqueue_item_unref() if no longer used.
 * If there are no events in the eventqueue, NULL is returned.
 */
eventqueue_item_t* eventqueue_pop(eventqueue_t* eventqueue)
{
	eventqueue_item_t* first_item = NULL;

	pthread_mutex_lock(&eventqueue->mutex);
		first_item = eventqueue->first;
		if( first_item ) {
			eventqueue->first = first_item->next_;
			first_item->next_ = NULL;
		}
	pthread_mutex_unlock(&eventqueue->mutex);

	return first_item;
}


/**
 * Free an event returned by eventqueue_pop()
 */
void eventqueue_item_unref(eventqueue_item_t* item)
{
	if (item==NULL) {
		return;
	}

	if (DC_EVENT_DATA1_IS_STRING(item->event)) {
		free((void*)item->data1);
	}

	if (DC_EVENT_DATA2_IS_STRING(item->event)) {
		free((void*)item->data2);
	}

	free(item);
}
