function PopupSettings(id, width, height, stickToWindowHeightMinus, source, hasHeader, title) {

	this.id = id;
	this.width = width;
	this.height = height;
	this.stickToWindowHeightMinus;
	this.source = source;
	this.source_load_action = 'display';
	this.hasHeader = hasHeader;
	this.title = title;
}


function PopupWidget(settings, content, triggerElement) {
	this.cssClassName = 'popup';
	this.height = 100;
	this.width = 200;
	this.top = 100;
	this.left = 100;

	this.triggerElement = triggerElement;

	settings.id = triggerElement.id + '_popup';

	this.constructPopupWidget(settings, content);
}

subclass(PopupWidget, FrameWidget);

PopupWidget.prototype.constructPopupWidget = function(settings, content) {

	//invoke super
	this.constructFrameWidget(settings, content);

	if(typeof settings.stickToWindowHeightMinus != 'undefined') {
		this.stickToWindowHeightMinus = settings.stickToWindowHeightMinus;
	}

	this.resizeDirections = '';

	if(typeof settings.hasHeader != 'undefined') {
		this.hasHeader = settings.hasHeader;
	} else {
		this.hasHeader = false;
	}
	if(typeof settings.title != 'undefined') {
		this.title = settings.title;
	} else {
		this.title = '';
	}
};



PopupWidget.prototype.onDestroy = function() {
	WidgetManager.instance.destroyWidget(this.content.id);
};


PopupWidget.prototype.setSizeAndPosition = function() {
	this.element.style.top = this.top + 'px';
	this.element.style.left = this.left + 'px';
}

PopupWidget.prototype.onDeploy = function() {

	this.draw();


	this.setSizeAndPosition();

	this.content.refresh();

	WidgetManager.instance.registerPopupWidget(this);

};


PopupWidget.prototype.writeHTML = function() {

	this.element.className = 'popup';
	this.element.style.zIndex = WidgetManager.instance.currentZIndex++;
	this.element.style.position = 'absolute';
//	this.element.style.top = this.top + 'px';
//	this.element.style.left = this.left + 'px';
	this.element.style.top = '10px';
	this.element.style.left = '10px';


	//this.setPositionFromPage();


	if(this.hasHeader) {
		this.header = document.createElement('div');
		this.header.id = this.id + '_header';
		this.header.className = 'popupheader';
		this.header.innerHTML = this.title;
		this.element.appendChild(this.header);
	}

    //TODO new content widget

/*
	this.container = document.createElement('div');
	this.container.id = this.id + '_contents';
	this.container.className = 'panelcontents' + (this.panelContentClass != null ? ', ' + this.panelContentClass : '');
	this.container.onmouseover = new Function('event', 'event.stopPropagation();');
	this.container.onmouseout = new Function('event', 'event.stopPropagation();');

	this.element.appendChild(this.container);
*/


/*    if(typeof this.stickToWindowHeightMinus != 'undefined' && this.stickToWindowHeightMinus != null) {
		this.container.style.maxHeight = (document.documentElement.clientHeight - this.stickToWindowHeightMinus) + 'px';
	//	widgetmanager.registerWindowResizeListener(this);
	}
  */

	if((typeof this.content.draw != 'undefined')) {
		WidgetManager.instance.deployWidgetInContainer(this.element, this.content);

	} else {
		WidgetManager.instance.deployWidgetInContainer(this.element, this.content);
	}



	//load state
//	this.refresh();
};


//todo rename to activate / deactivate

PopupWidget.prototype.onFocus = function() {
};

PopupWidget.prototype.onBlur = function() {
};


