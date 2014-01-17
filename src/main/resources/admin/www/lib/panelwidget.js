function PanelSettings(id, width, height, stickToWindowHeightMinus, source) {
	this.id = id;
	this.width = width;
	this.height = height;
	this.stickToWindowHeightMinus;
	this.source = source;
}


function PanelWidget(settings, content) {
//	this.element = containerElement;
	this.id = settings.id;

	if(typeof settings.stickToWindowHeightMinus != 'undefined') {
		this.stickToWindowHeightMinus = settings.stickToWindowHeightMinus;
	}

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
	this.positionListener = null;
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
		this.element.style.whiteSpace = 'nowrap';
     }
	if(typeof this.height != 'undefined' && this.allowsResize('s')) {
		this.element.style.height = this.height + 'px';
	} else {
		this.element.style.display = 'table-cell';
		this.element.style.whiteSpace = 'nowrap';
	}
	if(this.positionListener != null && typeof(this.positionListener.onPanelPositionChanged) == 'function') {
		this.positionListener.onPanelPositionChanged(this);
	}};


PanelWidget.prototype.writeHTML = function() {

	if(this.container) {
		if((typeof this.content.writeHTML != 'undefined')) {
			this.content.writeHTML();
        } else {
			this.container.innerHTML = this.content;
		}
	}
};


PanelWidget.prototype.onDestroy = function() {
	//save state
};

PanelWidget.prototype.setPositionFromPage = function() {

	this.top = getElementPositionInPage(this.element).y;
	this.left = getElementPositionInPage(this.element).x;
}



PanelWidget.prototype.onDeploy = function() {
//	widgetengine.registerDraggableWidget(this);

	this.setPositionFromPage();


	this.container = document.createElement('div');
	this.container.id = this.id + '_contents';
	this.container.className = 'panelcontents';
	this.element.appendChild(this.container);



    if(typeof this.stickToWindowHeightMinus != 'undefined' && this.stickToWindowHeightMinus != null) {
		this.container.style.maxHeight = (document.documentElement.clientHeight - this.stickToWindowHeightMinus) + 'px';
		widgetengine.registerWindowResizeListener(this);
	}

    if(this.resizeDirections.length > 0) {
		widgetengine.registerResizeableWidget(this, this.resizeDirections);
	}

	if((typeof this.content.writeHTML != 'undefined')) {

		widgetengine.deployWidgetInContainer(this.container, this.content);
	}


	//load state
	this.refresh();
};

PanelWidget.prototype.onWindowResizeEvent = function(event) {
    if(typeof this.stickToWindowHeightMinus != 'undefined' && this.stickToWindowHeightMinus != null) {
		this.container.style.maxHeight = (document.documentElement.clientHeight - this.stickToWindowHeightMinus) + 'px';
	}
}



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
		document.getElementById(element.id).innerHTML = content;
	}
	else
	{
		this.content = content;
		document.getElementById(this.id).innerHTML = content;
	}
};
