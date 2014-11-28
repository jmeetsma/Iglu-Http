/*
 * Copyright 2011-2014 Jeroen Meetsma - IJsberg Automatisering BV
 *
 * This file is part of Iglu.
 *
 * Iglu is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Iglu is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Iglu.  If not, see <http://www.gnu.org/licenses/>.
 */

package org.ijsberg.iglu.server.http.servlet;

import javax.servlet.ServletException;


/**
 * This runtime exception is thrown to indicate that handling of a specific
 * request must be aborted.
 * It's not necessary to log the exception if it's handled specifically by
 * an entry point.
 */
public class ServletRequestAbortedException extends ServletException
{
	/**
	 *
	 */
	public ServletRequestAbortedException()
	{
		super();
	}

	/**
	 * @param message
	 */
	public ServletRequestAbortedException(String message)
	{
		super(message);
	}


}
