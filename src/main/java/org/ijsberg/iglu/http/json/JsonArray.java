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