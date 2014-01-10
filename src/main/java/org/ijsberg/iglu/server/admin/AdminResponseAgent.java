package org.ijsberg.iglu.server.admin;

import java.util.Properties;

/**
 */
public interface AdminResponseAgent {

   String getClusterList(String function);

    String invokeJavaScript(String function, String message);

	String getComponent(String function, String clusterId, String componentId);

	String getMethod(String function, String clusterId, String componentId, String signature);

	public String invokeMethod(String function, Properties properties);

	String getCluster(String function, String clusterId, String componentId);

	boolean isCluster(String clusterId, String componentId);
}
