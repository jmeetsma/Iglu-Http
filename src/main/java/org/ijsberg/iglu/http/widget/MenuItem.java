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

	public MenuItem addLink(String url, String target, String targetTitle) {
		JsonObject link = new JsonObject();
		link.addStringAttribute("url", url);
		link.addStringAttribute("target", target);
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
