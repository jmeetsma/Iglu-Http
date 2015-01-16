package org.ijsberg.iglu.http.json;

import org.ijsberg.iglu.util.properties.PropertiesSupport;

import java.util.*;

/**
 */
public class JsonHierarchicalPropertiesObject extends JsonObject {

	public JsonHierarchicalPropertiesObject(Properties properties) {
		addAttributes(properties);
	}


	public void addAttributes(Properties properties) {
		Set<String> rootKeys = PropertiesSupport.getRootKeys(properties);
		for(String rootKey : rootKeys) {
			addStringAttribute(rootKey, properties.getProperty(rootKey));
		}
		Set<String> subsectionKeys = PropertiesSupport.getSubsectionKeys(properties);
		for(String subsectionKey : subsectionKeys) {
			addAttribute(subsectionKey,
					new JsonHierarchicalPropertiesObject(
							PropertiesSupport.getSubsection(properties, subsectionKey)));
		}
	}
}
