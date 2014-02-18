package org.ijsberg.iglu.server.admin;

/**
 */
public interface AdminAgent {

    boolean login(String userName, String password);

    boolean isLoggedIn();

	String getMenu();

	String getLogEntries();
}