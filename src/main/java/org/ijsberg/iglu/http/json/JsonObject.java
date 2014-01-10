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

	public void addAttribute(String name, String value) {
		attributes.put(name, "\"" + value + "\"");
	}

	public void addAttribute(String name, JsonDecorator value) {
		attributes.put(name, value);
	}

	public void addAttribute(String name, Collection<? extends JsonDecorator> value) {
		attributes.put(name, value);
	}

	public String toString() {
		StringBuffer retval = new StringBuffer();
		retval.append("{ \"" + name + "\" : {\n ");
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


		retval.append(" } }\n");
		return retval.toString();
	}


/*
	return "{ \"" + identifier + "\" : [\n" + CollectionSupport.format("\t", list, " ,\n") + "\n] }";
}

	public static String toAttr(String name, String value) {
		return "\"" + name + "\" : \"" + value + "\"";

*/
}
