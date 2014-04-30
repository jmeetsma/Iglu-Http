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

/**
 */
public abstract class BinaryResourceServlet extends HttpServlet {

	protected String documentRoot;

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
			if(resourcePath.endsWith("/")) {
				resourcePath += "index.html";
			}
			if(resourcePath.endsWith(".js")) {
				response.setContentType("text/plain");
			}

			System.out.println(new LogEntry(Level.DEBUG, "obtaining resource: " + resourcePath));

			out.write(getResource(resourcePath));
		} catch (Exception e) {
			System.out.println(new LogEntry("unable to obtain resource", e));
		}
	}


	public abstract byte[] getResource(String path) throws IOException;

}
