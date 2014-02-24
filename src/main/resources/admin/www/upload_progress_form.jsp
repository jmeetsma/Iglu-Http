<%@ page extends="nl.ijsberg.cms.presentation.servlet.CMSPage" %>
<%@ page import="java.util.List" %>
<%@ page import="java.util.Iterator" %>

<%ensureRole(request, response, "customer");%>

<html>

<%
	long bytesRead = getWebUtilAgent().getBytesRead();
	long contentLength = getWebUtilAgent().getContentLength();
	int relativeProgress = 0;
	if(contentLength != 0) {
		relativeProgress = (int)(((1.0 * bytesRead) / (contentLength)) * 324);
	}

%>

<script type"text/JavaScript">
	function init() {

		if(!<%=getWebUtilAgent().isUploadCancelled()%> && (<%=bytesRead%> != <%=contentLength%> || <%=relativeProgress%> == 0)) {
			showProgressFrame(500);
		}
	}

	function showProgressFrame(delay) {
		setTimeout('reloadProgressFrame()', delay);
	}

	function reloadProgressFrame() {
		window.location.reload();
	}

</script>


<%@include file="service_head.inc"%>

<body onload="init()">

cancelled:<%=getWebUtilAgent().isUploadCancelled()%>


	<center>
	<div class="upload_form">
		<br /><br />
		<center>
		<div class="form_line" style="margin-top: 5px;" >
			<div class="progress_bar_outer">
				<div class="progress_bar_inner" style="width: <%=relativeProgress%>px;"></div>
				<div class="progress_bar_text"><%=getWebUtilAgent().getBytesRead()%> / <%=getWebUtilAgent().getContentLength()%></div>
			</div>
		</div>
		</center>

		<br /><br /><br />

		<form action="<%=request.getContextPath()%>/process/user/<%=(getWebUtilAgent().isUploadCancelled() || ((bytesRead == contentLength) && contentLength > 0) ? "continue" : "cancel" )%>_upload" method="post" enctype="multipart/form-data"  <%=((getWebUtilAgent().isUploadCancelled() || ((bytesRead == contentLength) && contentLength > 0) ? "onSubmit=\"window.parent.showUploadFrame();return false;\"" : ""))%>>
			<div class="form_line" style="text-align: right; margin-top: 5px;" ><input type="submit" value="<%=(getWebUtilAgent().isUploadCancelled() || ((bytesRead == contentLength) && contentLength > 0) ? "continue" : "cancel" )%>" style="margin-right: 22px"></div>
		</form>
	</div>
	</center>

</body>
</html>
