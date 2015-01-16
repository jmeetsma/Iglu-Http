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

package org.ijsberg.iglu.http.json;

import org.ijsberg.iglu.util.collection.CollectionSupport;
import org.ijsberg.iglu.util.http.HttpEncodingSupport;
import org.ijsberg.iglu.util.misc.StringSupport;

import java.util.Collection;
import java.util.LinkedHashMap;

/**
 */
public class JsonObject implements JsonDecorator {

	private LinkedHashMap<String, Object> attributes = new LinkedHashMap<String, Object>();
	private String name;

	public JsonObject(String name) {
		this.name = name;
	}

	public JsonObject() {
	}

	public boolean isEmpty() {
		return attributes.isEmpty();
	}

	public JsonObject addStringAttribute(String name, String value) {
		attributes.put(name, "\"" + formatHtmlEncodedWithLineContinuation(value) + "\"");
		return this;
	}

	public static String formatHtmlEncodedWithLineContinuation(String text) {
		text = StringSupport.replaceAll(text, "\n", "\\\n");//line continuation
		text = HttpEncodingSupport.htmlEncode(text);
		return text;
	}


	public JsonObject addAttribute(String name, Object value) {
		attributes.put(name, value);
		return this;
	}

	public JsonObject addAttribute(String name, JsonDecorator value) {
		attributes.put(name, value);
		return this;
	}

	public JsonObject addAttribute(String name, Collection<? extends JsonDecorator> value) {
		attributes.put(name, value);
		return this;
	}

	public String toString() {
		StringBuffer retval = new StringBuffer();
		if(name != null) {
			retval.append("{ \"" + name + "\": ");
		}
		retval.append("{\n ");
		for(String attrName : attributes.keySet()) {
			Object value = attributes.get(attrName);
			retval.append(" \"" + attrName + "\" : ");
			if(value instanceof Collection) {
				retval.append("[ " + CollectionSupport.format((Collection)value, " , ") + " ]");
			} else {
				retval.append(value);
			}
			retval.append(",");
		}
		retval.deleteCharAt(retval.length() - 1);

		if(name != null) {
			retval.append(" }");
		}
		retval.append(" }\n");

		return retval.toString();
	}


	public Object getAttribute(String id) {
		Object retval = attributes.get(id);
		if(retval != null && retval.toString().startsWith("\"")) {
			retval = ((String) retval).substring(1, ((String) retval).length() - 1);
		}
		return retval;
	}

}

