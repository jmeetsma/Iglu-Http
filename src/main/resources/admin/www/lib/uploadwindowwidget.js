





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
                     					'<div class="progress_bar_inner" style="width: 0px;"></div>' +
                     					'<div class="progress_bar_text">/div>' +
              		       			'</div>' +
                    	 		'</div>' +
                     		'</center>' +
                     		'<br /><br /><br />' +
                     		'<form action="process/user/cancel_upload" method="post" enctype="multipart/form-data"  onSubmit="">' +
                     			'<div class="form_line" style="text-align: right; margin-top: 5px; margin-right: 22px"><input type="submit" value="cancel"></div>' +
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
