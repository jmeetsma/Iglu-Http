package org.ijsberg.iglu.server.facilities;

import java.util.Properties;

/**
 */
public interface WebsiteUtilityService {

	String mailFormData(Properties formData, String subject, String senderMailAddress, String senderName, String recipientAddress);

	String getText(String key);

	String returnMessage(String message);

	String getLanguageCode();

	String addExceptionToRequest(String attrName, Exception e);

	String getText(String key, String defaultText);

	boolean logout();
}
