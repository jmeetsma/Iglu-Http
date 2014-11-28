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


import org.ijsberg.iglu.util.http.ServletSupport;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;

/**
 */
public class UploadServlet extends HttpServlet
{
	private String uploaddir;

	/**
	 * @param conf
	 * @throws ServletException
	 */
	public void init(ServletConfig conf) throws ServletException
	{
		super.init(conf);
		uploaddir = getInitParameter("upload_directory");
		if (uploaddir == null)
		{
			throw new ServletException("upload directory must be specified as servlet parameter upload_directory");
		}
		File uploadDirFile = new File(uploaddir);
		if (!uploadDirFile.exists())
		{
			boolean success = uploadDirFile.mkdirs();
			if (!success)
			{
				throw new ServletException("upload directory '" + uploaddir + "' does not exist and can not be created");
			}
		}
		if (!uploadDirFile.isDirectory())
		{
			throw new ServletException("upload directory '" + uploaddir + "' is not a directory");
		}
	}



	public void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
	{
		res.setContentType("text/html; charset=UTF-8");
		PrintWriter out = res.getWriter();
		writeBrowsePage(req, out);
	}

	public void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
	{
		res.setContentType("text/html; charset=UTF-8");
		PrintWriter out = res.getWriter();

		if (req != null && req.getContentType() != null && req.getContentType().startsWith("multipart/form-data"))
		{
			try
			{
				//FIXME
				ServletSupport.readMultipartUpload(req, uploaddir);
/*				Enumeration e = req.getAttributeNames();
				while (e.hasMoreElements())
				{
					String name = (String) e.nextElement();
					Object attr = req.getAttribute(name);
//					context.setProperty(new Property(name, new Value(attr)));
				}*/
				writeResultPage(out, "Thanks!");
			}
			catch (Exception ioe)//FIXME
			{
				//Environment.log(ioe);
				writeResultPage(out, "Upload failed with message: " + ioe.getMessage());
			}
		}
		else
		{
			doGet(req, res);
		}
	}


	public static void writeBrowsePage(HttpServletRequest req, PrintWriter out)
	{
		out.println("<html>");
		out.println("<head>");
		out.println("<title>file upload</title>");
		out.println("</head>");

		out.println("<body>");

		out.println("<form ACTION=\"" + req.getServletPath() + "\" METHOD=\"POST\" ENCTYPE=\"multipart/form-data\">");
		out.println("<input TYPE=\"FILE\" NAME=\"example\">");
		out.println("<input TYPE=\"SUBMIT\" NAME=\"button\" VALUE=\"Upload\">");
		out.println("</form>");

		out.println("</body>");
		out.println("</html>");
	}


	public static void writeResultPage(PrintWriter out, String message)
	{
		out.println("<html>");
		out.println("<head>");
		out.println("<title>file upload</title>");
		out.println("</head>");

		out.println("<body>");

		out.println("<p>" + message + "</p>");

		out.println("</body>");
		out.println("</html>");
	}
}
