package org.ijsberg.iglu.http.json;

import org.ijsberg.iglu.util.collection.CollectionSupport;

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

	public JsonObject addStringAttribute(String name, String value) {
		attributes.put(name, "\"" + value + "\"");
		return this;
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

