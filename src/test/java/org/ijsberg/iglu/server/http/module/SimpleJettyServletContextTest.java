package org.ijsberg.iglu.server.http.module;

import org.junit.Test;

import static junit.framework.Assert.assertEquals;

/**
 * Module is not quite unit testable...
 */
public class SimpleJettyServletContextTest {

    @Test
    public void testGetReport() {
        SimpleJettyServletContext server = new SimpleJettyServletContext();
        assertEquals("server not available", server.getReport());
    }
}
