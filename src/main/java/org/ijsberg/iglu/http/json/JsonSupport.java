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
