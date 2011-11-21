/*
 * Copyright 2011 Jeroen Meetsma
 *
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
package org.ijsberg.iglu.server.http.module;


import org.ijsberg.iglu.ConfigurationException;
import org.ijsberg.iglu.runtime.Startable;
import org.ijsberg.iglu.util.misc.StringSupport;
import org.ijsberg.iglu.util.properties.PropertiesSupport;
import org.ijsberg.iglu.util.reflection.ReflectionSupport;
import org.mortbay.jetty.Handler;
import org.mortbay.jetty.Server;
import org.mortbay.jetty.servlet.Context;
import org.mortbay.jetty.servlet.FilterHolder;
import org.mortbay.jetty.servlet.Holder;
import org.mortbay.jetty.servlet.ServletHolder;
import org.mortbay.thread.BoundedThreadPool;
import org.mortbay.util.MultiException;
import org.mortbay.xml.XmlConfiguration;

import javax.servlet.Filter;
import javax.servlet.Servlet;
import javax.servlet.ServletContextListener;
import java.io.File;
import java.io.FileInputStream;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;

/**
 * This component acts as a wrapper for the Jetty webserver / servlet runner
 * <p/>
 */
public class SimpleJettyServletContext implements Startable {

	private Server server;
//	private Properties section;

	private String contextPath = "/";
	private String documentRoot = "www";
	private int minimumThreads = 5;
	private int maximumThreads = 50;
	private int sessionTimeout = 1800;
	private int port = 17680;

	private Properties section;

//	private boolean sessionRequired;
//	private boolean loginRequired;

//	private boolean syncUserPrefs;
//	private int userPrefsMaxAge = -1;

	//preferred realm (for servlets)
//	private String realmId;


	public String getReport() {
		if (server != null && server.isStarted()) {

			return "nr of threads: " + server.getThreadPool().getThreads() + "\n" +
					"nr active: " + (server.getThreadPool().getThreads() - server.getThreadPool().getIdleThreads());
		} else {
			return "webserver not available";
		}
	}


	/**
	 */
	public void start() {
		try {
			// We may set InitializeAtStart to false, start the server
			// and then initialize the servlet exceptionHandler in order to
			// make servlet listeners receive a
			// contextInitialized() event before the servlet itself
			// is init()
//			ctx.getServletHandler().setInitializeAtStart(false);
			server.start();

//			ctx.getServletHandler().initialize();
		}
		catch (Exception e) {
			if (e instanceof MultiException) {
				MultiException me = (MultiException) e;
				Iterator i = me.getThrowables().iterator();
				while (i.hasNext()) {
					log(i.next());
				}
				throw new ConfigurationException("cannot start webserver at port " + port, me);
			}
			throw new ConfigurationException("cannot start webserver at port " + port, e);
		}
	}


	/**
	 * @throws ConfigurationException
	 */
	public void stop() {
		try {
			server.stop();
			server.destroy();
		}
		catch (Exception e) {
			throw new ConfigurationException("exception occurred while stopping webserver at port " + port, e);
		}
		System.out.println("server stopped");
	}

	public boolean isStarted() {
		return server.isStarted();
	}


	/**
	 * @throws ConfigurationException
	 */
	public void setProperties(Properties properties) {

		this.section = properties;
		section.getProperty("xmlConfigurationFileName", "./conf/jetty.xml");
		//try to obtain a reference to a specific Jetty XML configuratiin (jetty.xml) 
		String xmlConfig = section.getProperty("xmlConfigurationFileName");
		if (xmlConfig == null) {
			contextPath = section.getProperty("context_path", contextPath);
			documentRoot = section.getProperty("document_root", documentRoot);
			minimumThreads = Integer.valueOf(section.getProperty("minimum_threads", "" + minimumThreads));
			maximumThreads = Integer.valueOf(section.getProperty("maximum_threads", "" + maximumThreads));
			sessionTimeout = Integer.valueOf(section.getProperty("session_timeout", "" + sessionTimeout));
			port = Integer.valueOf(section.getProperty("port", "" + port));
		}

		server = new Server(port);

		if (xmlConfig != null) {
			File file = new File(xmlConfig);
			log("configuring Jetty using xml configuration '" + file.getAbsolutePath() + '\'');
			if (!file.exists()) {
				throw new ConfigurationException("file '" + xmlConfig + "' does not exist");
			}
			try {
				XmlConfiguration configuration = new XmlConfiguration(new FileInputStream(file));
				configuration.configure(server);
			}
			catch (Exception e) {
				throw new ConfigurationException("web environment can not be initialized", e);
			}
		} else {
			log("configuring Jetty using Iglu configuration");


			BoundedThreadPool pool = new BoundedThreadPool();
			pool.setMinThreads(minimumThreads);
			pool.setMaxThreads(maximumThreads);
			server.setThreadPool(pool);

			Context ctx = new Context(server, contextPath, Context.SESSIONS);

			ctx.getSessionHandler().getSessionManager().setMaxInactiveInterval(sessionTimeout);
			//set root directory
			ctx.setResourceBase(documentRoot);
//			addInitParameters(ctx.getInitParams(), section);

			addServlets(ctx, section);
			addFilters(ctx, section);
			addListeners(ctx, section);
		}
	}

	public void log(Object message) {
		System.out.println(message);
	}


	public void addServlets(Context ctx, Properties section) {
		Map<String, Properties> servletParameters = PropertiesSupport.getSubsections(section, "servlet");

		if (servletParameters != null) {
			//read servlets

			int initOrder = 0;
			for (String servletName : servletParameters.keySet()) {

				Properties subSection = servletParameters.get(servletName);
				//String servletName = subSection.getId();
				List urlPatterns = StringSupport.split(subSection.getProperty("url_pattern"), ",");

				String servletClassName = subSection.getProperty("class");

				log("Loading : " + servletName);
				if ((urlPatterns.isEmpty()) || (servletClassName == null)) {
					throw new ConfigurationException("loading servlet " + servletName + " (class=" + servletClassName + ", url_pattern=" + urlPatterns + ") failed");
				} else {
					log("Loading servlet " + servletName + " (" + servletClassName + ')');
					try {
						Servlet servlet = null;
						servlet = (Servlet) ReflectionSupport.instantiateClass(servletClassName);

						ServletHolder servletHolder = new ServletHolder(servlet);
						servletHolder.setName(servletName);
						addInitParameters(servletHolder, subSection);
						servletHolder.setInitOrder(initOrder++);

						Iterator j = urlPatterns.iterator();
						while (j.hasNext()) {
							//add servlet for each alias
							ctx.addServlet(servletHolder, (String) j.next());
						}
					}
					catch (InstantiationException e) {
						throw new ConfigurationException("servlet " + servletName + " can not be added to servlet context", e);
					}
				}
			}
		}
	}


	public void addFilters(Context ctx, Properties section) {
		Map<String, Properties> filterParameters = PropertiesSupport.getSubsections(section, "filter");

		if (filterParameters != null) {
			//read servlets

			int initOrder = 0;
			for (String filterName : filterParameters.keySet()) {
				Properties subSection = filterParameters.get(filterName);
				//String filterName = subSection.getId();
				List urlPatterns = StringSupport.split(subSection.getProperty("url_pattern"));
				String filterClassName = subSection.getProperty("class");

				log("Loading : " + filterName);
				if ((urlPatterns.isEmpty()) || (filterClassName == null)) {
					log("ERROR Loading servlet " + filterName + " (" + filterClassName + ") failed");
				} else {
					log("Loading filter " + filterName + " (" + filterClassName + ')');
					try {
						Filter filter = (Filter) ReflectionSupport.instantiateClass(filterClassName);
						FilterHolder filterHolder = new FilterHolder(filter);
						filterHolder.setName(filterName);
						addInitParameters(filterHolder, subSection);

						Iterator j = urlPatterns.iterator();
						while (j.hasNext()) {
							//add servlet for each alias
							ctx.addFilter(filterHolder, (String) j.next(), Handler.DEFAULT);
						}
					}
/*					catch (ClassNotFoundException t)
					{
						throw new ConfigurationException("filter " + filterName + " can not be added to servlet context", t);
					}
					catch (IllegalAccessException t)
					{
						throw new ConfigurationException("filter " + filterName + " can not be added to servlet context", t);
					}*/
					catch (InstantiationException e) {
						throw new ConfigurationException("filter " + filterName + " can not be added to servlet context", e);
					}
				}
			}
		}
	}

	public void addListeners(Context ctx, Properties section) {
		Map<String, Properties> listenerParameters = PropertiesSupport.getSubsections(section, "listener");

		if (listenerParameters != null) {
			//read servlets
			//Iterator i = listenerParameters.iterator();
			int initOrder = 0;
			for (String listenerName : listenerParameters.keySet()) {
				Properties subSection = listenerParameters.get(listenerName);
				//String listenerName = subSection.getId();
				try {
					String listenerClassName = subSection.getProperty("class").toString();

					log("Loading listener " + listenerName + " (" + listenerClassName + ')');

					ServletContextListener listener = (ServletContextListener) ReflectionSupport.instantiateClass(listenerClassName);
					ctx.addEventListener(listener);
				}
				catch (InstantiationException e) {
					throw new ConfigurationException("listener " + listenerName + " can not be added to servlet context", e);

				}
			}
		}
	}

	public static void addInitParameters(Map params, Properties subSection) {
		Properties properties = PropertiesSupport.getSubsection(subSection, "initparam");
		for (Object key : properties.keySet()) {
			params.put(key, subSection.getProperty(key.toString()));
		}
	}


	public static void addInitParameters(Holder holder, Properties subSection) {
		Properties properties = PropertiesSupport.getSubsection(subSection, "initparam");
		for (Object key : properties.keySet()) {
			holder.setInitParameter((String) key, subSection.getProperty(key.toString()));
		}
	}


}
