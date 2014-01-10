package org.ijsberg.iglu.http.json;

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
		return "{"  +
					JsonSupport.toAttr("name", method.getName()) + "," +
					JsonSupport.toAttr("clusterId", clusterId) + "," +
					JsonSupport.toAttr("componentId", componentId) + "," +
					JsonSupport.toAttr("signature", method.toString()) + "," +
				    JsonSupport.toAttr("nr_parameters", "" + method.getParameterTypes().length) +
				"}";
	}



}
