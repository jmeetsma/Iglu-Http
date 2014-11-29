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

import org.ijsberg.iglu.invocation.Parameters;
import org.ijsberg.iglu.util.collection.ArraySupport;

import java.lang.reflect.Method;

/**
 */
public class JsonMethodDecorator implements JsonDecorator {

	private Method method;
	private String clusterId;
	private String componentId;

	public JsonMethodDecorator(String clusterId, String componentId, Method method) {
		this.method = method;
		this.clusterId = clusterId;
		this.componentId = componentId;
	}




	public String toString() {

		Parameters parametersDescription = method.getAnnotation(Parameters.class);

		return "{"  +
					JsonSupport.toAttr("name", method.getName()) + "," +
					JsonSupport.toAttr("clusterId", clusterId) + "," +
					JsonSupport.toAttr("componentId", componentId) + "," +
					JsonSupport.toAttr("signature", method.toString()) + "," +
				    JsonSupport.toAttr("nr_parameters", "" + method.getParameterTypes().length) + "," +
					JsonSupport.toAttr("description", (parametersDescription != null ? ArraySupport.format(parametersDescription.decriptions(), ", ") : "")) +
				"}";
	}



}
