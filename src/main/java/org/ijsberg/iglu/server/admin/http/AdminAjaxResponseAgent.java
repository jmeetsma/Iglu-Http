package org.ijsberg.iglu.server.admin.http;

import org.ijsberg.iglu.access.AgentFactory;
import org.ijsberg.iglu.access.BasicAgentFactory;
import org.ijsberg.iglu.access.Session;
import org.ijsberg.iglu.access.component.RequestRegistry;
import org.ijsberg.iglu.configuration.Cluster;
import org.ijsberg.iglu.configuration.Component;
import org.ijsberg.iglu.http.json.*;
import org.ijsberg.iglu.server.admin.AdminResponseAgent;
import org.ijsberg.iglu.server.admin.InvocationSupport;
import org.ijsberg.iglu.util.misc.StringSupport;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.Collection;
import java.util.Properties;


/**
 */
public class AdminAjaxResponseAgent implements AdminResponseAgent {

    public static final String ADMIN_RESPONSE_AGENT_NAME = "AdminResponseAgent";
	private static final String CORE_CLUSTER_ID = "ServiceCluster";

	private Session session;
    private Cluster core;

    public static AgentFactory<AdminResponseAgent> getAgentFactory() {
        return new BasicAgentFactory<AdminResponseAgent>(ADMIN_RESPONSE_AGENT_NAME) {
            public AdminResponseAgent createAgentImpl() {
                return new AdminAjaxResponseAgent();
            }
        };
    }


    /**
     * Invoked by injection.
     * @param requestRegistry
     */
    public void setAdminAccessManager(RequestRegistry requestRegistry) {
        session = requestRegistry.getCurrentRequest().getSession(true);
    }

    public void setServiceCluster(Cluster core) {
        this.core = core;

    }

	public void setAdminCluster(Cluster core) {
		this.core = core;

	}

    @Override
    public String getClusterList(String function) {
		return JsonSupport.toMessage(function, CORE_CLUSTER_ID, new JsonClusterDecorator(CORE_CLUSTER_ID, core));
	}

	@Override
	public String getCluster(String function, String clusterId, String componentId) {

		Cluster cluster = getCluster(clusterId);
		Component component = cluster.getInternalComponents().get(componentId);
		return JsonSupport.toMessage(function, componentId, new JsonClusterDecorator(componentId, component.getProxy(Cluster.class)));
	}

	@Override
	public boolean isCluster(String clusterId, String componentId) {

		Cluster cluster = getCluster(clusterId);
		Component component = cluster.getInternalComponents().get(componentId);
//		System.out.println(Arrays.asList(component.getInterfaces()));
//		System.out.println(Arrays.asList(component.getInterfaces()).contains(Cluster.class));
		return Arrays.asList(component.getInterfaces()).contains(Cluster.class);
	}

	@Override
	public String getComponent(String function, String clusterId, String componentId) {

		Cluster cluster = getCluster(clusterId);
		Component component = cluster.getInternalComponents().get(componentId);

		return JsonSupport.toMessage(function, componentId, new JsonComponentDecorator(clusterId, componentId, component));
	}

	private Cluster getCluster(String clusterId) {
		Cluster cluster = core;
		if(!CORE_CLUSTER_ID.equals(clusterId)) {
			cluster = core.getInternalComponents().get(clusterId).getProxy(Cluster.class);
		}
		return cluster;
	}

	@Override
	public String getMethod(String function, String clusterId, String componentId, String signature) {
		Cluster cluster = getCluster(clusterId);
		Component component = cluster.getInternalComponents().get(componentId);


		Collection<Method> methods = InvocationSupport.gatherInvokableMethods(component);
		for(Method method : methods) {
			if(method.toString().equals(signature)) {
				return JsonSupport.toMessage(function, method.getName(), new JsonMethodDecorator(clusterId, componentId, method));
			}
		}
		return "false";
	}

	@Override
    public String invokeJavaScript(String function, String message) {
        return JsonSupport.toMessage(function, "{" + JsonSupport.toAttr("message", message) + "}");
    }

	@Override
	public String invokeMethod(String function, Properties properties) {

		Cluster cluster = getCluster(properties.getProperty("clusterId"));
		Component component = cluster.getInternalComponents().get(properties.getProperty("componentId"));
		String signature = properties.getProperty("signature");

		int nrParameters = Integer.parseInt(properties.getProperty("nrParameters"));

		Object[] parameters = new Object[nrParameters];
		for(int i = 0; i < nrParameters; i++) {
			parameters[i] = properties.getProperty("param_" + i);
		}
		Collection<Method> methods = InvocationSupport.gatherInvokableMethods(component);
		for(Method method : methods) {
			if(method.toString().equals(signature)) {
				try {
					Object retval = component.invoke(method.getName(), parameters);

					return JsonSupport.toMessage(function, method.getName(), new JsonNameValue("returnValue", retval == null ? "null" : retval.toString()));
				} catch (Throwable t) {
					return JsonSupport.toMessage(function,  method.getName(), new JsonNameValue("returnValue", StringSupport.getRootCauseAndStackTrace(t, 5)));
				}
			}
		}

		return JsonSupport.toMessage(function, "\"method not found\"");
	}
}
