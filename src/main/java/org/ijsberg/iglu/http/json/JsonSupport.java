package org.ijsberg.iglu.http.json;

import org.ijsberg.iglu.util.collection.CollectionSupport;

import java.util.Collection;

/**
 */
public class JsonSupport {

    public static String toMessage(String function, String jsonPayload) {
        return "{ \"function\" : \"" + function + "\" ,\n\"data\" : \n" + jsonPayload + "\n}";
    }

	public static String toMessage(String function, String dataId, JsonDecorator jsonPayload) {
		return "{ \"function\" : \"" + function + "\" ,\n" +
				"\"dataId\" : \n\"" + dataId + "\",\n" +
				"\"data\" : \n" + jsonPayload + "\n}";
	}

	public static String toList(String identifier, Collection<?> coll) {
        return "\"" + identifier + "\" : [\n" + CollectionSupport.format("\t", coll, " ,\n") + "\n]";
    }

    public static String toAttr(String name, String value) {
        return "\"" + name + "\" : \"" + value + "\"";
    }
}
