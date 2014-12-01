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

package org.ijsberg.iglu.server.admin.http;

import org.ijsberg.iglu.configuration.Component;
import org.ijsberg.iglu.configuration.module.BasicAssembly;
import org.ijsberg.iglu.configuration.module.StandardComponent;

import javax.servlet.jsp.HttpJspPage;

/**
 * Created with IntelliJ IDEA.
 * User: jeroen
 * Date: 11/30/14
 * Time: 5:29 PM
 * To change this template use File | Settings | File Templates.
 */
public abstract class JapRegistryAssembly extends BasicAssembly {


	public static void registerPage(HttpJspPage page) {

		//System.out.println("registering " + page.getServletName());
		Component pageComponent = new StandardComponent(page);
		//pageComponent.setProperties(PropertiesSupport.loadProperties("lustrum_config/page.properties"));
		core.getFacade().connect(pageComponent);
	}

}
