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
