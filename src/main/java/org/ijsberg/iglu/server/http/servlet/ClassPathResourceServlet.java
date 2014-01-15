/*
 * Copyright 2011-2013 Jeroen Meetsma - IJsberg
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

import org.ijsberg.iglu.logging.Level;
import org.ijsberg.iglu.logging.LogEntry;
import org.ijsberg.iglu.util.io.FileSupport;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Enumeration;
import java.util.HashMap;

/**
 */
public class ClassPathResourceServlet extends HttpServlet {

	private String documentRoot;

	public void init(ServletConfig conf) throws ServletException {
		super.init(conf);

		documentRoot = conf.getInitParameter("document_root");
		if(documentRoot == null) {
			documentRoot = "";
		}
	}


	public void service(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
		//Creates the output stream.
	  try {
		ServletOutputStream out = response.getOutputStream();
		String resourcePath = FileSupport.convertToUnixStylePath(documentRoot + '/' + request.getPathInfo());
		  if(resourcePath.startsWith("/")) {
			  resourcePath = resourcePath.substring(1);
		  }

		System.out.println(new LogEntry(Level.DEBUG, "obtaining resource: " + resourcePath));

		byte[] resource = FileSupport.getBinaryFromClassLoader(resourcePath);

//		System.out.println(new String(resource));

		out.write(resource);
	  }catch (Exception e) {
		  e.printStackTrace();
	  }



	}
}