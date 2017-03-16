<%@ page contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>TestPage3</title>
<script type="text/javascript" src="./js/analytics.js"></script>
</head>
<body>
	TestPage3<br/>
	<label>category:  category name</label><br/>
	<label>action: action name</label><br/>
	<label>map: {"key1":"value1", "key2":"value2"}</label><br/>
	<label>duration: 1245</label><br/>
	<button onclick="__AE__.onEventDuration('event category name','event action name', {'key1':'value1','key2':'value2'}, 1245)">active map and duration event</button><br/>
	<button onclick="__AE__.onEventDuration('event category name','event action name')">active event without map and duration</button><br/>
	redirect:
	<a href="demo.jsp">demo</a>
	<a href="demo2.jsp">demo2</a>
	<a href="demo3.jsp">demo3</a>
	<a href="demo4.jsp">demo4</a>
</body>
</html>