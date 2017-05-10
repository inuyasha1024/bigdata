package com.talkingdata.client;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * 
 * 
 * @author huajun
 * @version 1.0
 *
 */
public class AnalyticsEngineSDK {
	
	private static final Logger log = Logger.getGlobal();
	
	public static final String accessUrl = "http://node3/log.gif";
	private static final String platformName = "java_server";
	private static final String sdkName = "jdk";
	private static final String version = "1";

	/**
	 *
	 * 
	 * @param orderId
	 *            
	 * @param memberId
	 *            
	 * @return 
	 */
	public static boolean onChargeSuccess(String orderId, String memberId) {
		try {
			if (isEmpty(orderId) || isEmpty(memberId)) {
				
				log.log(Level.WARNING, "订单id和会员id不能为空");
				return false;
			}
			
			Map<String, String> data = new HashMap<String, String>();
			data.put("u_mid", memberId);
			data.put("oid", orderId);
			data.put("c_time", String.valueOf(System.currentTimeMillis()));
			data.put("ver", version);
			data.put("en", "e_cs");
			data.put("pl", platformName);
			data.put("sdk", sdkName);
			
			String url = buildUrl(data);
			
			SendDataMonitor.addSendUrl(url);
			return true;
		} catch (Throwable e) {
			log.log(Level.WARNING, "发送数据异常", e);
		}
		return false;
	}

	/**
	 * 
	 * 
	 * @param orderId
	 *           
	 * @param memberId
	 *           
	 * @return 
	 */
	public static boolean onChargeRefund(String orderId, String memberId) {
		try {
			if (isEmpty(orderId) || isEmpty(memberId)) {
				// 订单id或者memberid为空
				log.log(Level.WARNING, "订单id和会员id不能为空");
				return false;
			}
			
			Map<String, String> data = new HashMap<String, String>();
			data.put("u_mid", memberId);
			data.put("oid", orderId);
			data.put("c_time", String.valueOf(System.currentTimeMillis()));
			data.put("ver", version);
			data.put("en", "e_cr");
			data.put("pl", platformName);
			data.put("sdk", sdkName);
			
			String url = buildUrl(data);
			
			SendDataMonitor.addSendUrl(url);
			return true;
		} catch (Throwable e) {
			log.log(Level.WARNING, "发送数据异常", e);
		}
		return false;
	}

	/**
	 * 
	 * 
	 * @param data
	 * @return
	 * @throws UnsupportedEncodingException
	 */
	private static String buildUrl(Map<String, String> data) throws UnsupportedEncodingException {
		StringBuilder sb = new StringBuilder();
		sb.append(accessUrl).append("?");
		for (Map.Entry<String, String> entry : data.entrySet()) {
			if (isNotEmpty(entry.getKey()) && isNotEmpty(entry.getValue())) {
				sb.append(entry.getKey().trim()).append("=").append(URLEncoder.encode(entry.getValue().trim(), "utf-8"))
						.append("&");
			}
		}
		return sb.substring(0, sb.length() - 1);
	}

	/**
	 * 
	 * 
	 * @param value
	 * @return
	 */
	private static boolean isEmpty(String value) {
		return value == null || value.trim().isEmpty();
	}

	/**
	 * 
	 * 
	 * @param value
	 * @return
	 */
	private static boolean isNotEmpty(String value) {
		return !isEmpty(value);
	}
}
