


function AdminConsole() {

}


AdminConsole.prototype.test = function(responseMessage, feedbackMessage) {

    alert(responseMessage);
//    var obj = eval("(" + responseMessage + ")");
//	alert(obj.clusters[0].id);
}


AdminConsole.prototype.executeJson = function(responseMessage, feedbackMessage) {

//    alert(responseMessage);
    try {
        var message = eval("(" + responseMessage + ")");
    } catch(e) {
        alert(e.message + ' in:\n' + responseMessage);
    }
    adminConsole[message.function](message.data, message.dataId);
}


AdminConsole.prototype.openClusterWindow = function(data, dataId) {
//	var content =
  //  ajaxRequestManager.doRequest('/cluster.html', adminConsole.createWindowWidget, [parameter.message, parameter.message, 100, 250, content]);
	var  windowSettings = new Object();
	windowSettings.id = dataId;
	windowSettings.title = dataId;
//	windowSettings.height = 500;
//	windowSettings.width = 250;
	windowSettings.data = data[dataId];
	windowSettings.initFunction = initClusterWindow;
    ajaxRequestManager.doRequest('/cluster.html', adminConsole.createWindowWidget, windowSettings, null);
}

AdminConsole.prototype.openComponentWindow = function(data, dataId) {
//	var content =
  //  ajaxRequestManager.doRequest('/cluster.html', adminConsole.createWindowWidget, [parameter.message, parameter.message, 100, 250, content]);
	var  windowSettings = new Object();
	windowSettings.id = dataId;
	windowSettings.title = dataId;
//	windowSettings.height = 500;
//	windowSettings.width = 400;
	windowSettings.data = data;
	windowSettings.initFunction = initComponentWindow;
    ajaxRequestManager.doRequest('/component.html', adminConsole.createWindowWidget, windowSettings, null);
}

AdminConsole.prototype.openMethodWindow = function(data, dataId) {
//	var content =
  //  ajaxRequestManager.doRequest('/cluster.html', adminConsole.createWindowWidget, [parameter.message, parameter.message, 100, 250, content]);
	var  windowSettings = new Object();
	windowSettings.id = dataId;
	windowSettings.title = dataId;
//	windowSettings.height = 500;
//	windowSettings.width = 400;
	windowSettings.data = data;
	windowSettings.initFunction = initMethodWindow;
    ajaxRequestManager.doRequest('/method.html', adminConsole.createWindowWidget, windowSettings, null);
}

AdminConsole.prototype.reportMessage = function(parameter) {
	alert(parameter.message);
}



AdminConsole.prototype.openLoginWindow = function(parameter) {
//	alert(parameter.message);

	var  windowSettings = new Object();
	windowSettings.id = 'login';
	windowSettings.title = 'log in';
//	windowSettings.height = 100;
//	windowSettings.width = 250;
    ajaxRequestManager.doRequest('/login.html', adminConsole.createWindowWidget, windowSettings, null);
}


AdminConsole.prototype.writeReturnValue = function(data, dataId) {
//	var content =
  //  ajaxRequestManager.doRequest('/cluster.html', adminConsole.createWindowWidget, [parameter.message, parameter.message, 100, 250, content]);
	//alert(dataId);
	document.getElementById("return_" + dataId).innerHTML = data.returnValue;
}


AdminConsole.prototype.createWindowWidget = function(responseMessage, windowSettings) {
    var element = document.createElement('html');
    element.innerHTML = '' + responseMessage;

    var nodeNames = '';
    for(var i = 0; i < element.childNodes.length; i++) {
        nodeNames += element.childNodes[i].nodeName + '\n';
    }

	if(!widgetengine.widgetExists(windowSettings.id)) {

	    var windowWidget = new WindowWidget(windowSettings, element.getElementsByTagName('body')[0].innerHTML);
    	widgetengine.deployWidget(windowWidget);

		if(typeof windowWidget.init != 'undefined') {
			windowWidget.init(windowSettings.data);
		}
	}

}


function login(username, password) {
    ajaxRequestManager.doRequest('/process/admin/login', adminConsole.executeJson, null, "username=" + username + "&password=" + password);
    widgetengine.destroyWidget('login');
}


var adminConsole = new AdminConsole();



function initClusterWindow(data) {
	var componentReferences = '';
	for(var component in data.components) {
		componentReferences += '<a onclick="ajaxRequestManager.doRequest(\'/process/admin/get_component?clusterId=' + this.id + '&componentId=' + data.components[component].id + '\', adminConsole.executeJson);" >' + data.components[component].id + '<a><br>\n';
	}
	//alert(componentReferences);
	this.contentElement.innerHTML = componentReferences;
}


function initComponentWindow(data) {
	var contents = this.contentElement.innerHTML;
	for(var attribute in data) {
		contents = contents.replace('$(' + attribute + ')', data[attribute]);
	}

	var methodRefs = '';
//	alert(contents);
	for(var method in data.methods) {
		methodRefs += '<a onclick="ajaxRequestManager.doRequest(\'/process/admin/get_method?clusterId=' + data.clusterId + '&componentId=' + data.id + '&signature=' + data.methods[method].signature + '\', adminConsole.executeJson);" >' + data.methods[method].name + '<a><br>\n';
	}
	contents = contents.replace('$(methodRefs)', methodRefs);
//	alert(contents);

	this.contentElement.innerHTML = contents;
}


function initMethodWindow(data) {
	var contents = this.contentElement.innerHTML;
	for(var attribute in data) {
		contents = contents.replace('$(' + attribute + ')', data[attribute]);
	}

//      alert(data.nr_parameters);
	var inputParams = '';
	for(var i = 0; i < parseInt(data.nr_parameters); i++) {
		inputParams += '<input type="text" name="param_' + i + '"><br>'
	}
	contents = contents.replace('$(input_parameters)', inputParams);


//	alert(contents);


	this.contentElement.innerHTML = contents;
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

//	alert(elementString);
}

