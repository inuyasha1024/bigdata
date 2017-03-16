<%@ page contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>TestPage2</title>
<script type="text/javascript" src="./js/analytics.js"></script>
</head>
<body>
	TestPage2
	<br/>
	<label>orderid: 123456</label><br>
	<label>orderName: TestOrder123456</label><br/>
	<label>currencyAmount: 524.01</label><br/>
	<label>currencyType: RMB</label><br/>
	<label>paymentType: alipay</label><br/>
	<button onclick="__AE__.onChargeRequest('123456','TestOrder123456',524.01,'RMB','alipay')">active chargeRequest event</button><br/>
	Redirect:
	<a href="demo.jsp">demo</a>
	<a href="demo2.jsp">demo2</a>
	<a href="demo3.jsp">demo3</a>
	<a href="demo4.jsp">demo4</a>
</body>
</html>