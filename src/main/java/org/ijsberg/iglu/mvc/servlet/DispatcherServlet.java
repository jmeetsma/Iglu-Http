/* =======================================================================
 * Copyright (c) 2003-2010 IJsberg Automatisering BV. All rights reserved.
 * Redistribution and use of this code are permitted provided that the
 * conditions of the Iglu License are met.
 * The license can be found in org.ijsberg.iglu.StandardApplication.java
 * and is also published on http://iglu.ijsberg.org/LICENSE.
 * =======================================================================
 */
package org.ijsberg.iglu.mvc.servlet;

import org.ijsberg.iglu.access.Request;
import org.ijsberg.iglu.access.component.RequestRegistry;
import org.ijsberg.iglu.configuration.Assembly;
import org.ijsberg.iglu.configuration.Component;
import org.ijsberg.iglu.configuration.ConfigurationException;
import org.ijsberg.iglu.exception.ResourceException;
import org.ijsberg.iglu.logging.Level;
import org.ijsberg.iglu.logging.LogEntry;
import org.ijsberg.iglu.mvc.RequestDispatcher;
import org.ijsberg.iglu.mvc.RequestMapper;
import org.ijsberg.iglu.server.invocation.CommandLine;
import org.ijsberg.iglu.util.collection.ArraySupport;
import org.ijsberg.iglu.util.collection.CollectionSupport;
import org.ijsberg.iglu.util.http.ServletSupport;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.io.PrintStream;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Properties;

/**
 * Servlet that handles http-requests aimed at the MVC mechanism.
 */
public class DispatcherServlet extends HttpServlet implements RequestDispatcher {
	protected ArrayList messages = new ArrayList();
	protected RequestMapper mapper;
	protected boolean loadSucceeded;
	protected boolean sanityCheckPassed;
	protected boolean strict = true;

	//possible dispatch modes
	public static final int INCLUDE = 0;
	public static final int FORWARD = 1;
	//todo allow override in flow config
	public static final String[] DISPATCH_MODE_STR = {"INCLUDE", "FORWARD"};
	//current dispatch mode
	private int dispatchMode = INCLUDE;

	protected ThreadLocal<HttpServletRequest> httpRequest = new ThreadLocal();
	protected ThreadLocal<HttpServletResponse> httpResponse = new ThreadLocal();
	protected ThreadLocal<Properties> requestProperties = new ThreadLocal();

	protected String docRoot;

	//public static final String TASK_PROCESSING = "task processing";
	//public static final String PAGE_DISPATCHING = "page dispatching";

	protected Assembly assembly;
	protected RequestRegistry requestRegistry;


    //meant for injection
	public void setRequestMapper(RequestMapper mapper) {
		this.mapper = mapper;
	}


    //meant for injection
	//TODO should a request dispatcher have access to the whole assembly?
	//ideally it should be service cluster only
	public void register(Assembly assembly) {
		this.assembly = assembly;
	}

/*
	public void setServiceCluster(Cluster cluster) {
	public void register(Cluster cluster) {
	//TODO
		this.assembly = assembly;
	}
  */
	//meant for injection
	public void register(RequestRegistry requestRegistry) {
		this.requestRegistry = requestRegistry;
	}

	//TODO document features
	/**
	 * @param conf
	 * @throws ServletException
	 */
	public void init(ServletConfig conf) throws ServletException
	{
		super.init(conf);
		if(mapper == null)
		{
				throw new ServletException("Cannot find request mapper. Add request mapper to your assembly and set it on DispatcherServlet");
		}
		dispatchMode = Arrays.asList(DISPATCH_MODE_STR).indexOf(conf.getInitParameter("dispatch_mode"));
		if(dispatchMode == -1) dispatchMode = INCLUDE;
	//	delegateRequestResponse = Boolean.valueOf(conf.getInitParameter("forward_http_params"));
		strict = Boolean.valueOf(getInitParameter("strict"));
		System.out.println(new LogEntry("DispatcherServlet checks " + (strict ? "strictly" : "lenient") + " on availability of resources"));
		docRoot = conf.getServletContext().getRealPath("/");



		//TODO mapper may not have been started yet
		loadSucceeded = mapper.isLoaded();
        //TODO response type
		sanityCheckPassed = sanityCheckPassed = mapper.checkSanity(this);
		messages.addAll(mapper.getMessages());
		System.out.println(new LogEntry("mapping loaded with following messages", CollectionSupport.format(messages, "\n")));
	}

	/**
	 * Not implemented.
	 */
	public void destroy() {

	}

	/**
	 * @param req
	 * @param res
	 * @throws ServletException
	 * @throws IOException
	 */
	public void service(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
	{
		//TODO make configurable
		ServletSupport.setNoCache(req, res);

		httpRequest.set(req);
		httpResponse.set(res);

		if (mapper != null)
		{
			if(mapper.reloadIfUpdated())
			{
				messages.clear();
				sanityCheckPassed = mapper.checkSanity(this);
				messages.addAll(mapper.getMessages());
				System.out.println(new LogEntry(Level.CRITICAL, "mapping reloaded with following messages", CollectionSupport.format(messages, "\re\n")));
			}
		}

		if ((strict && (!mapper.isLoaded() || !sanityCheckPassed)))
		{
			throw new ResourceException("dispatcher servlet is not connected to request mapper or mapper did not pass sanity check\n" +
					CollectionSupport.format(messages, "\n"));
		}
//		else
//		{
//			try
			{
				Properties properties = new Properties();
				requestProperties.set(properties);

				if (req.getContentType() != null && req.getContentType().startsWith("application/iglu-ajax-urlencoded"))
				{
					//context is the container for all submitted data
					properties.putAll(ServletSupport.readURLEncodedPostData(req));
				}
				else
				{
					properties.putAll(req.getParameterMap());
					properties.putAll(convertRequestParametersToProperties(req));
				}


				boolean hasResponded = mapper.processRequest(req.getPathInfo(), properties, this);
				if (!hasResponded)
				{
					throw new ServletException("request '" + req.getPathInfo() + "' does not result in a response");
				}
		}
	}


	private Properties convertRequestParametersToProperties(HttpServletRequest request) {
		Properties properties = new Properties();
		for(Object key : request.getParameterMap().keySet()) {
			String[] value = (String[])request.getParameterMap().get(key);
			if(value.length > 1) {
				properties.put(key, value);
			} else {
				properties.put(key, request.getParameter((String)key));
			}
		}
		return properties;
	}

	/**
	 * Checks if a redirect is going to work.
	 *
	 * @param redirect
	 * @param parameters
	 * @return
	 */
	public String testRedirect(String redirect, String[] parameters)
	{
		if (docRoot != null && !(redirect.startsWith("http://") || redirect.startsWith("https://")))
		{
			//redirects to other contexts are not checked
			if (redirect.endsWith(".jsp") || redirect.endsWith(".html"))
			{
				File resource = new File(docRoot + redirect);

				if (!resource.exists())
				{
					return "Cannot find resource '" + docRoot + redirect + '\'';
				}
			}
		}
		return null;
	}


	/**
	 * @param redirect
	 * @param parameters
	 * @return
	 * @throws ServletException
	 */
	public boolean redirect(String redirect, String[] parameters)// throws IOException
	{
		String redirectURL = redirect;
		HttpServletRequest request = httpRequest.get();
		HttpServletResponse response = httpResponse.get();
		Properties properties = requestProperties.get();

		boolean copyParameters = false;

		if(parameters.length == 1)
		{
			copyParameters = "COPY_PARAMETERS".equals(parameters[0]);
		}
		ServletSupport.redirect(redirectURL, copyParameters, request, response);
		return true;
	}

	/**
	 * @param dispatch
	 * @param parameters
	 * @return
	 */
	public String testDispatch(String dispatch, String[] parameters)
	{
		if (docRoot != null)
		{
			if (dispatch.endsWith(".jsp"))
			{
				File resource = new File(docRoot + dispatch);

				if (!resource.exists())
				{
					return "cannot find resource '" + docRoot + dispatch + '\'';
				}
			}
		}
		return null;
	}

	public Object handleInvocation(CommandLine commandLine, Properties requestProperties)  throws Throwable {

		System.out.println(new LogEntry("about to invoke " + commandLine));

		Object[] parameters = convertToParameters(commandLine, requestProperties);

		System.out.println(ArraySupport.format(parameters, "\n"));

        String[] idSeq = commandLine.getUnitIdentifierSequence();
        if(idSeq.length < 2) {
            throw new ConfigurationException("can't invoke method " + commandLine + " " + requestProperties + ": id sequence must contain at least 2 ids");
        }
 		try {
    		if(assembly.getClusters().containsKey(idSeq[0])) {
                if(idSeq.length < 3) {
                    throw new ConfigurationException("can't invoke method " + commandLine + " " + requestProperties + ": id sequence must contain at least 3 ids");
                }
	    		Component component = assembly.getClusters().get(idSeq[0]).getInternalComponents().
					get(commandLine.getUnitIdentifierSequence()[1]);
                if(component == null) {
                    throw new ConfigurationException("can't locate component '" + idSeq[1] + "' in " + commandLine);
                }
                return component.invoke(idSeq[2], parameters);
		    } else //TODO if assembly == null -> cluster

			{
			    Component agent = requestRegistry.getCurrentRequest().getSession(true).getAgent(idSeq[0]);
                if(agent == null) {
                    throw new ConfigurationException("can't locate agent '" + idSeq[0] + "' in " + commandLine);
                }
			    return agent.invoke(commandLine.getUnitIdentifierSequence()[1], parameters);
		    }
		}
		catch (InvocationTargetException ite) {
			if (ite.getCause() instanceof RuntimeException) {
				throw (RuntimeException) ite.getCause();
			}
			throw new RuntimeException("can't invoke method " + commandLine + " " + requestProperties,
					ite.getCause());
		}
		

	/*
		DBG 20121129 16:06:25.318 exception occurred in mvc invocation
java.lang.reflect.InvocationTargetException
	*/
//		throw new ConfigurationException("no unit found for invocation of " + commandLine + " " + requestProperties);
	}

    @Override
    public boolean respond(CommandLine commandLine, Properties requestProperties) throws Throwable {

        Object responseValue = handleInvocation(commandLine, requestProperties);

        HttpServletRequest servletRequest = httpRequest.get();
        HttpServletResponse servletResponse = httpResponse.get();
        //set content type, because otherwise the response
        //  may be interpreted as text/plain

        servletResponse.setContentType("text/html; charset=UTF-8");

        PrintStream out = new PrintStream(servletResponse.getOutputStream());
        out.print(responseValue.toString());

        return true;
    }


    private Object[] convertToParameters(CommandLine command, Properties requestProperties)
	{
		return determineCustomArguments(command, requestProperties);
	}


	private Object[] determineCustomArguments(CommandLine command, Properties requestProperties)
	{
		Object[] input = new Object[command.getArguments().length];

//		System.out.println(ArraySupport.format(command.getArguments(), "-:-"));

		for (int i = 0; i < command.getArguments().length; i++)
		{
			String argument = command.getArguments()[i].toString();
			//TODO document
			if (argument.startsWith("[\"") &&
					argument.endsWith("\"]")) {
				//arguments between brackets are used 'as is'
				input[i] = argument.substring(2, argument.length() - 2);
			} else if (argument.startsWith("[") &&
					argument.endsWith("]")) {
				//arguments between brackets are used 'as is'
				input[i] = argument.substring(1, argument.length() - 1);
			} else {
				//TODO value may be missing (a problem in the case of primitives)
				input[i] = requestProperties.get(argument);
				if(input[i] == null && "properties".equals(argument)) {
					input[i] = requestProperties;
				}
				if(input[i] == null && "request".equals(argument)) {
					input[i] = httpRequest.get();
				}
				if(input[i] == null && "response".equals(argument)) {
					input[i] = httpResponse.get();
				}
			}
		}
		return input;
	}

	/**
	 * Iglu request attributes will be copied to the servlet request.
	 *
	 * @param dispatch
	 * @param parameters
	 * @return
	 * @throws ServletException
	 */
	public boolean dispatch(String dispatch, String[] parameters)// throws IOException
	{
		String dispatchURL = dispatch;
		HttpServletRequest servletRequest = httpRequest.get();
		HttpServletResponse servletResponse = httpResponse.get();
		//set content type, because otherwise the response
		//  may be interpreted as text/plain
		servletResponse.setContentType("text/html; charset=UTF-8");
		try
		{
			//pass set attributes as new servlet parameters (a hack to get rid of)
			Request request = requestRegistry.getCurrentRequest();
			if(request != null) {
				for (Object name : request.getAttributeMap().keySet())
				{
					Object o = request.getAttributeMap().get(name);
					servletRequest.setAttribute(name.toString(), o);
				}
			}
			//servlet-include, servlet-forward, service-invocation
            switch(this.dispatchMode)
			{
				case FORWARD:
				{
					ServletSupport.forward(dispatchURL, servletRequest, servletResponse);
				}
				default://INCLUDE
				{
					ServletSupport.include(dispatchURL, servletRequest, servletResponse);
				}
			}
		}
		catch (ServletException e)
		{
			throw new ResourceException("failed to dispatch servlet request to " + dispatchURL, e);
		}
		catch (IOException e)
		{
			throw new ResourceException("failed to dispatch servlet request to " + dispatchURL, e);
		}
		return true;
	}
}
