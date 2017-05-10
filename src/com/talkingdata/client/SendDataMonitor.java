package com.talkingdata.client;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * 
 * @author huajun
 *
 */
public class SendDataMonitor {
	
	private static final Logger log = Logger.getGlobal();
	
	private BlockingQueue<String> queue = new LinkedBlockingQueue<String>();
	
	private static SendDataMonitor monitor = null;

	private SendDataMonitor() {
		// 
	}

	/**
	 * 
	 * 
	 * @return
	 */
	public static SendDataMonitor getSendDataMonitor() {
		if (monitor == null) {
			synchronized (SendDataMonitor.class) {
				if (monitor == null) {
					monitor = new SendDataMonitor();

					Thread thread = new Thread(new Runnable() {

						@Override
						public void run() {
							
							SendDataMonitor.monitor.run();
						}
					});
					
					thread.start();
				}
			}
		}
		return monitor;
	}

	/**
	 * 
	 * 
	 * @param url
	 * @throws InterruptedException
	 */
	public static void addSendUrl(String url) throws InterruptedException {
		getSendDataMonitor().queue.put(url);
	}

	/**
	 * 
	 * 
	 */
	private void run() {
		while (true) {
			try {
				String url = this.queue.take();
				
				HttpRequestUtil.sendData(url);
			} catch (Throwable e) {
				log.log(Level.WARNING, "发送url异常", e);
			}
		}
	}

	/**
	 * 
	 * 
	 *
	 *
	 */
	public static class HttpRequestUtil {
		/**
		 * 
		 * 
		 * @param url
		 * @throws IOException
		 */
		public static void sendData(String url) throws IOException {
			HttpURLConnection con = null;
			BufferedReader in = null;

			try {
				URL obj = new URL(url); 
				con = (HttpURLConnection) obj.openConnection(); 
				
				con.setConnectTimeout(5000); 
				con.setReadTimeout(5000); 
				con.setRequestMethod("GET"); 

				System.out.println("发送url:" + url);
				
				in = new BufferedReader(new InputStreamReader(con.getInputStream()));
				
			} finally {
				try {
					if (in != null) {
						in.close();
					}
				} catch (Throwable e) {
					// nothing
				}
				try {
					con.disconnect();
				} catch (Throwable e) {
					
				}
			}
		}
	}
}
