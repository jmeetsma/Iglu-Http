package org.ijsberg.iglu.server.admin.module;

import org.ijsberg.iglu.access.*;
import org.ijsberg.iglu.access.component.RequestRegistry;
import org.ijsberg.iglu.server.admin.AdminAgent;


/**
 */
public class AdminAgentImpl implements AdminAgent {

    public static final String ADMIN_AGENT_NAME = "AdminAgent";
    private RequestRegistry requestRegistry;
    private Session session;

    public static AgentFactory<AdminAgent> getAgentFactory() {
        return new BasicAgentFactory<AdminAgent>(ADMIN_AGENT_NAME) {
            public AdminAgent createAgentImpl() {
                return new AdminAgentImpl();
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


    @Override
    public boolean login(String userName, String password) {
        try {
            session.login(new SimpleCredentials(userName, password));
        } catch (AuthenticationException e) {
            //TODO return reason
            return false;
        }
        return session.getUser() != null;
    }

    @Override
    public boolean isLoggedIn() {
        return session.getUser() != null;
    }
}
