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
		System.out.println("--->" + zipFileName);
		byte[] resource = FileSupport.getBinaryFromJar(path, zipFileName);
		return resource;
	}

}
