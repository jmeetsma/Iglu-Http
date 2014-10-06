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

function FrameSettings(id, width, height, stickToWindowHeightMinus, source, hasHeader, title) {
	this.id = id;
	this.width = width;
	this.height = height;
	this.stickToWindowHeightMinus; //height is related to window height and resizes accordingly
	this.source = source;
	this.source_load_action = 'display';
}


function FrameWidget(id, content, settings) {
	this.id = id;
	if(typeof settings == 'undefined') {
		settings = new Object();
		settings.id = id;
	}
	this.constructFrameWidget(settings, content);
}

subclass(FrameWidget, Widget);

FrameWidget.prototype.constructFrameWidget = function(settings, content) {
	this.constructWidget(settings, content);

	this.id = settings.id;

	if(typeof settings.stickToWindowHeightMinus != 'undefined') {
		this.stickToWindowHeightMinus = settings.stickToWindowHeightMinus;
	}

	this.resizeDirections = '';

	if(typeof settings.height != 'undefined') {
		this.height = settings.height;
	} else {
		this.height = null;
	}
	if(typeof settings.width != 'undefined') {
		this.width = settings.width;
	} else {
		this.width = null;
	}
	//TODO use
	if(typeof settings.source != 'undefined') {
		this.source = settings.source;
	} else {
		this.source = null;
	}
	if(typeof settings.source_load_action != 'undefined' && settings.source_load_action != null) {
		this.source_load_action = settings.source_load_action;
	} else {
		if(typeof this.source_load_action == 'undefined') {
			this.source_load_action = 'display';
		 }
	}
	log('source load action of ' + this.id  + ' is ' + this.source_load_action);
	if(typeof content != 'undefined') {
		this.content = content;
	} else {
		this.content = 'loading...';
	}
	this.positionListener = null;
	this.panelContentClass = null;
};


FrameWidget.prototype.allowsResize = function(direction)
{
	return this.resizeDirections.indexOf(direction) != -1;
};



FrameWidget.prototype.setPosition = function(x, y)
{
	this.top = y;
	this.left = x;
	this.refreshElementPosition();
}


FrameWidget.prototype.move = function(x, y)
{
	this.top += y;
	this.left += x;
	this.refreshElementPosition();
}

FrameWidget.prototype.refreshElementPosition = function()
{
	WidgetManager.instance.lastX = this.left;
	WidgetManager.instance.lastY = this.top;

	if(typeof this.element != 'undefined')
	{
		this.element.style.top = this.top + 'px';
		this.element.style.left = this.left + 'px';
	}
}

FrameWidget.prototype.getDragSelectElement = function()
{
	return this.dragActivationElement;
};


FrameWidget.prototype.allowHorizontalResize = function() {
	if(this.resizeDirections.indexOf('e') == -1) {
		this.resizeDirections += 'e';
	}
};

FrameWidget.prototype.allowVerticalResize = function() {
	if(this.resizeDirections.indexOf('s') == -1) {
		this.resizeDirections += 's';
	}
};


FrameWidget.prototype.draw = function(left, top) {

	if(typeof left != 'undefined') {
		this.left = left;
	}
	if(typeof top != 'undefined') {
		this.top = top;
	}

	if(this.element != null) {
		this.element.style.visibility = 'hidden';
		this.element.className = this.cssClassName;
		this.setSizeAndPosition();
		this.writeHTML();
		this.element.style.visibility = 'visible';
	}
};


FrameWidget.prototype.setSizeAndPosition = function() {

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
	}
};


FrameWidget.prototype.getHeight = function()
{
	return this.height;
};


FrameWidget.prototype.getWidth = function()
{
	return this.width;
};



FrameWidget.prototype.resizeNorth = function(offset)
{
	//TODO use constants
	var newHeight = offset + this.height;
	if(newHeight < 20) {
		newHeight = 20;
	}
	this.top = this.top + this.height - newHeight;
	this.height = newHeight;
	//widgetmanager.mouseOffset.y -= offset;

	this.setSizeAndPosition();
};

FrameWidget.prototype.resizeWest = function(offset)
{
	//TODO use constants
	var newWidth = offset + this.width;
	if(newWidth < 100) {
		newWidth = 100;
	}
	this.left = this.left + this.width - newWidth;
	this.width = newWidth;

	this.setSizeAndPosition();
};

FrameWidget.prototype.resizeSouth = function(offset)
{
	//TODO use constants
	var newHeight = offset + this.height;
	if(newHeight < 20) {
		newHeight = 20;
	}
	this.height = newHeight;
	widgetmanager.mouseOffset.y += offset;

	this.setSizeAndPosition();
};

FrameWidget.prototype.resizeEast = function(offset)
{
	//TODO use constants
	var newWidth = offset + this.width;
	if(newWidth < 100) {
		newWidth = 100;
	}
	this.width = newWidth;
	WidgetManager.instance.mouseOffset.x += offset;

	this.setSizeAndPosition();
};



FrameWidget.prototype.writeHTML = function() {

	if(this.container) {
		if((typeof this.content.writeHTML != 'undefined')) {
			this.content.writeHTML();
        } else {
			this.container.innerHTML = this.content;
		}
	}
};


FrameWidget.prototype.onDestroy = function() {
	//save state
};

FrameWidget.prototype.setPositionFromPage = function() {

	this.top = getElementPositionInPage(this.element).y;
	this.left = getElementPositionInPage(this.element).x;
}



FrameWidget.prototype.onDeploy = function() {
//	widgetmanager.registerDraggableWidget(this);

	this.setPositionFromPage();

	this.element.onmouseover = new Function('event', 'event.stopPropagation();');
	this.element.onmouseout = new Function('event', 'event.stopPropagation();');
	//this.container.onmousemove = new Function('event', 'event.stopPropagation();');

    if(typeof this.stickToWindowHeightMinus != 'undefined' && this.stickToWindowHeightMinus != null) {
		this.element.style.maxHeight = (document.documentElement.clientHeight - this.stickToWindowHeightMinus) + 'px';
		WidgetManager.instance.registerWindowResizeListener(this);
	}

    if(this.resizeDirections.length > 0) {
		WidgetManager.instance.registerResizeableWidget(this, this.resizeDirections);
	}

	if((typeof this.content.draw != 'undefined')) {

		WidgetManager.instance.deployWidgetInContainer(this.element, this.content);
	}


	//load state
	this.refresh();
};

FrameWidget.prototype.onWindowResizeEvent = function(event) {
    if(typeof this.stickToWindowHeightMinus != 'undefined' && this.stickToWindowHeightMinus != null) {
//    alert(this.id + ': ' + this.container.style.height + ' -> ' + (document.documentElement.clientHeight - this.stickToWindowHeightMinus) + 'px');
		this.container.style.maxHeight = (document.documentElement.clientHeight - this.stickToWindowHeightMinus) + 'px';
	}
}



FrameWidget.prototype.refresh = function() {
	//load state
	if(this.source != null) {

		ajaxRequestManager.doRequest(this.source, this[this.source_load_action], this);
	} else if(this.content != null) {
		this.writeHTML();
	}
};

/*WindowWidget.prototype.refresh = function() {
	//load state
	if(this.source != null) {
		ajaxRequestManager.doRequest(this.source, this.display, this);
	}

		//do not overwrites dragSelectionElement etc.
	else if(this.content != null && !this.content.onDeploy) {

     	this.contentElement.innerHTML = this.content;
    }
};*/


//todo rename to activate / deactivate

FrameWidget.prototype.onFocus = function() {
};

FrameWidget.prototype.onBlur = function() {
};

FrameWidget.prototype.setDOMElement = function(element)
{
	this.element = element; // how about coords (x, y) ?
	if(this.dragActivationElement == null)
	{
		this.dragActivationElement = element;
	}
};

