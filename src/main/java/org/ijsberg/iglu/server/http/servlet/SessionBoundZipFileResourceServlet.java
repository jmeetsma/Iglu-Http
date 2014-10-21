package org.ijsberg.iglu.server.http.servlet;

import org.ijsberg.iglu.access.AccessManager;
import org.ijsberg.iglu.access.Request;
import org.ijsberg.iglu.access.Session;
import org.ijsberg.iglu.util.io.FileSupport;

import java.io.IOException;

/**
 */
public class SessionBoundZipFileResourceServlet  extends BinaryResourceServlet implements ZipFileResource {

	private AccessManager accessManager;

	public void setAccessManager(AccessManager accessManager) {
		this.accessManager = accessManager;
	}

	@Override
	public void setZipFileName(String zipFileName) {
		Request request = accessManager.getCurrentRequest();
		Session session = request.getSession(true);
		session.setAttribute("zip_file_name", zipFileName);
	}


	@Override
	public byte[] getResource(String path) throws IOException {

		Request request = accessManager.getCurrentRequest();
		Session session = request.getSession(true);
		String zipFileName = (String)session.getAttribute("zip_file_name");
		if(zipFileName == null) {
			return "currently no resources available".getBytes();
		}
		byte[] resource = FileSupport.getBinaryFromJar(path, zipFileName);
		return resource;
	}

}
