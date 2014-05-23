package org.ijsberg.iglu.server.http.servlet;

import org.ijsberg.iglu.util.io.FileSupport;

import java.io.IOException;
import java.util.zip.ZipFile;

/**
 */
public class ZipFileResourceServlet extends BinaryResourceServlet implements ZipFileResource {

    //
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

		byte[] resource = FileSupport.getBinaryFromJar(path, zipFileName);

        //System.out.println(new LogEntry("found " + resource.length + " bytes for resource " + path + " in zip " + zipFileName));

        return resource;
	}
}
