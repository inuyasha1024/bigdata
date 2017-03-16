package com.talkingdata.log.test;
import com.talkingdata.client.AnalyticsEngineSDK;

public class Test {
	public static void main(String[] args) {
		AnalyticsEngineSDK.onChargeSuccess("orderid123", "huajun123");
		AnalyticsEngineSDK.onChargeRefund("orderid456", "huajun456");
	}
}
