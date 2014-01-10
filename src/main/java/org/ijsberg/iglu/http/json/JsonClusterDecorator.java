package org.ijsberg.iglu.http.json;

import org.ijsberg.iglu.configuration.Cluster;
import org.ijsberg.iglu.configuration.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 */
public class JsonClusterDecorator implements JsonDecorator {

    private Cluster cluster;
    private String clusterId;

    public JsonClusterDecorator(String clusterId, Cluster cluster) {
        this.cluster = cluster;
        this.clusterId = clusterId;
    }

    public String toString() {

		JsonObject jsonObject = new JsonObject(clusterId);

		List<JsonComponentDecorator> componentList = new ArrayList<JsonComponentDecorator>();
		Map<String, Component> components = cluster.getInternalComponents();
		for(String componentId : components.keySet()) {
			Component component = components.get(componentId);
			jsonObject.addAttribute(componentId, new JsonComponentDecorator(clusterId, componentId, component));
			componentList.add(new JsonComponentDecorator(clusterId, componentId, component));
		}
		jsonObject.addAttribute("components", componentList);
		return jsonObject.toString();
    }
}
