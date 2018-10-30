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


#ifndef __STRTABLE_H__
#define __STRTABLE_H__
#ifdef __cplusplus
extern "C" {
#endif


typedef struct strtable_t strtable_t;

strtable_t*         strtable_new        ();
void                strtable_unref      (strtable_t*);

void                strtable_set_str    (strtable_t*, int, const char*);
char*               strtable_get_str    (strtable_t*, int);
void                strtable_clear      (strtable_t*);


#ifdef __cplusplus
} /* /extern "C" */
#endif
#endif /* __STRTABLE_H__ */
