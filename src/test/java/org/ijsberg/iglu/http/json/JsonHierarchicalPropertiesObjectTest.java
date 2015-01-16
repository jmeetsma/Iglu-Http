package org.ijsberg.iglu.http.json;

import junit.framework.Assert;
import org.junit.Test;

import java.util.*;

/**
 */
public class JsonHierarchicalPropertiesObjectTest {

	private static Properties testProperties = new Properties();
	static {
		testProperties.setProperty("main", "bogus");
		testProperties.setProperty("sub.foo", "bla");
		testProperties.setProperty("sub.bar", "hop");
		testProperties.setProperty("sub.sub1.foo", "bla1");
		testProperties.setProperty("sub.sub1.bar", "hop1");
	}

	private static String result = "{\n" +
			"  \"main\" : \"bogus\", \"sub\" : {\n" +
			"  \"foo\" : \"bla\", \"bar\" : \"hop\", \"sub1\" : {\n" +
			"  \"foo\" : \"bla1\", \"bar\" : \"hop1\" }\n" +
			" }\n" +
			" }\n";

	@Test
	public void testConstructor() throws Exception {
		JsonHierarchicalPropertiesObject object = new JsonHierarchicalPropertiesObject(testProperties);

		Assert.assertEquals(result, object.toString());
	}

}
