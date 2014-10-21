

function PopupWidget(settings, content, triggerElement) {
	this.cssClassName = 'popup';
	this.height = 100;
	this.width = 200;
//	this.top = 100;
//	this.left = 100;

	//TODO position inside master frame


	//settings.id = triggerElement.id + '_popup';

	this.constructPopupWidget(settings, content, triggerElement);
}

PopupWidget.count = 0;

subclass(PopupWidget, FrameWidget);

PopupWidget.prototype.constructPopupWidget = function(settings, content, triggerElement) {

	this.triggerElement = null;
	this.timeout = 1000;

	if(typeof triggerElement != 'undefined') {
		var elementId = '' + triggerElement.id;
		if(elementId == 'undefined') {
			elementId = 'popup_' + (PopupWidget.count++);
			triggerElement.id = elementId;
		}
		var coords = getElementPositionInWindow(triggerElement);
		settings.top = coords.y + 10;
		settings.left = coords.x + 20;
		this.triggerElement = triggerElement;
	} else {
		elementId = 'popup_' + (PopupWidget.count++);
	}

	settings.id = elementId + '_popup';
	content.id = elementId + "_popup_contents";

	this.constructFrameWidget(settings, content);

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



/*PopupWidget.prototype.onDestroy = function() {
	WidgetManager.instance.destroyWidget(this.content.id);
};*/


/*PopupWidget.prototype.setSizeAndPosition = function() {
	this.element.style.top = this.top + 'px';
	this.element.style.left = this.left + 'px';
} */

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

	WidgetManager.instance.deployWidgetInContainer(this.element, this.content);


	//load state
//	this.refresh();
};

