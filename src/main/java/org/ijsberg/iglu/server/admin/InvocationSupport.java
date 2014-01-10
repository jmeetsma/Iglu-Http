package org.ijsberg.iglu.server.admin;

import org.ijsberg.iglu.configuration.Component;

import java.lang.reflect.Method;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

public class InvocationSupport {
	public static Collection<Method> gatherInvokableMethods(Component component) {

		Set<Method> gatheredMethods = new HashSet<Method>();
		Class<?>[] interfaces = component.getInterfaces();
		for(Class<?> interfaceClass : interfaces) {
			Method[] methods = interfaceClass.getMethods();
			for(Method method : methods) {
				gatheredMethods.add(method);
			}
		}
		return gatheredMethods;
	}
}
