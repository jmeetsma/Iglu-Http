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
	this.top = top;
	this.left = left;
	this.source = source;
	this.source_load_action = 'display';
}


function FrameWidget(settings, content) {
	this.constructFrameWidget(settings, content);
}

FrameWidget.MINIMUM_FRAME_WIDTH = 100;
FrameWidget.MINIMUM_FRAME_HEIGHT = 20;

subclass(FrameWidget, Widget);

FrameWidget.prototype.constructFrameWidget = function(settings, content) {
   	this.sizeAndPositionListeners = new Array();
   	//other widgets may resize or move if current widget resizes or moves

	this.constructWidget(settings, content);
	this.ignoresPageScroll = false;
	this.resizeDirections = '';

	if(typeof settings.cssClassName != 'undefined') {
		this.cssClassName = settings.cssClassName;
	} else {
		this.cssClassName = null;
	}
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
    var scrollPos = getScrollOffset();
	if(typeof settings.top != 'undefined') {
		this.top = settings.top;
		if(this.ignoresPageScroll) { //TODO display: fixed
        	this.top = this.top + scrollPos.y;
        }
	} else {
		this.top = null;
	}
	if(typeof settings.left != 'undefined') {
		this.left = settings.left;
		if(this.ignoresPageScroll) { //TODO display: fixed
        	this.left = this.left + scrollPos.x;
        }
	} else {
		this.left = null;
	}

	//TODO use ContentWidget
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
};

FrameWidget.prototype.addSizeAndPositionListener = function(widget, actionsByDirection, invertOffset) {

	var listenerData = this.sizeAndPositionListeners[widget.id];
	if(typeof listenerData == 'undefined' || listenerData == null) {
		listenerData = new Object();
		listenerData.actionsByDirection = new Object();
	}
	listenerData.widget = widget;
	for(var direction in actionsByDirection) {
		listenerData.actionsByDirection[direction] = actionsByDirection[direction];
	}
	this.sizeAndPositionListeners[widget.id] = listenerData;
};

FrameWidget.prototype.notifySizeAndPositionListeners = function(direction, offSet) {
	for(var widgetId in this.sizeAndPositionListeners) {
		var listenerData = this.sizeAndPositionListeners[widgetId];
		var actionData = listenerData.actionsByDirection[direction];
		if(typeof actionData != 'undefined') {
			//log('also resizing ' + widgetId + ' ' + direction + ':' + offSet);
			actionData.action.call(listenerData.widget, actionData.factor * offSet);
		}
	}
};

FrameWidget.prototype.addWidgetToAlignTo = function(widget) {
	return this.resizeDirections.indexOf(direction) != -1;
};


FrameWidget.prototype.allowsResize = function(direction) {
	return this.resizeDirections.indexOf(direction) != -1;
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

FrameWidget.prototype.getHeight = function() {
	return this.height;
};

FrameWidget.prototype.getWidth = function() {
	return this.width;
};

FrameWidget.prototype.draw = function() {

	if(this.element != null) {
		this.element.style.visibility = 'hidden';
		this.element.className = this.cssClassName;
		this.setSizeAndPosition();
		this.writeHTML();
		this.element.style.visibility = 'visible';
	}
};


FrameWidget.prototype.setSizeAndPosition = function() {

	if(this.top != null) {
		this.element.style.top = this.top + 'px';
	}
	if(this.left != null) {
		this.element.style.left = this.left + 'px';
	}
	if(this.width != null) {
		this.element.style.width = this.width + 'px';
	}
	if(this.height != null) {
		this.element.style.height = this.height + 'px';
	}
	if(this.positionListener != null && typeof(this.positionListener.onPanelPositionChanged) == 'function') {
		this.positionListener.onPanelPositionChanged(this);
	}
};

FrameWidget.prototype.setPosition = function(left, top) {
	//TODO calculate offsets
	this.top = top;
	this.left = left;
	this.setSizeAndPosition();
}


FrameWidget.prototype.moveVertical = function(offset) {
	this.top += offset;
	this.setSizeAndPosition();
}


FrameWidget.prototype.moveHorizontal = function(offset) {
	this.left += offset;
	this.setSizeAndPosition();
}


FrameWidget.prototype.move = function(left, top) {
	this.top += top;
	this.left += left;
	this.setSizeAndPosition();
}


FrameWidget.prototype.resizeNorth = function(offset) {
	var newHeight = offset + this.height;
	if(newHeight < FrameWidget.MINIMUM_FRAME_HEIGHT) {
		newHeight = FrameWidget.MINIMUM_FRAME_HEIGHT;
	}
	this.top = this.top + this.height - newHeight;
	this.height = newHeight;
	this.setSizeAndPosition();

	this.notifySizeAndPositionListeners('n', offset);
};

FrameWidget.prototype.resizeWest = function(offset) {
	var newWidth = offset + this.width;
	if(newWidth < FrameWidget.MINIMUM_FRAME_WIDTH) {
		newWidth = FrameWidget.MINIMUM_FRAME_WIDTH;
	}
	this.left = this.left + this.width - newWidth;
	this.width = newWidth;
	this.setSizeAndPosition();
	this.notifySizeAndPositionListeners('w', offset);
};

FrameWidget.prototype.resizeSouth = function(offset) {
	var newHeight = offset + this.height;
	if(newHeight < FrameWidget.MINIMUM_FRAME_HEIGHT) {
		newHeight = FrameWidget.MINIMUM_FRAME_HEIGHT;
	}
	this.height = newHeight;
	this.setSizeAndPosition();
	this.notifySizeAndPositionListeners('s', offset);
};

FrameWidget.prototype.resizeEast = function(offset) {
	var newWidth = offset + this.width;
	if(newWidth < FrameWidget.MINIMUM_FRAME_WIDTH) {
		newWidth = FrameWidget.MINIMUM_FRAME_WIDTH;
	}
	this.width = newWidth;
	this.setSizeAndPosition();
	this.notifySizeAndPositionListeners('e', offset);
};


FrameWidget.prototype.onDestroy = function() {
	//save state
};

FrameWidget.prototype.setPositionFromPage = function() {
	var elementPosition = getElementPositionInPage(this.element);
	this.top = elementPosition.y;
	this.left = elementPosition.x;
}

FrameWidget.prototype.setDOMElement = function(element) {
	this.element = element;
	if(this.cssClassName != null) {
		element.className = this.cssClassName;
	}
	if(this.top != null) {
		element.style.top = this.top;
	}
	if(this.left != null) {
		element.style.left = this.left;
	}
	if(this.width != null) {
		element.style.width = this.width;
	}
	if(this.height != null) {
		element.style.height = this.height;
	}
	element.style.position = 'absolute';
};



FrameWidget.prototype.onDeploy = function() {

	this.draw();

	//TODO probably only necessary if position unknown
	this.setPositionFromPage();

	this.element.onmouseover = new Function('event', 'event.stopPropagation();');
	this.element.onmouseout = new Function('event', 'event.stopPropagation();');
	//this.element.onmousemove = new Function('event', 'event.stopPropagation();');

/*    if(typeof this.stickToWindowHeightMinus != 'undefined' && this.stickToWindowHeightMinus != null) {
		this.element.style.maxHeight = (document.documentElement.clientHeight - this.stickToWindowHeightMinus) + 'px';
		WidgetManager.instance.registerWindowResizeListener(this);
	} */

    if(this.resizeDirections.length > 0) {
		WidgetManager.instance.registerResizeableWidget(this, this.resizeDirections);

	}

	if((typeof this.content.onDeploy != 'undefined')) {

		WidgetManager.instance.deployWidgetInContainer(this.element, this.content);
	}


	//load state
	this.refresh();
};

/*FrameWidget.prototype.onWindowResizeEvent = function(event) {
    if(typeof this.stickToWindowHeightMinus != 'undefined' && this.stickToWindowHeightMinus != null) {
//    alert(this.id + ': ' + this.container.style.height + ' -> ' + (document.documentElement.clientHeight - this.stickToWindowHeightMinus) + 'px');
		this.container.style.maxHeight = (document.documentElement.clientHeight - this.stickToWindowHeightMinus) + 'px';
	}
} */



FrameWidget.prototype.refresh = function() {
	//load state
	if(this.source != null) {
		ajaxRequestManager.doRequest(this.source, this[this.source_load_action], this);
	} else if(this.content != null) {
		this.writeHTML();
	}
};



//todo rename to activate / deactivate

FrameWidget.prototype.writeHTML = function() {
};

FrameWidget.prototype.onFocus = function() {
};

FrameWidget.prototype.onBlur = function() {
};

