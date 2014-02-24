package org.ijsberg.iglu.server.facilities;

/**
 */
public interface UserAgent {

	boolean login(String userName, String password);

	boolean isLoggedIn();

}
