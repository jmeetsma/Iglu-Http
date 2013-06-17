/* =======================================================================
 * Copyright (c) 2003-2010 IJsberg Automatisering BV. All rights reserved.
 * Redistribution and use of this code are permitted provided that the
 * conditions of the Iglu License are met.
 * The license can be found in org.ijsberg.iglu.StandardApplication.java
 * and is also published on http://iglu.ijsberg.org/LICENSE.
 * =======================================================================
 */
package org.ijsberg.iglu.util.http;

//import org.ijsberg.iglu.server.http.servlet.ServletRequestAbortedException;

import org.ijsberg.iglu.access.AuthenticationException;
import org.ijsberg.iglu.access.Base64EncodedCredentials;
import org.ijsberg.iglu.access.Request;
import org.ijsberg.iglu.access.User;
import org.ijsberg.iglu.exception.ResourceException;
import org.ijsberg.iglu.logging.LogEntry;
import org.ijsberg.iglu.server.http.servlet.ServletRequestAlreadyRedirectedException;
import org.ijsberg.iglu.util.io.FileData;
import org.ijsberg.iglu.util.io.StreamSupport;
import org.ijsberg.iglu.util.mail.MimeTypeSupport;
import org.ijsberg.iglu.util.misc.StringSupport;

import javax.servlet.*;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.*;

//import org.ijsberg.iglu.server.http.servlet.ServletRequestAlreadyRedirectedException;

/**
 *
 */
public class ServletSupport
{
	public static final int BUFFER_SIZE = 1024;

	private ServletSupport()
	{
	}

	/**
	 * Takes as many precautions as possible to prevent this page from being cached by the browser
	 */
	public static void setNoCache(HttpServletRequest request,
								  HttpServletResponse response)
	{
		//get rid of unwanted whitespace
		String protocol = request.getProtocol().trim();

//		if ("HTTP/1.0".equals(protocol))
		{
			response.setHeader("Pragma", "no-cache");
		}
//		else if ("HTTP/1.1".equals(protocol))
		{
			response.setHeader("Cache-Control", "no-cache, max-age=0, revalidate");//no-store only disables archiving
		}

		//get browser type
//		String userAgent = request.getHeader("User-Agent");

//		if ((userAgent != null) && (userAgent.indexOf("MSIE") != -1))
		{
			//Internet Explorer:
			//date and timestamp will be set to jan 1st 1970, so no caching is performed.
//			response.setDateHeader("Expires", 0);
		}
		long now = System.currentTimeMillis();
		response.setDateHeader("Date", now);
		response.setDateHeader("Expires", now);
		response.setDateHeader("Last-Modified", now);


	}


	/**
	 * Reads uploaded files and form variables from POSTed data.
	 * Obtained data is stored as attributes on the http-request.
	 * Files are stored as FileObjects, using the name of the html-form-variable as key.
	 * Plain properties are stored as Strings.
	 *
	 * @param request
	 * @return total nr of bytes read
	 * @throws IOException
	 * @see FileData
	 */
	public static long readMultipartUpload(ServletRequest request) throws IOException
	{
		return readMultipartUpload(request, null);
	}

	/**
	 * Reads uploaded files and form variables from POSTed data.
	 * Files are stored on disk in case uploadDir is not null.
	 * Otherwise files are stored as attributes on the http-request in the form of FileObjects, using the name of the html-form-variable as key.
	 * Plain properties are stored as String attributes on the http-request.
	 *
	 * In case a file to be stored on disk already exists, the existing file is preserved
	 * and renamed by adding a sequence number to its name. 
	 *
	 * @param request
	 * @param uploadDir path to the directory where to store read files
	 * @return total nr of bytes read
	 * @throws IOException
	 * @see FileData
	 */
	public static long readMultipartUpload(ServletRequest request, String uploadDir) throws IOException
	{
		ServletInputStream input = request.getInputStream();
		//the next variable stores all post data and is useful for debug purposes

//		RTE.log("MULTIPART input:" + Str.absorbInputStream(input));

//		ByteArrayOutputStream completeCopy = new ByteArrayOutputStream();
		byte[] line = new byte[BUFFER_SIZE];
		int len = input.readLine(line, 0, BUFFER_SIZE);
//		completeCopy.write(line, 0, len);

		if (len <= 2)
		{
			return 0;
		}

		long postDataSize = len;
		int nrofMegabytesUploaded = (int) (postDataSize / 1048576);

		//save the multipart boundary string
		String boundary = new String(line, 0, len - 2);

		while ((len = input.readLine(line, 0, BUFFER_SIZE)) != -1)
		{
			String propertyName = null;
			String fullFileName = null;
			String contentType = null;

			//read until empty line

			for (; len > 2; len = input.readLine(line, 0, BUFFER_SIZE))
			{
//				completeCopy.write(line, 0, len);
				postDataSize += len;
				String newLine = new String(line, 0, len);
				if (newLine.startsWith("Content-Disposition: form-data;"))
				{
					propertyName = newLine.substring(newLine.indexOf("name=") + 6, newLine.indexOf('\"', newLine.indexOf("name=") + 6));
					if (newLine.indexOf("filename") != -1)
					{
						fullFileName = newLine.substring(newLine.indexOf("filename=") + 10, newLine.indexOf('\"', newLine.indexOf("filename=") + 10));
					}
				}
				if (newLine.startsWith("Content-Type: "))
				{
					contentType = newLine.substring(newLine.indexOf("Content-Type: ") + 14, newLine.length() - 2);
				}
			}
//			completeCopy.write(line, 0, len);
			postDataSize += len;
			len = input.readLine(line, 0, BUFFER_SIZE);

			//before the boundary that indicates the end of the file
			//there is a line separator which does not belong to the file
			//it's necessary to filter it out without too much memory overhead
			//it's not clear where the line separator comes from.
			//this has to work on Windows and UNIX

			OutputStream partialCopy = null;
			if (fullFileName != null && uploadDir != null)
			{
				//check if file exists
				FileData file = new FileData(fullFileName, contentType);
				File uploadFile = new File(uploadDir + '/' + file.getFileName());
				if(uploadFile.exists())
				{
					int i = 0;
					File existingUploadFile = uploadFile;
					while (uploadFile.exists())
					{
						uploadFile = new File(uploadDir + '/' + file.getFileNameWithoutExtension() + '_' + i++ + '.' + file.getExtension());
					}
					existingUploadFile.renameTo(uploadFile);
					uploadFile = new File(uploadDir + '/' + file.getFileName());
				}
				partialCopy = new FileOutputStream(uploadFile);
			}
			else
			{
				partialCopy = new ByteArrayOutputStream();
			}

			byte[] line2 = new byte[BUFFER_SIZE];
			int len2 = 0;

			byte[] line3 = new byte[BUFFER_SIZE];
			int len3 = 0;

			LOOP:
			for (; len != -1; len = input.readLine(line, 0, BUFFER_SIZE))
			{
//				completeCopy.write(line, 0, len);
				postDataSize += len;

				int temp = nrofMegabytesUploaded;
				nrofMegabytesUploaded = (int) (postDataSize / 1048576);
				if (nrofMegabytesUploaded > temp)
				{
					//TODO agent should know this
					System.out.println(new LogEntry(String.valueOf(nrofMegabytesUploaded) + " Mb uploaded via upload servlet"));
				}

				String newLine = new String(line, 0, len);

				if (newLine.startsWith(boundary))
				{
					if ((len2 == 1) && (len3 > 0))//must be a \n
					{
						partialCopy.write(line3, 0, len3 - 1);//get rid of the \r
					}
					else if (len2 >= 2)//\n found
					{
						partialCopy.write(line3, 0, len3);
						partialCopy.write(line2, 0, len2 - 2);//get rid of the \n
					}
					break LOOP;
				}
				partialCopy.write(line3, 0, len3);
				len3 = len2;
				line3 = line2;
				len2 = len;
				line2 = line;
				line = new byte[BUFFER_SIZE];
			}
//			completeCopy.write(line, 0, len);
			postDataSize += len;

			if (fullFileName != null)
			{
				if (uploadDir == null)
				{
					FileData file = new FileData(fullFileName, contentType);
					file.setDescription("Obtained from: " + fullFileName);
					file.setRawData(((ByteArrayOutputStream) partialCopy).toByteArray());
					//propertyName is specified in HTML form like <INPUT TYPE="FILE" NAME="myPropertyName">
					request.setAttribute(propertyName, file);
					System.out.println(new LogEntry("FILE FOUND:" + file));
				}
			}
			else
			{
				String propertyValue = partialCopy.toString();
				request.setAttribute(propertyName, propertyValue);
				System.out.println(new LogEntry("PROPERTY FOUND:" + propertyName + '=' + propertyValue));
			}
			partialCopy.close();
		}
		System.out.println(new LogEntry("POST_DATA FOUND:" + postDataSize + " bytes"));
//		request.setAttribute("post_data", completeCopy.toByteArray());

		return postDataSize;
	}

	public static Properties readURLEncodedPostData(ServletRequest request) throws IOException
	{
		ServletInputStream input = request.getInputStream();
		//the next variable stores all post data and is useful for debug purposes

		String data = new String(StreamSupport.absorbInputStream(input));

		Properties retval = new Properties(/*"http-request-parameters"*/);

		StringTokenizer tokenizer = new StringTokenizer(data, "&", false);
		while (tokenizer.hasMoreElements())
		{
			String nameValuePair = tokenizer.nextToken();
			int separator = nameValuePair.indexOf('=');
			if (separator != -1)
			{
				String name = URLDecoder.decode(nameValuePair.substring(0, separator), "UTF-8");
				String value = URLDecoder.decode(nameValuePair.substring(separator + 1), "UTF-8");
				retval.setProperty(name, value);

				System.out.println(new LogEntry("request parameter found: [" + name + '=' + value + ']'));
			}
		}
		return retval;
	}

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

	/**
	 * Gets a clean base url including the path from the current request.
	 *
	 * @param req
	 * @return
	 */
	public static String getRequestURL(HttpServletRequest req)
	{


		return req.getRequestURL().toString();
/*
		return req.getServerPort() == 443 ? "https://" : "http://"+
				req.getServerName() +
				(req.getServerPort() != 80 ? ":" + req.getServerPort() : "") +
				req.getServletPath();*/
	}

	/**
	 * Gets a clean base url including the path from the current request.
	 *
	 * @param req
	 * @return
	 */
	public static String getRelativeRequestURL(HttpServletRequest req)
	{
//		return req.getServletPath();
		return req.getRequestURI();
	}

	/**
	 * Gets a clean base url without the path from the current request.
	 *
	 * @param req
	 * @return
	 */
/*	public static String getRequestURLBase(HttpServletRequest req)
	{
		return "http://" + req.getServerName() +
				(req.getServerPort() != 80 ? ":" + req.getServerPort() : "");
	} */

	/**
	 * Gets a clean base url without the path from the current request.
	 *
	 * @param req
	 * @return
	 */
	public static String getRequestURLBaseWithoutProtocol(HttpServletRequest req)
	{
		return req.getServerName() +
				(req.getServerPort() != 80 ? ":" + req.getServerPort() : "");
	}

	/**
	 * Does one of the following things:
	 * <ul
	 * <li>retrieves current logged in user</li>
	 * <li>performs authentication based on the credentials provided</li>
	 * <li>asks the client to provide credentials if no one is logged in to current session,
	 * followed by throwing a ServletRequestAlreadyRedirectedException</li>
	 * </ul>
	 *
	 *@param request
	 * @param response
	 * @param realmDescription @return logged in user if found @throws java.io.IOException
	 * @throws ServletRequestAlreadyRedirectedException in case the http-request must be aborted at this stage
	 */
	public static User getUserByBasicAuthentication(Request applicationRequest, HttpServletRequest request, HttpServletResponse response, String realmDescription) throws IOException, ServletRequestAlreadyRedirectedException
	{
//		Request applicationRequest = application.getCurrentRequest();
//		String realmId = applicationRequest.getRealm().getId();
		if (applicationRequest == null)
		{
			throw new IllegalStateException("application request is missing; is entry point configured?");
		}
		User user = applicationRequest.getUser();
		if (user == null)
		{
			String header = request.getHeader("Authorization");

			if (header == null)
			{
				response.addHeader("WWW-Authenticate", "Basic realm=\"" + (realmDescription != null ? realmDescription : "access to realm IGLU") + '\"');
				response.sendError(401);
				throw new ServletRequestAlreadyRedirectedException("user must be authenticated first");
			}
			else
			{
				String credentials = header.substring(6);
				System.out.println(new LogEntry("about to login"));
				try
				{
					user = applicationRequest.login(new Base64EncodedCredentials(credentials));
				}
				catch(AuthenticationException ae)
				{
					System.out.println(new LogEntry(ae.getMessage()));
					response.addHeader("WWW-Authenticate", "Basic realm=\"" + (realmDescription != null ? realmDescription : "access to realm IGLU") + '\"');
					response.sendError(401);
					throw new ServletRequestAlreadyRedirectedException("user must be authenticated first");
				}
				System.out.println(new LogEntry("logged in:" + user.getId()));
			}
		}
		return user;
	}


	public static void rethrow(Throwable t) throws ServletException, IOException
	{
		if (t instanceof Error)
		{
			throw (Error) t;
		}
		if (t instanceof RuntimeException)
		{
			throw (RuntimeException) t;
		}
		if (t instanceof ServletException)
		{
			throw (ServletException) t;
		}
		if (t instanceof IOException)
		{
			throw (IOException) t;
		}
	}

	public static void printException(ServletResponse response, String message, Throwable cause) throws IOException, ServletException
	{
		Throwable cause1 = cause;
		PrintWriter out = response.getWriter();
		response.setContentType("text/html");

		out.println("//\"></option></td></tr></script>");
		out.println("<pre>");
		out.println(message);
		out.println(StringSupport.getStackTrace(cause1));


//		if (cause1 instanceof ServletException)
		{
			while ((cause1 instanceof ServletException) && ((ServletException) cause1).getRootCause() != null)
			{
				out.println();
				out.println("root cause:");
				out.println(StringSupport.getStackTrace(cause1));
				cause1 = ((ServletException) cause1).getRootCause();
			}
		}
		//dump the whole stack of exceptions
		while ((cause1 = cause1.getCause()) != null)
		{
			out.println();
			out.println("cause:");
			out.println(StringSupport.getStackTrace(cause1));
		}
		out.println("</pre>");

	}

	/**
	 * Dispatches http-request to url
	 *
	 * @param url
	 * @throws ServletException to abort request handling
	 */
	public static void forward(String url, ServletRequest req, ServletResponse res) throws ServletException, IOException
	{
			RequestDispatcher dispatch = req.getRequestDispatcher(url);
			System.out.println(new LogEntry("about to forward to " + url));
			dispatch.forward(req, res);
	}

	/**
	 * Dispatches http-request to url
	 *
	 * @param url
	 * @throws ServletException to abort request handling
	 */
	public static void include(String url, ServletRequest req, ServletResponse res) throws ServletException, IOException
	{
			RequestDispatcher dispatch = req.getRequestDispatcher(url);
			System.out.println(new LogEntry("about to include " + url));
			dispatch.include(req, res);
	}

	public static void redirect(String url, ServletRequest req, ServletResponse res) throws IOException
	{
		redirect(url, false, req, res);
	}

	/**
	 * Redirects http-request to url
	 *
	 * @param url
	 */
	public static void redirect(String url, boolean copyParameters, ServletRequest req, ServletResponse res)
	{
		if(url == null)
		{
			throw new IllegalArgumentException("URL cannot be null");
		}
		String redirectUrl = url;
		char separator = '?';
		if (redirectUrl.indexOf('?') != -1)
		{
			separator = '&';
		}
		if(copyParameters)
		{
			Enumeration e = req.getParameterNames();
			while (e.hasMoreElements())
			{
				String name = (String) e.nextElement();
				String value = req.getParameter(name);
				redirectUrl += separator + name + '=' + value;
				separator = '&';
			}
			e = req.getAttributeNames();
	/*		while (e.hasMoreElements())
			{
				String name = (String) e.nextElement();
				String value = req.getParameter(name);
				redirectUrl += separator + name + '=' + value;
				separator = '&';
			}  */
		}
		System.out.println(new LogEntry("about to redirect to " + redirectUrl));
		try
		{
			((HttpServletResponse)res).sendRedirect(redirectUrl);
		}
		catch(IOException ioe)
		{
			throw new ResourceException("redirect to '" + redirectUrl + "' failed with message: " +
			ioe.getMessage(), ioe);
		}
	}


	/**
	 * Retrieves a value from a cookie
	 *
	 * @param request
	 * @param key
	 * @return
	 */
	public static String getCookieValue(ServletRequest request, String key)
	{
		Cookie[] cookies = ((HttpServletRequest) request).getCookies();
		if (cookies != null)
		{
			for (int i = 0; i < cookies.length; i++)
			{
				if (cookies[i].getName().equals(key))
				{
					return cookies[i].getValue();
				}
			}
		}
		return null;
	}


	public static Properties importCookieValues(ServletRequest request, Properties properties)
	{
		Cookie[] cookies = ((HttpServletRequest) request).getCookies();
		if (cookies != null)
		{
			for (int i = 0; i < cookies.length; i++)
			{
//				System.out.println("COOKIE:" + cookies[i].getName() + "=" + cookies[i].getValue());
				properties.setProperty(cookies[i].getName(), cookies[i].getValue());
			}
		}
		return properties;
	}

	public static void exportCookieValues(ServletResponse response, Properties properties, String path, int maxAge)
	{
		Iterator i = properties.keySet().iterator();
		while (i.hasNext())
		{
			String propertyKey = (String)i.next();
//			if(!skip.contains(propertyKey)) {
				Cookie cookie = new Cookie(propertyKey, properties.getProperty(propertyKey, ""));
				cookie.setPath(path);
				cookie.setMaxAge(maxAge);
				((HttpServletResponse) response).addCookie(cookie);
//			}
		}
	}

	public static void exportCookieValues(ServletResponse response, Properties properties, String path, int maxAge, Collection skip)
	{
		Iterator i = properties.keySet().iterator();
		while (i.hasNext())
		{
			String propertyKey = (String)i.next();
			if(!skip.contains(propertyKey)) {
				Cookie cookie = new Cookie(propertyKey, properties.getProperty(propertyKey, ""));
				cookie.setPath(path);
				cookie.setMaxAge(maxAge);
				((HttpServletResponse) response).addCookie(cookie);
			}
		}
	}

	/**
	 * Stores session id in the root of a cookie
	 * The cookie will expire as soon as the browser closes
	 *
	 * @param response
	 * @param key
	 * @param value
	 */
	public static void setCookieValue(HttpServletResponse response, String key, String value)
	{
		setCookieValue(response, key, value, "/", -1);
	}

	public static void setCookieValue(HttpServletResponse response, String key, String value, String path, int maxAge)
	{
		Cookie cookie = new Cookie(key, value);
		cookie.setPath(path);
		cookie.setMaxAge(maxAge);
		response.addCookie(cookie);
	}



	/**
	 *
	 * @param response
	 * @param path
	 * @throws IOException
	 */
	protected static void writeClassPathResource(HttpServletResponse response, String path) throws IOException
	{
		writeClassPathResource(response, path, MimeTypeSupport.getMimeTypeForFileExtension(path.substring(path.lastIndexOf('.') + 1)));
	}


	/**
	 * Obtains binary resource from classpath and writes it to http response.
	 *
	 * @param response
	 * @param path file name of the resource to write to http servlet response
	 * @param contentType
	 */
	public static void writeClassPathResource(HttpServletResponse response, String path, String contentType) throws IOException
	{
		if (path.startsWith("/"))
		{
			path = path.substring(1);
		}

//		System.out.println(new LogEntry("trying to retrieve " + path + " from classloader");
		InputStream input = ServletSupport.class.getClassLoader().getResourceAsStream(path);
		if (input != null)
		{
			response.setContentType(contentType);
			OutputStream out = response.getOutputStream();
			int available = input.available();
			while (available > 0)
			{
				byte[] buf = new byte[available];
				input.read(buf);
				out.write(buf);
				available = input.available();
			}
		}
		else
		{
			System.out.println(new LogEntry("resource " + path + " not found"));
		}
	}
	
	
}
