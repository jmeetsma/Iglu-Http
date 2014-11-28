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

package org.ijsberg.iglu.util.http;

import org.ijsberg.iglu.util.misc.StringSupport;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;

/**
 */
public abstract class HttpEncodingSupport {
	/**
	 * Encodes a String in format suitable for use in URL's
	 *
	 * @param input
	 * @return
	 */
	public static String urlEncode(String input)
	{
		if (input == null)
		{
			return "";
		}
		try
		{
			return URLEncoder.encode(input, "UTF-8");
		}
		catch (UnsupportedEncodingException uee)
		{
			String result = StringSupport.replaceAll(input, "&", "%26");
			result = StringSupport.replaceAll(result, "<", "%3c");
			result = StringSupport.replaceAll(result, ">", "%3e");
			result = StringSupport.replaceAll(result, "\"", "%22");
			result = StringSupport.replaceAll(result, " ", "+");
			return result;
		}
	}

	/**
	 * Encodes a String in format suitable for use in HTML form input.
	 * Disables malicious input used for cross-scripting hacks.
	 * Converts null to empty string;
	 *
	 * @param input
	 * @return
	 */
	public static String htmlEncode(String input)
	{
		if (input == null)
		{
			return "";
		}
		StringBuffer retval = new StringBuffer(input);
		StringSupport.replaceAll(retval, "&", "&amp;");
		StringSupport.replaceAll(retval, "<", "&lt;");
		StringSupport.replaceAll(retval, ">", "&gt;");
		StringSupport.replaceAll(retval, "\"", "&quot;");
		return retval.toString();
	}
}
