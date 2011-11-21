/*
 * Copyright 2011 Jeroen Meetsma
 *
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


import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Enumeration;
import java.util.HashMap;

/**
 * Servlet to test a servlet Environment.
 */
public class SnoopServlet extends HttpServlet {
	/**
	 *
	 */
	public SnoopServlet() {
	}

	/**
	 * @param conf
	 * @throws ServletException
	 */
	public void init(ServletConfig conf) throws ServletException {
		super.init(conf);

		HashMap params = new HashMap();
		Enumeration e = conf.getInitParameterNames();
		while (e.hasMoreElements()) {
			Object o = e.nextElement();
			params.put(o, conf.getInitParameter((String) o));
		}
	}


	/**
	 * Displays request data
	 *
	 * @param request
	 * @param response
	 * @throws IOException
	 */
	public void service(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
		//Creates the output stream.
		PrintWriter out = response.getWriter();
		response.setContentType("text/html");

		//Creates the HTML file with the appropriate tags
		out.println("<HTML><HEAD><TITLE>Snoop Servlet</TITLE></HEAD>");
		//Sets background to white
		out.println("<BODY BGColor = \"white\">");
		//Prints the url, using the request object.
		out.println("<H1>URL</H1>");
		out.println("http://" + request.getServerName() + ':' + request.getServerPort() + request.getRequestURI() + "<BR><BR>");
		out.println("Request Protocol: " + request.getProtocol() + "<BR>");

		out.println("<H1>Servlet Init Variables:</H1>");
		Enumeration e = getServletConfig().getInitParameterNames();
		while (e.hasMoreElements()) {
			Object o = e.nextElement();
			out.println(String.valueOf(o) + " = " + getServletConfig().getInitParameter((String) o) + "<BR>");
		}
		out.println("<BR><BR>");

		//Prints out HTTP variables, each one is self explanitory.
		//Uses the request object to get the information.
		out.println("<H1>HTTP Header Variables:</H1>");
		out.println("Request Protocol: " + request.getProtocol() + "<BR>");
		out.println("Request Method: " + request.getMethod() + "<BR>");
		out.println("Remote Host: " + request.getRemoteHost() + "<BR>");
		out.println("Remote User: " + request.getRemoteUser() + "<BR>");
		out.println("Remote Address: " + request.getRemoteAddr() + "<BR>");
		out.println("Content Type: " + request.getContentType() + "<BR>");
		out.println("Content Length: " + request.getContentLength() + "<BR>");
		out.println("Query String: " + request.getQueryString() + "<BR>");
		out.println("Server Name: " + request.getServerName() + "<BR>");
		out.println("Server Port: " + request.getServerPort() + "<BR>");
		out.println("Request URI: " + request.getRequestURI() + "<BR>");
		out.println("Servlet Path: " + request.getServletPath() + "<BR><BR>");
		out.println("<H1>User Supplied Parameters:</H1>");

		printParameters(request, out);

		out.println("<H1>Headers:</H1>");
		e = request.getHeaderNames();
		while (e.hasMoreElements()) {
			String key = (String) e.nextElement();
			String value = request.getHeader(key);
			out.print(' ' + key + " = ");
			out.print(value + "<BR>");
		}

		out.println("<BR><BR>");

		//Prints out HTTP variables, each one is self explanitory.
		//Uses the request object to get the information.
		out.println("<H1>Servlet Context attributes:</H1>");

		e = getServletContext().getAttributeNames();
		while (e.hasMoreElements()) {
			Object o = e.nextElement();
			out.println(String.valueOf(o) + " = " + getServletContext().getAttribute((String) o) + "<BR>");
		}

		out.println("<BR><BR>");

		//Prints out HTTP variables, each one is self explanitory.
		//Uses the request object to get the information.
		out.println("<H1>Servlet Context init parameters:</H1>");

		e = getServletContext().getInitParameterNames();
		while (e.hasMoreElements()) {
			Object o = e.nextElement();
			out.println(String.valueOf(o) + " = " + getServletContext().getInitParameter((String) o) + "<BR>");
		}

	}

	public static void printParameters(HttpServletRequest request, PrintWriter out) {
		//Retrieves the user parameters using Enumeration e.
		//Scrolls through each parameter and prints it out.
		Enumeration e = request.getParameterNames();
		while (e.hasMoreElements()) {
			String key = (String) e.nextElement();
			String[] values = request.getParameterValues(key);
			out.print(' ' + key + " = ");
			for (int i = 0; i < values.length; i++) {
				out.print(values[i] + ' ');
			}
			out.println();
		}
	}
}


