/**
 * Copyright 2011-2014 Jeroen Meetsma - IJsberg
 *
 * This file is part of Iglu.
 *
 * Iglu is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Iglu is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Iglu.  If not, see <http://www.gnu.org/licenses/>.
 */

////////////////////////////
//                        //
//  AJAX request manager  //
//                        //
////////////////////////////

//singleton engine

var hash = window.location.hash;

function AjaxRequestManager()
{
	this.is_ie = (navigator.userAgent.indexOf('MSIE') >= 0) ? 1 : 0;
	this.is_ie5 = (navigator.appVersion.indexOf('MSIE 5.5') != -1) ? 1 : 0;
	this.is_opera = ((navigator.userAgent.indexOf('Opera 6') != -1) || (navigator.userAgent.indexOf('Opera/6') != -1)) ? 1 : 0;
	this.is_netscape = (navigator.userAgent.indexOf('Netscape') >= 0) ? 1 : 0;

	this.use_native_xml_http_object = false;
	try {
		new ActiveXObject('Msxml2.XMLHTTP');
	}
	catch(e) {
		this.use_native_xml_http_object = true;
	}
	this.totalNrofRequests = 0;
	this.totalNrofResponses = 0;

	this.nrofRequests = 0;
	this.nrofConcurrentRequests = 0;
	//response and handler queues for coping with multiple concurrent requests
	this.callbacks = new Array();
	this.callbackInputObjects = new Array();
	this.ajaxRequests = new Array();


	this.ajaxRequestHistory = new Array();

}

function AjaxRequest(requestURL, callback, callbackInput, postData, multipart) {
	this.requestURL = requestURL;
	this.callback = callback;
	this.callbackInput = callbackInput;
	this.postData = postData;
	this.multipart = multipart;
}


AjaxRequestManager.prototype.checkAjaxSupport = function()
{
	return (this.createAjaxRequest(ignoreResponse) != null);
}

AjaxRequestManager.prototype.back = function()
{
	this.ajaxRequestHistory.pop();
	var request = this.ajaxRequestHistory.pop();
	//window.location.hash = "#" + this.totalNrofRequests;

	if(!request) {
		alert('No previous action available');
	} else {
		this.doRequest(request.requestURL, request.callback, request.callbackInput, request.postData, request.multipart);
	}
}

AjaxRequestManager.prototype.clearHistory = function()
{
	this.ajaxRequestHistory = new Array();
}




/**
 *
 * @param requestURL http-request as URL
 * @param callback JavaScript function that will be called when response arrives
 *                 callback will be invoked with responseObject and possibly callbackInput
 * @param callbackInput object that will be fed back into callback function
 * @param postData HTML formdata that must be POSTed
 *
 */
AjaxRequestManager.prototype.doRequest = function(requestURL, callback, callbackInput, postData, multipart)
{
	this.ajaxRequestHistory.push(new AjaxRequest(requestURL, callback, callbackInput, postData, multipart));
    window.location.hash = "#req" + this.totalNrofRequests;

	if(this.ajaxRequestHistory.length > 50) {
		this.ajaxRequestHistory.shift();
	}
	try {
		this.totalNrofRequests++;
		this.nrofConcurrentRequests++;
		var requestNr = this.nrofRequests++;

		if (typeof(callback) == 'undefined' || callback == null) {
			this.callbacks[requestNr] = ignoreResponse;
		} else {
			this.callbacks[requestNr] = callback;
		}

		this.callbackInputObjects[requestNr] = callbackInput;

		//hand each request its own private handler
		this.ajaxRequests[requestNr] = this.createAjaxRequest(new Function('dispatchResponse(' + requestNr + ');'));

		if (multipart) {
        	this.sendMultiPartRequest(this.ajaxRequests[requestNr], requestURL, postData);
        } else if (postData != null) {
			this.sendPOSTRequest(this.ajaxRequests[requestNr], requestURL, postData);
		} else {
			this.sendGETRequest(this.ajaxRequests[requestNr], requestURL);
		}
		return requestNr;
	}
	catch(e) {
		alert('unable to send ' + (postData == null ? 'GET' : 'POST') + ' AJAX request ' + requestURL + ' with message "' + e.message + '"');
	}
}

//internal function
AjaxRequestManager.prototype.sendGETRequest = function(ajaxRequest, url) {
	ajaxRequest.open('GET', url, true);
	ajaxRequest.send(null);
}

//internal function
AjaxRequestManager.prototype.sendPOSTRequest = function(ajaxRequest, url, postData) {
	ajaxRequest.open('POST', url, true);
	ajaxRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
	ajaxRequest.send(postData);
}

//internal function
AjaxRequestManager.prototype.sendMultiPartRequest = function(ajaxRequest, url, postData) {
	ajaxRequest.open('POST', url, true);
	ajaxRequest.setRequestHeader("Content-Type", "multipart/form-data; charset=UTF-8");
	ajaxRequest.send(postData);
}

AjaxRequestManager.prototype.createAjaxRequest = function(handler) {
	var ajaxRequest = null;
	if (!this.use_native_xml_http_object) {
		var strObjName = (this.is_ie5) ? 'Microsoft.XMLHTTP' : 'Msxml2.XMLHTTP';
		try {
			ajaxRequest = new ActiveXObject(strObjName);
			ajaxRequest.onreadystatechange = handler;
		} catch(e) {
			window.status = 'ERROR: Page cannot be updated. Verify that active scripting and activeX controls are enabled';
			return;
		}
	} else {
		ajaxRequest = new XMLHttpRequest();
		if (this.is_ie) {
			ajaxRequest.onreadystatechange = handler;
		} else {
			ajaxRequest.onload = handler;
			ajaxRequest.onerror = handler;
		}
	}
	return ajaxRequest;
}

AjaxRequestManager.prototype.abortRequest = function(requestNr) {
//TODO test
	ajaxRequestManager.ajaxRequests[requestNr].abort();
	removeFromRequestQueue(requestNr);
}


function dispatchResponse(requestNr)
{
	//	alert('handling result: ' + message);
	//serverResponse.status: 200, 500, 503, 404
	if (ajaxRequestManager.ajaxRequests[requestNr].readyState == 4 || ajaxRequestManager.ajaxRequests[requestNr].readyState == 'complete')
	{
		this.totalNrofResponses++;

		if(ajaxRequestManager.callbackInputObjects[requestNr] == null) {
			ajaxRequestManager.callbacks[requestNr](ajaxRequestManager.ajaxRequests[requestNr].responseText);
		} else {
		    //calls callback(response, callbackInput[])
			ajaxRequestManager.callbacks[requestNr](ajaxRequestManager.ajaxRequests[requestNr].responseText, ajaxRequestManager.callbackInputObjects[requestNr]);
		}
        removeFromRequestQueue(requestNr);
	}
}

function removeFromRequestQueue(requestNr) {
	//clean queue
	ajaxRequestManager.ajaxRequests[requestNr] = null;
	ajaxRequestManager.callbacks[requestNr] = null;
	ajaxRequestManager.callbackInputObjects[requestNr] = null;

	ajaxRequestManager.nrofConcurrentRequests--;
	if (ajaxRequestManager.nrofConcurrentRequests == 0) {
		//clean up handler queue
		ajaxRequestManager.ajaxRequests = new Array();
		ajaxRequestManager.callbacks = new Array();
		ajaxRequestManager.callbackInputObjects = new Array();
		ajaxRequestManager.nrofRequests = 0;
	}
}



/**
 * Interpretes response as instructions that are either
 * evaluated in this function by 'eval()' or by a member 'evaluate()' of callbackInput
 */
AjaxRequestManager.prototype.evaluateResponse = function(contents, callbackInput)
{
	if(callbackInput != null && typeof(callbackInput.evaluate) == 'function')
	{
		callbackInput.evaluate(contents);
	}
	else
	{
		eval(contents);
	}
}

function ignoreResponse() {
}

var ajaxRequestManager = new AjaxRequestManager();


////// UTILITIES
//TODO move to menu (?)


function loadPageHtml(contents, callbackInput) {
	var panelContents = document.getElementById(callbackInput.target + '_contents');
	panelContents.innerHTML = contents;

	var panelHeader = document.getElementById(callbackInput.target + '_header');
	panelHeader.innerHTML = callbackInput.title;
}

function linkToHtml(source, target, title) {

	var callbackInput = new Object();
	callbackInput.target = target;
	callbackInput.title = title;

	ajaxRequestManager.doRequest('./' + source, loadPageHtml, callbackInput);
	return false;
}

function loadPageJson(contents, callbackInput) {
	var panelContents = document.getElementById(callbackInput.target + '_contents');
	panelContents.innerHTML = '';

	var panelHeader = document.getElementById(callbackInput.target + '_header');
	panelHeader.innerHTML = callbackInput.title;

    //TODO this is JavaScript rather than JSON
	eval(contents);

}

function linkToJson(source, target, title) {
	var callbackInput = new Object();
	callbackInput.target = target;
	callbackInput.title = title;

	ajaxRequestManager.doRequest('./' + source, loadPageJson, callbackInput);
	return false;
}


function toggleProperty(key, on, off) {

	var value = WidgetManager.instance.settings[key];

	if(value == off) {
		WidgetManager.instance.settings[key] = on;
	} else {
		WidgetManager.instance.settings[key] = off;
	}
	document.getElementById(key + '_select').innerHTML = (value == off ? '&#x2713;' : '&nbsp;');
}

function getToggleProperty(value, on, off) {

	if(value == on) {
		return '&#x2713;';
	}
	if(value == off) {
		return '&nbsp;';
	}

}



function createLink(item, alternativeLabel) {

	var onclick = '';
	var toggleIndication = '';
	//alert(item.toggleProperty.key);

	if(typeof item.toggleProperty_key != 'undefined') {

		if(typeof item.toggleProperty_on == 'undefined') {
			item.toggleProperty_on = 'true';
		}
		if(typeof item.toggleProperty_off == 'undefined') {
			item.toggleProperty_off = 'false';
		}
		if(typeof item.toggleProperty_value == 'undefined') {
			item.toggleProperty_value = item.toggleProperty_off;

			//
		}

		toggleIndication = '<span id="' + item.toggleProperty_key + '_select">' + (item.toggleProperty_value == item.toggleProperty_off ? '&nbsp;&nbsp;' : '&#x2713;') + '</span>';

		onclick += 'toggleProperty(\'' + item.toggleProperty_key + '\',\'' + item.toggleProperty_on + '\',\'' + item.toggleProperty_off + '\');';

		WidgetManager.instance.settings[item.toggleProperty_key] = item.toggleProperty_value;
	}

	if(typeof(item.link) != 'undefined' && item.link.length > 0) {

		for(var i in item.link) {
			var link = item.link[i];
			if(link.url.endsWith('.js')) {
				onclick += 'linkToJson(\'' + link.url + '\', \'' + link.target + '\', \'' + link.target_label + '\');';
			} else {
				onclick += 'linkToHtml(\'' + link.url + '\', \'' + link.target + '\', \'' + link.target_label + '\');';
			}
		}
	}
	if(typeof(item.onclick) != 'undefined') {
		onclick += item.onclick;
	}
	if(onclick.length > 0) {
		return '<a onclick="' + onclick + '">' + (typeof alternativeLabel !== 'undefined' ? alternativeLabel : item.label) + toggleIndication + '</a>';
	} else {
		return item.label;
	}
}


setInterval(function(){
    if (window.location.hash != hash) {

        //alert('' + parseInt(window.location.hash.substring(1)) + ' != ' + parseInt(hash.substring(1)));

        if(parseInt(window.location.hash.substring(4)) < parseInt(hash.substring(4))) {
            ajaxRequestManager.back();
        }


        hash = window.location.hash;
        //alert("User went back or forward to application state represented by " + hash);
    }
}, 100);




