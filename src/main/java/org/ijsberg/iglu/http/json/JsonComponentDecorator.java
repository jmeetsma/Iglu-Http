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

import org.ijsberg.iglu.configuration.Component;
import org.ijsberg.iglu.server.admin.InvocationSupport;

import java.lang.reflect.Method;
import java.util.HashSet;
import java.util.Set;

/**
 */
public class JsonComponentDecorator implements JsonDecorator {

	private Component component;
	private String clusterId;
	private String componentId;
	private Set<JsonMethodDecorator> componentMethods = new HashSet<JsonMethodDecorator>();

	public JsonComponentDecorator(String clusterId, String componentId, Component component) {
		this.component = component;
		this.componentId = componentId;
		this.clusterId = clusterId;

		gatherInvokableMethods();
	}

	private void gatherInvokableMethods() {
		for(Method method : InvocationSupport.gatherInvokableMethods(component)) {
			componentMethods.add(new JsonMethodDecorator(clusterId, componentId, method));
		}
	}


	public String toString() {
		return "{"  + JsonSupport.toAttr("id", componentId) + " , " + JsonSupport.toAttr("clusterId", clusterId) + " , " + JsonSupport.toList("methods", componentMethods) + "}";
	}



}
