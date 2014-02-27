package org.ijsberg.iglu.server.http.servlet;

import org.ijsberg.iglu.util.io.FileSupport;

import java.io.IOException;

/**
 */
public class ZipFileResourceServlet extends BinaryResourceServlet implements ZipFileResource {

	private String zipFileName = null;

	@Override
	public void setZipFileName(String zipFileName) {
		this.zipFileName = zipFileName;
	}


	@Override
	public byte[] getResource(String path) throws IOException {

		if(zipFileName == null) {
			return "currently no resources available".getBytes();
		}

		return FileSupport.getBinaryFromJar(path, zipFileName);
	}
}
