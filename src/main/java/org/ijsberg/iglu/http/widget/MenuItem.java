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

package org.ijsberg.iglu.http.widget;

import org.ijsberg.iglu.http.json.JsonObject;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 */
public class MenuItem extends JsonObject {

	private List<JsonObject> links = new ArrayList<JsonObject>();

	public MenuItem(String id, String label) {
		addStringAttribute("id", id);
		addStringAttribute("label", label);
		addAttribute("link", links);
	}

	public MenuItem addLinkToTargetElement(String url, String target, String targetTitle) {
		JsonObject link = new JsonObject();
		link.addStringAttribute("url", url);
		link.addStringAttribute("target", target);
		link.addStringAttribute("target_label", targetTitle);
		links.add(link);
		return this;
	}

	public MenuItem addLinkViaFunction(String functionName, String url, String targetTitle) {
		JsonObject link = new JsonObject();
		link.addStringAttribute("functionName", functionName);
		link.addStringAttribute("url", url);
		link.addStringAttribute("target_label", targetTitle);
		links.add(link);
		return this;
	}

	public MenuItem addOnclick(String onclick) {
		addStringAttribute("onclick", onclick);
		return this;
	}

	public MenuItem addCssClassName(String itemClassName) {
		addStringAttribute("item_class_name", itemClassName);
		return this;
	}

	public MenuItem addCssClassNames(String itemClassName, String submenuClassName) {
		addStringAttribute("item_class_name", itemClassName);
		addStringAttribute("submenu_class_name", submenuClassName);
		return this;
	}

	public MenuItem addSubmenu(Collection<MenuItem> submenu) {
		addAttribute("submenu", submenu);
		return this;
	}

	public MenuItem setPropertyToggle(String name, String onValue, String offValue) {
		addStringAttribute("toggleProperty_key", name);
		addStringAttribute("toggleProperty_on", onValue);
		addStringAttribute("toggleProperty_off", offValue);
		return this;
	}
}
