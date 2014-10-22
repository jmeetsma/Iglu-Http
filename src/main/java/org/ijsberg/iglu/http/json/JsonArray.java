package org.ijsberg.iglu.http.json;

import org.ijsberg.iglu.util.collection.CollectionSupport;

import java.util.ArrayList;
import java.util.List;

/**
 */
public class JsonArray implements JsonDecorator {


	private List contents = new ArrayList();



	public JsonArray addStringValue(Object ... objects) {

		for(Object object : objects) {
			contents.add("\"" + object + "\"");
		}
		return this;
	}


	public JsonArray addValue(Object ... objects) {
		for(Object object : objects) {
			contents.add(object);
		}
		return this;
	}



	public String toString() {
		return "[\n" + CollectionSupport.format(contents, " , ") + "\n]";
	}
}