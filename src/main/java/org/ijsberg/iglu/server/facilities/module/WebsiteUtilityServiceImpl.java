package org.ijsberg.iglu.server.facilities.module;

import org.ijsberg.iglu.access.Request;
import org.ijsberg.iglu.access.component.RequestRegistry;
import org.ijsberg.iglu.content.TextProvider;
import org.ijsberg.iglu.logging.Level;
import org.ijsberg.iglu.logging.LogEntry;
import org.ijsberg.iglu.server.facilities.WebsiteUtilityService;
import org.ijsberg.iglu.util.collection.CollectionSupport;
import org.ijsberg.iglu.util.mail.EMail;

import java.util.Properties;

/**
 */
public class WebsiteUtilityServiceImpl  implements WebsiteUtilityService {

	private TextProvider textProvider;
	RequestRegistry requestRegistry;

	public void setTextProvider(TextProvider textProvider) {
		this.textProvider = textProvider;
	}

	public void setRequestRegistry(RequestRegistry requestRegistry) {
		this.requestRegistry = requestRegistry;
	}

	@Override
	public String mailFormData(Properties formData, String subject, String senderMailAddress, String senderName, String recipientAddress) {

		String message = CollectionSupport.format(formData, "\n");
		try {
			new EMail(senderName, senderMailAddress, recipientAddress, subject, message).mail();
		} catch (Exception e) {
			System.out.println(new LogEntry(Level.CRITICAL, "mail sending failed", e));
			System.out.println(new LogEntry(Level.CRITICAL, "message not sent:\n" + message));
			return "false";
		}
		return "true";
	}

	@Override
	public String getText(String key) {
		return textProvider.getText(getLanguageCode(), key);
	}

	@Override
	public String getText(String key, String defaultText) {
		String retval = textProvider.getText(getLanguageCode(), key);
		return retval != null ? retval : key;
	}

	@Override
	public String returnMessage(String message) {
		return message;
	}


	private static String DEFAULT_LANGUAGE = "NL";

	@Override
	public String getLanguageCode() {
		if(requestRegistry == null) {
			return DEFAULT_LANGUAGE;
		}
		Request request = requestRegistry.getCurrentRequest();
		//TODO make DEFAULT_LANGUAGE a property
		String languageCode = request.getUserSettings().getProperty("language", DEFAULT_LANGUAGE);
		return languageCode;
	}

	@Override
	public String addExceptionToRequest(String attrName, Exception e) {

		System.out.println(requestRegistry);
		System.out.println(requestRegistry.getCurrentRequest());
		System.out.println(e);

		requestRegistry.getCurrentRequest().setAttribute(attrName, getText(e.getMessage(), e.getMessage()));
		return "";
	}


	@Override
	public boolean logout() {
		Request request = requestRegistry.getCurrentRequest();

		if(request.getUser() != null) {
			request.logout();
			return true;
		}
		return false;
	}


}
