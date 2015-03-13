package org.ijsberg.iglu.util.http;

import org.ijsberg.iglu.logging.Level;
import org.ijsberg.iglu.logging.LogEntry;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;

/**
 * Created with IntelliJ IDEA.
 * User: Jeroen Meetsma
 * Date: 12/03/15
 * Time: 08:00
 * To change this template use File | Settings | File Templates.
 */
public class HttpIoSupport {
	public static String getDataByHttp(String urlStr) {

		StringBuffer result = new StringBuffer();
		URL url = null;
		URLConnection yc = null;
		try {
			url = new URL(urlStr);
			System.out.println(new LogEntry("opening connection to " + urlStr));
			yc = url.openConnection();
			yc.setConnectTimeout(60 * 1000);
			yc.setReadTimeout(60 * 1000);
			yc.connect();
			BufferedReader in = new BufferedReader(
					new InputStreamReader(
							yc.getInputStream()));
			String inputLine;

			while ((inputLine = in.readLine()) != null)  {
				result.append(inputLine + "\n");
			}
			in.close();
			System.out.println(new LogEntry("connection to " + urlStr + " closed"));

		} catch (IOException e) {
			System.out.println(new LogEntry(Level.CRITICAL, "unable to obtain data from " + urlStr, e));
			return null;
		}
		return result.toString();
	}
}
