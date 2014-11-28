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
