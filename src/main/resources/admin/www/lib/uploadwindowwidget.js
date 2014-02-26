





function UploadWindowWidget(settings) {
	this.id = settings.id;
	this.cssClassName = 'window';
	this.height = null;
	this.width = null;
	this.top = null;
	this.left = null;
	this.title = null;
	this.constructUploadWindowWidget(settings);
}


UploadWindowWidget.UPLOAD_HTML = '<body>' +
                  	'<div class="upload_form">' +
                  		'<form action="" method="post" enctype="multipart/form-data" onSubmit="startUpload(this);return false;">' +
                  			'<div class="form_line"><div class="input_label">select file</div><input type="file" name="upload"></div>' +
                  			'<div class="input_label">Remarks:</div>' +
                  			'<textarea cols="40" rows="3" name="remarks"></textarea>' +
                  			'<div class="form_line" style="text-align: right; margin-top: 5px;" ><input type="submit" value="upload" style="margin-right: 22px"></div>' +
                  		'</form>' +
                  	'</div>' +
                  '</body>';

UploadWindowWidget.PROGRESS_HTML = '<center>' +
                     	'<div class="upload_form">' +
                     		'<br /><br />' +
                     		'<center>' +
                     			'<div class="form_line" style="margin-top: 5px;" >' +
                     				'<div class="progress_bar_outer">' +
                     					'<div id="progress_bar_inner" class="progress_bar_inner" style="width: 0px;"></div>' +
                     					'<div id="progress_bar_text" class="progress_bar_text"></div>' +
              		       			'</div>' +
                    	 		'</div>' +
                     		'</center>' +
                     		'<br /><br /><br />' +
                     		'<form action="" method="post" enctype="multipart/form-data"  onSubmit="cancelUpload(this);return false;">' +
                     			'<div class="form_line" style="text-align: right; margin-top: 5px; margin-right: 22px"><input id="submit_button" type="submit" value="cancel"></div>' +
                     		'</form>' +
                     	'</div>' +
                     '</center>';


subclass(UploadWindowWidget, WindowWidget);


UploadWindowWidget.prototype.constructUploadWindowWidget = function(settings) {

	this.constructWindowWidget(settings, UploadWindowWidget.UPLOAD_HTML);
};

UploadWindowWidget.prototype.onFocus = function() {

	this.supertype.onFocus.call(this);

}

UploadWindowWidget.prototype.onTimer = function() {
	ajaxRequestManager.doRequest('/process/admin/get_progress', WidgetManager.instance.executeJson, this);
}

UploadWindowWidget.prototype.displayProgress = function(data) {
	log(data);
	eval(data);
}

UploadWindowWidget.prototype.onDestroy = function() {
	WidgetManager.instance.unregisterTimerListener(this);
	//save state
};


function startUpload(form) {
	//window.parent.showProgressFrame(50);return true;

	// /process/admin/upload

//	alert(form);



	  /* Create a FormData instance */
	  var formData = new FormData();
	  /* Add the file */
	  formData.append('upload', form.upload.files[0]);
	  formData.append('remarks', form.remarks.value);

	//AjaxRequestManager.prototype.doRequest = function(requestURL, callback, callbackInput, postData)
    ajaxRequestManager.doRequest('/process/admin/upload', null, null, formData, true);

	var uploadWindow = WidgetManager.instance.getWidget('updateWindow');
	uploadWindow.set('content', UploadWindowWidget.PROGRESS_HTML);
	uploadWindow.refresh();


	WidgetManager.instance.registerTimerListener(uploadWindow, .333);


	return false;


}

function cancelUpload(form) {

	var uploadWindow = WidgetManager.instance.getWidget('updateWindow');
	if(!uploadFinished) {
		uploadCancelled = true;
		uploadFinished = true;
		ajaxRequestManager.doRequest('process/user/cancel_upload');
		document.getElementById('progress_bar_text').innerHTML = 'upload cancelled';
		document.getElementById('submit_button').value = 'continue';
		WidgetManager.instance.unregisterTimerListener(uploadWindow, .333);
	} else {
		ajaxRequestManager.doRequest('process/user/reset_upload');
		uploadWindow.set('content', UploadWindowWidget.UPLOAD_HTML);
		uploadWindow.refresh();

	}


}




function updateProgressForm() {
    ajaxRequestManager.doRequest('<%=getServiceBaseUrl()%>process/user/get_progress', WidgetManager.instance.executeJson);
}

var uploadCancelled = false;
var uploadFinished = false;

//TODO move to widget
function updateProgress(data, dataId) {

	if(!uploadCancelled) {
		if(parseInt(data.progress.bytesRead) > 0) {
			document.getElementById('progress_bar_text').innerHTML = data.progress.bytesRead + ' / ' + data.progress.contentLength;
		}
		if(parseInt(data.progress.bytesRead) > 0 && data.progress.bytesRead == data.progress.contentLength) {

		    document.getElementById('submit_button').value = 'continue';
		    uploadFinished = true;
		    document.getElementById('progress_bar_inner').style.width = '324px';

	    	var uploadWindow = WidgetManager.instance.getWidget('updateWindow');
			WidgetManager.instance.unregisterTimerListener(uploadWindow);


		} else {

			if(parseInt(data.progress.contentLength) != 0) {
				var relativeProgress = Math.round(((1.0 * parseInt(data.progress.bytesRead)) / (parseInt(data.progress.contentLength))) * 324);
				document.getElementById('progress_bar_inner').style.width = '' + relativeProgress + 'px';
			}
			//setTimeout('updateProgressForm()', 250);
		}
	} else {
		WidgetManager.instance.unregisterTimerListener(uploadWindow);
		//abort request
		//document.getElementById("upload_select_frame").src='<%=getServiceBaseUrl()%>/service/uploadform.jsp';
	}
}






