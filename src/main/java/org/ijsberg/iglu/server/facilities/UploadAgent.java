package org.ijsberg.iglu.server.facilities;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.Properties;

/**
 */
public interface UploadAgent {

	String readMultiPartUpload(HttpServletRequest request, Properties properties, String fileName) throws IOException;

	String readMultiPartUpload(HttpServletRequest request, Properties properties) throws IOException;

	long getBytesRead();

	long getContentLength();

	String cancelUpload();

	boolean isUploadCancelled();

	void reset();

	String getProgress(String jsFunction);
}
