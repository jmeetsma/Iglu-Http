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
