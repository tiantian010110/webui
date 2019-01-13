<%@ page language="java" contentType="text/html; charset=ISO-8859-1" pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<title>Insert title here</title>
<style type="text/css">
	body{
		-webkit-perspective: 500;
	}
	@-webkit-keyframes spin {
	    from {
	    -webkit-transform: rotateX(0);
	    }
	    to {
	    -webkit-transform: rotateX(30deg); 
	    width: 300px;
	    height: 300px;
	    }
	}
	.test{
		-webkit-transform-style: preserve-3d;
		-webkit-animation: spin 0.5s 1 linear forwards;
	}
</style>
</head>
<body>
	<div class="test" style="width: 400px;height: 400px;background: #fcfcfc;border: solid 1px #eee;margin: auto;" onmousemove="move(event)"></div>
</body>
<script type="text/javascript">
	function move(e){
		console.log(e)
	}
</script>
</html>