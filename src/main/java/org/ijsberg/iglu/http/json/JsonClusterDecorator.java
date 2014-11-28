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
