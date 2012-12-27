package org.ijsberg.iglu.server.http.servlet;

import org.ijsberg.iglu.configuration.Cluster;
import org.ijsberg.iglu.configuration.Component;
import org.ijsberg.iglu.configuration.Facade;
import org.ijsberg.iglu.configuration.module.ExtendedComponent;
import org.ijsberg.iglu.util.collection.CollectionSupport;
import org.ijsberg.iglu.util.misc.StringSupport;
import org.ijsberg.iglu.util.reflection.ReflectionSupport;
import org.ijsberg.iglu.util.reflection.types.ObjectToPropertiesConverter;
import org.ijsberg.iglu.util.reflection.types.ObjectToStringConverter;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintStream;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.*;

/**
 */
public class RestServlet extends HttpServlet {

    private Cluster services;
    private ObjectToStringConverter converter = new ObjectToPropertiesConverter();
    //TODO private EntityToStringConverter

    Map<String, ExtendedComponent> invokableComponents = new HashMap<String, ExtendedComponent>();

    public static class RestServletMessage {
        private String message;

        private RestServletMessage(String message) {
            this.message = message;
        }
    }

    public void init(ServletConfig conf) throws ServletException {
        super.init(conf);

        if(services == null) {
            throw new ServletException("service facade is not set");
        }

        //TODO set custom converter

        //TODO overview of components, methods and parameters

        Map<String, Component> components = services.getInternalComponents();
        for(String componentId : components.keySet()) {
           //TODO one off init
            Component component = components.get(componentId);
            if(component instanceof ExtendedComponent) {
                invokableComponents.put(componentId, (ExtendedComponent)component);
                converter.initialize(component.getInterfaces());
            }
        }
        /*
        FIXME
        try {
            RestServletMessage.class.getDeclaredField("message").setAccessible(true);
            System.out.println(RestServletMessage.class.getDeclaredField("message").isAccessible());//false?
        } catch (NoSuchFieldException e) {
            throw new ServletException(e);
        }
        */
    }

    private static Map<String, Object> convertParameterMap(Map<String, String[]> reqParams) {

        Map<String, Object> retval = new HashMap<String, Object>();
        for(String key : reqParams.keySet()) {
            String[] values = reqParams.get(key);
            if(values.length == 0) {
                retval.put(key, null);
            } else if(values.length == 1) {
                retval.put(key, values[0]);
            } else {
                retval.put(key, values);
            }

        }
        return retval;
    }


    public void service(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {

        response.setContentType("text/plain");
        PrintStream out = new PrintStream(response.getOutputStream());

        Object retval = new RestServletMessage("no method invoked");

        List<String> methodPath = StringSupport.split(request.getPathInfo(), "/");
        if(methodPath.size() == 2) {
            ExtendedComponent component = invokableComponents.get(methodPath.get(0));
            if(component != null) {
                try {
                    retval = component.invoke(methodPath.get(1), convertParameterMap(request.getParameterMap()));
                    if(retval == null) {
                        retval = new RestServletMessage("method '" + request.getPathInfo() + "' invoked");
                    }
                } catch (InvocationTargetException e) {
                    retval = new RestServletMessage("method '" + request.getPathInfo() + "' threw exception " + e.toString());
                } catch (NoSuchMethodException e) {
                    retval = new RestServletMessage("method '" + request.getPathInfo() + "' does not exist");
                } catch (IllegalArgumentException e) {
                    e.printStackTrace();
                    retval = new RestServletMessage("method '" + request.getPathInfo() + "' invoked with missing or illegal arguments");
                }
            } else {
                retval = new RestServletMessage("component '" + methodPath.get(0) + "' not found");
            }
        }

        out.println(converter.convert(retval));//!!
    }


    public void setServices(Cluster services) {
        this.services = services;
    }



}
