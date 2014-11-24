


function AdminConsole() {

}


AdminConsole.prototype.test = function(responseMessage, feedbackMessage) {

    alert(responseMessage);
}


AdminConsole.prototype.executeJson = function(responseMessage, feedbackMessage) {

    try {
        var message = eval("(" + responseMessage + ")");
    } catch(e) {
        alert(e.message + ' in:\n' + responseMessage);
    }
    adminConsole[message.function](message.data, message.dataId);
}


AdminConsole.prototype.openClusterWindow = function(data, dataId) {
	var  windowSettings = new Object();
	windowSettings.id = dataId;
	windowSettings.title = dataId;
	windowSettings.data = data[dataId];
	windowSettings.initFunction = initClusterWindow;
    ajaxRequestManager.doRequest('/cluster.html', adminConsole.createWindowWidget, windowSettings, null);
}


function createSmallWindow(id, source, label) {
    var settings = {
    	id : id,
    	cssClassName : 'window',
    	top: 100,
		width: 300,
		height: 300
    };
    var windowWidget = createWindow(source, label, settings);
    WidgetManager.instance.deployWidget(windowWidget);
}

function createWindow(source, content, label, settings) {
	var currentWindow = WidgetManager.instance.getWidget(settings.id);
	if(currentWindow != null) {
		WidgetManager.instance.destroyWidget(settings.id);
	}
	if(typeof label == 'undefined') {
		label = settings.id;
	}
	var contents = null;
	if(typeof source != 'undefined' && source != null) {
		contents = new WidgetContent({
			id: settings.id + '_contents',
			title : label,
			source : '' + source,
    		cssClassName : 'panelcontents',
	 	});
	} else {
		contents = new WidgetContent({
				id: settings.id + '_contents',
				title : label,
				cssClassName : 'panelcontents'},
    		content);
	}
    return new WindowWidget(settings, contents);
}


AdminConsole.prototype.openComponentWindow = function(data, dataId) {
	var  windowSettings = new Object();
	windowSettings.id = dataId;
	windowSettings.title = dataId;
	windowSettings.data = data;
	windowSettings.initFunction = initComponentWindow;
    ajaxRequestManager.doRequest('/component.html', adminConsole.createWindowWidget, windowSettings, null);
}

AdminConsole.prototype.openMethodWindow = function(data, dataId) {
	var  windowSettings = new Object();
	windowSettings.id = dataId;
	windowSettings.title = dataId;
	windowSettings.data = data;
	windowSettings.initFunction = initMethodWindow;
    ajaxRequestManager.doRequest('/method.html', adminConsole.createWindowWidget, windowSettings, null);
}

AdminConsole.prototype.reportMessage = function(parameter) {
	alert(parameter.message);
}



AdminConsole.prototype.openLoginWindow = function(parameter) {

	 var loginwidget = new WidgetContent({
		id: 'loginwidget',
		source: '/login.html'
    	//cssClassName : 'logstream'
	 });

    var windowWidget = new WindowWidget({
    	id : 'loginwindow',
    	cssClassName : 'window',
		width: 400,
		height: 300
    }, loginwidget);
   	widgetmanager.deployWidget(windowWidget);

}


AdminConsole.prototype.writeReturnValue = function(data, dataId) {
	document.getElementById("return_" + dataId).innerHTML = data.returnValue;
}


AdminConsole.prototype.createWindowWidget = function(responseMessage, windowSettings) {

    var element = document.createElement('html');
    element.innerHTML = '' + responseMessage;

    /*var nodeNames = '';
    for(var i = 0; i < element.childNodes.length; i++) {
        nodeNames += element.childNodes[i].nodeName + '\n';
    } */

	if(!widgetmanager.widgetExists(windowSettings.id)) {

	    //var windowWidget = new WindowWidget(windowSettings, element.getElementsByTagName('body')[0].innerHTML);
	    windowSettings.cssClassName = 'window';

    	var windowWidget = createWindow(null, element.getElementsByTagName('body')[0].innerHTML, windowSettings.title, windowSettings);
        WidgetManager.instance.deployWidget(windowWidget);


		if(typeof windowWidget.init != 'undefined') {
			windowWidget.init(windowSettings.data);
		}
	} else {
		widgetmanager.activateCurrentWidget(windowSettings.id);
	}

}


function login(username, password) {
    ajaxRequestManager.doRequest('/process/admin/login', adminConsole.executeJson, null, "username=" + username + "&password=" + password);
    widgetmanager.destroyWidget('loginwindow');
}


var adminConsole = new AdminConsole();



function initClusterWindow(data) {
	var componentReferences = '';
	for(var component in data.components) {
		componentReferences += '<a onclick="ajaxRequestManager.doRequest(\'/process/admin/get_component?clusterId=' + this.id + '&componentId=' + data.components[component].id + '\', adminConsole.executeJson);" >' + data.components[component].id + '<a><br>\n';
	}
	this.content.element.innerHTML = componentReferences;
}


function initComponentWindow(data) {
	var contents = this.content.element.innerHTML;
	for(var attribute in data) {
		contents = contents.replace('$(' + attribute + ')', data[attribute]);
	}
	var methodRefs = '';
	for(var method in data.methods) {
		methodRefs += '<a onclick="ajaxRequestManager.doRequest(\'/process/admin/get_method?clusterId=' + data.clusterId + '&componentId=' + data.id + '&signature=' + data.methods[method].signature + '\', adminConsole.executeJson);" >' + data.methods[method].name + '<a><br>\n';
	}
	contents = contents.replace('$(methodRefs)', methodRefs);

	this.content.element.innerHTML = contents;
}


function initMethodWindow(data) {
	var contents = this.content.element.innerHTML;
	for(var attribute in data) {
		contents = contents.replace('$(' + attribute + ')', data[attribute]);
	}
	var inputParams = '';
	for(var i = 0; i < parseInt(data.nr_parameters); i++) {
		inputParams += '<input type="text" name="param_' + i + '"><br>'
	}
	contents = contents.replace('$(input_parameters)', inputParams);
	this.content.element.innerHTML = contents;
}


function invokeMethod(form) {

	var elementString = 'clusterId=' + form.clusterId.value;
	elementString += '&componentId=' + form.componentId.value;
	elementString += '&signature=' + form.signature.value;
	elementString += '&nrParameters=' + form.nrParameters.value;

	for(var i = 0; i < form.elements.length; i++){
		if(form.elements[i].type == 'text') {
			elementString += '&' + form.elements[i].name + '=' + form.elements[i].value;
		}
	}
    ajaxRequestManager.doRequest('/process/admin/invoke_method', adminConsole.executeJson, null, elementString);
}



function openJavaScriptLog() {
	 var logwidget = new LogStreamWidget({
		id: 'logstream',
    	cssClassName : 'logstream',
	 });

    var windowWidget = new WindowWidget({
    	id : 'logwindow',
    	cssClassName : 'window',
    	title : 'javascript log output',
		width: 400,
		height: 300
    }, logwidget);
   	widgetmanager.deployWidget(windowWidget);
}


function openServerLog() {
	 var logwidget = new LogStreamWidget({
		id: 'serverlogstream',
    	cssClassName : 'logstream',
	 });
	logwidget.set('source', '/process/admin/get_log_entries');
	logwidget.set('source_load_action', 'loadEntries');


    var windowWidget = new WindowWidget({
    	id : 'serverlogwindow',
    	cssClassName : 'window',
    	title : 'server log output',
		width: 400,
		height: 300
    }, logwidget);
   	widgetmanager.deployWidget(windowWidget);
	WidgetManager.instance.registerTimerListener(logwidget, 1);
}


function openUpdateWindow() {
	if(!WidgetManager.instance.containsWidget('updateWindow')){
		var settings = new Object();

		settings.id = 'updateWindow';
		var updateWindow = new UploadWindowWidget(settings);
		updateWindow.set('title', 'system update');
//		updateWindow.set('content', 'system update');
		updateWindow.set('width', 400);
		updateWindow.set('height', 200);
		updateWindow.set('top', 300);
//		updateWindow.set('source', 'uploadform.html');
		WidgetManager.instance.deployWidget(updateWindow);
	} else {
		WidgetManager.instance.activateCurrentWidget('updateWindow');
	}
}


