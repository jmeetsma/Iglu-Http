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
