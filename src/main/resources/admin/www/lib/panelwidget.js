
function PanelSettings(id, width, height, source) {
	this.id = id;
	this.width = width;
	this.height = height;
	this.source = source;
}


function PanelWidget(settings, content, source) {
//	this.element = containerElement;
	this.id = settings.id;

	this.resizeDirections = '';

	if(typeof settings.height != 'undefined') {
		this.height = settings.height;
	} else {
//		this.height = '100%';
	}
	if(typeof settings.width != 'undefined') {
		this.width = settings.width;
	} else {
//		this.width = '100%';
	}
	if(typeof settings.source != 'undefined') {
		this.source = settings.source;
	} else {
		this.source = null;
	}
	if(typeof content != 'undefined') {
		this.content = content;
	} else {
		this.content = 'loading...';
	}
}

PanelWidget.prototype = new Widget();


PanelWidget.prototype.allowHorizontalResize = function() {
	if(this.resizeDirections.indexOf('e') == -1) {
		this.resizeDirections += 'e';
	}
};

PanelWidget.prototype.allowVerticalResize = function() {
	if(this.resizeDirections.indexOf('s') == -1) {
		this.resizeDirections += 's';
	}
};

PanelWidget.prototype.alertSomething = function(value) {
	alert(value);
};

PanelWidget.prototype.process = function(value) {
	alert(value);
};

PanelWidget.prototype.draw = function(left, top) {
	if(this.element != null) {
		this.element.style.visibility = 'hidden';
		this.element.className = 'panel';
		this.setSizeAndPosition();
		this.writeHTML();
		this.element.style.visibility = 'visible';
	}
};


PanelWidget.prototype.setSizeAndPosition = function() {

	if(typeof this.width != 'undefined' && this.allowsResize('e')) {
		this.element.style.width = this.width + 'px';
	} else {
		this.element.style.display = 'table-row';
     }
	if(typeof this.height != 'undefined' && this.allowsResize('s')) {
		this.element.style.height = this.height + 'px';
	} else {
		this.element.style.display = 'table-cell';
	}
	log('width: ' + this.element.style.width + ' height: ' + this.element.style.height);
};


PanelWidget.prototype.writeHTML = function() {

	if(this.element) {
		if((typeof this.content.writeHTML != 'undefined')) {
			this.content.writeHTML();
        } else {
			var result = '<div id="' + this.id + '_contents">';
			result += this.content;
			result += '</div>';
			this.element.innerHTML = result;
		}
	}
};


PanelWidget.prototype.onDestroy = function() {
	//save state
};


PanelWidget.prototype.onDeploy = function() {
//	widgetengine.registerDraggableWidget(this);

	this.top = getElementPositionInPage(this.element).y;
	this.left = getElementPositionInPage(this.element).x;

    if(this.resizeDirections.length > 0) {
		widgetengine.registerResizeableWidget(this, this.resizeDirections);
	}

	if((typeof this.content.writeHTML != 'undefined')) {
		widgetengine.deployWidgetInContainer(this.element, this.content);
	}

	//load state
	this.refresh();
};

PanelWidget.prototype.refresh = function() {
	//load state
	if(this.source != null) {
		ajaxRequestManager.doRequest(this.source, this.display, this);
	}
};

//todo rename to activate / deactivate

PanelWidget.prototype.onFocus = function() {
};

PanelWidget.prototype.onBlur = function() {
};


PanelWidget.prototype.display = function(content, element)
{
	if(element != null)
	{
		element.content = content;
		document.getElementById(element.id + '_contents').innerHTML = content;
	}
	else
	{
		this.content = content;
		document.getElementById(this.id + '_contents').innerHTML = content;
	}
};
