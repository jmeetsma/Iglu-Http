package org.ijsberg.iglu.http.json;

import org.ijsberg.iglu.server.admin.InvocationSupport;
import org.ijsberg.iglu.configuration.Component;

import java.lang.reflect.Method;
import java.util.*;

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
