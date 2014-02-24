package org.ijsberg.iglu.server.facilities.module;

import org.ijsberg.iglu.access.*;
import org.ijsberg.iglu.access.component.RequestRegistry;
import org.ijsberg.iglu.server.facilities.UserAgent;

/**
 */
public class UserAgentImpl implements UserAgent {
	public static final String USER_AGENT_NAME = "UserAgent";
	private RequestRegistry requestRegistry;
	private Session session;

	public static AgentFactory<UserAgent> getAgentFactory() {
		return new BasicAgentFactory<UserAgent>(USER_AGENT_NAME) {
			public UserAgent createAgentImpl() {
				return new UserAgentImpl();
			}
		};
	}


	/**
	 * Invoked by injection.
	 * @param requestRegistry
	 */
	public void setRequestRegistry(RequestRegistry requestRegistry) {

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
