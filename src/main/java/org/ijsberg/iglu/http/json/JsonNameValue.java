package org.ijsberg.iglu.http.json;

/**
 */
public class JsonNameValue implements JsonDecorator {

	private String name;
	private String value;

	public JsonNameValue(String name, String value) {
		this.name = name;
		this.value = value;
	}

	public String toString() {
		return "{ \"" + name + "\" : \"" + value + "\" }";
	}
}
