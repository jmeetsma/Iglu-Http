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



function FrameWidget(settings, enclosedWidget) {
	this.constructFrameWidget(settings, enclosedWidget);
}

FrameWidget.MINIMUM_FRAME_WIDTH = 100;
FrameWidget.MINIMUM_FRAME_HEIGHT = 20;

subclass(FrameWidget, Widget);

FrameWidget.prototype.constructFrameWidget = function(settings, enclosedWidget) {

	//TODO a frame may not exceed the limits of the master frame

	//declare attributes
	this.width = null;
	this.height = null;
	this.top = null;
	this.left = null;

	this.innerContainer;

	this.offsetOverFlowLeft = 0;
	this.offsetOverFlowTop = 0;

	this.content = null;//TODO enclosedWidget

	this.ignoresPageScroll = false;
	this.resizeDirections = '';

   	//other widgets may resize or move if current widget resizes or moves
   	this.sizeAndPositionListeners = new Array();

	this.positionListener = null;

	if(typeof enclosedWidget != 'undefined' && !enclosedWidget.onDeploy) {
		throw 'content must be of type widget';
	}

	this.set('content', enclosedWidget);
	//invoke super
	this.constructWidget(settings, enclosedWidget);

    var scrollPos = getScrollOffset();
	if(this.top != null && this.ignoresPageScroll) { //TODO display: fixed
        this.top = this.top + scrollPos.y;
	}
	if(this.left != null && this.ignoresPageScroll) { //TODO display: fixed
        this.left = this.left + scrollPos.x;
	}

	this.outerWidgetsToStretchTo = new Object();
	this.outerWidgetsToAlignWith = new Object();

	this.subWidgets = new Object();
};

FrameWidget.prototype.addResizeListener = function(widget, actionsByDirection, invertOffset) {

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

FrameWidget.prototype.notifyResizeListeners = function(direction, offSet) {
	for(var widgetId in this.sizeAndPositionListeners) {
		var listenerData = this.sizeAndPositionListeners[widgetId];
		var actionData = listenerData.actionsByDirection[direction];
		if(typeof actionData != 'undefined') {
			log('' + this.id + ' triggers resize of ' + widgetId + ' ' + direction + ':' + offSet);
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

	this.notifyResizeListeners('n', offset);
};

FrameWidget.prototype.resizeEast = function(offset) {

//	log('' + this.id + ' OFL: ' + this.offsetOverFlowLeft);

//	var oldWidth = this.width;
	var calcOffset = offset + this.offsetOverFlowLeft;

	var newWidth = calcOffset + this.width;
	if(newWidth < FrameWidget.MINIMUM_FRAME_WIDTH) {
		this.width = FrameWidget.MINIMUM_FRAME_WIDTH;
		this.offsetOverFlowLeft = newWidth - this.width;
	} else {
		this.width = newWidth;
		this.offsetOverFlowLeft = 0;
	}
	offset = this.notifyResizeListeners('e', offset);
	this.setSizeAndPosition();
//	return this.width - oldWidth;
};

FrameWidget.prototype.resizeWest = function(offset) {

	var calcOffset = offset + this.offsetOverFlowLeft;

	var newWidth = calcOffset + this.width;
	if(newWidth < FrameWidget.MINIMUM_FRAME_WIDTH) {
		this.left = this.left + this.width - FrameWidget.MINIMUM_FRAME_WIDTH;
		this.width = FrameWidget.MINIMUM_FRAME_WIDTH;
		this.offsetOverFlowLeft = newWidth - this.width;
	} else {
		this.left = this.left + this.width - newWidth;
		this.width = newWidth;
		this.offsetOverFlowLeft = 0;
	}
	offset = this.notifyResizeListeners('e', offset);
	this.setSizeAndPosition();

/*	var calcOffset = offset + this.offsetOverFlowLeft;
	var newWidth = offset + this.width;
	if(newWidth < FrameWidget.MINIMUM_FRAME_WIDTH) {
		newWidth = FrameWidget.MINIMUM_FRAME_WIDTH;
	}
	this.left = this.left + this.width - newWidth;
	this.width = newWidth;
	this.setSizeAndPosition();
	this.notifyResizeListeners('w', offset);
	*/
};

FrameWidget.prototype.resizeSouth = function(offset) {
	var calcOffset = offset + this.offsetOverFlowTop;

	var newHeight = calcOffset + this.height;
	if(newHeight < FrameWidget.MINIMUM_FRAME_HEIGHT) {
		this.height = FrameWidget.MINIMUM_FRAME_HEIGHT;
		this.offsetOverFlowTop = newHeight - this.height;
	} else {
		this.height = newHeight;
		this.offsetOverFlowTop = 0;
	}
	this.setSizeAndPosition();
	this.notifyResizeListeners('s', offset);
};

FrameWidget.prototype.onDestroy = function() {
	//save state
};

FrameWidget.prototype.setPositionFromPage = function() {
//	var elementPosition = getElementPositionInPage(this.element);
//	this.top = elementPosition.y;
//	this.left = elementPosition.x;
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
	element.style.padding = '0px';
	element.style.margin = '0px';

/*	this.innerContainer = document.createElement('div');
	this.innerContainer.style.position = 'relative';
	this.innerContainer.style.margin = '0';
	this.innerContainer.style.padding = '0';
	this.element.appendChild(this.innerContainer);         */


};

FrameWidget.prototype.stretchToOuterWidget = function(outerWidget, directionMap) {

	var currentDirectionMap = this.outerWidgetsToStretchTo[outerWidget.id];
	if(typeof currentDirectionMap == 'undefined') {
		currentDirectionMap = new Object();
		this.outerWidgetsToStretchTo[outerWidget.id] = currentDirectionMap;
	}
	if(typeof directionMap['e'] != 'undefined') {
		currentDirectionMap['e'] = directionMap['e'];
	}
	if(typeof directionMap['s'] != 'undefined') {
		currentDirectionMap['s'] = directionMap['s'];
	}
}


FrameWidget.prototype.alignWithOuterWidget = function(outerWidget, directionMap) {
	if(typeof directionMap['e'] != 'undefined') {
		this.left = outerWidget.left + outerWidget.width - this.width - directionMap['e'].offset;
        outerWidget.addResizeListener(this, {'e':{'action':this.moveHorizontal, factor: 1}});
	}
	if(typeof directionMap['s'] != 'undefined') {
		this.top = outerWidget.top + outerWidget.height - this.height - directionMap['s'].offset;
        outerWidget.addResizeListener(this, {'s':{'action':this.moveVertical, factor: 1}});
	}
}


FrameWidget.prototype.onDeploy = function() {

	this.draw();
	this.doStretchToOuterWidget();
	this.setSizeAndPosition();



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

	for(containerId in this.subWidgets) {
		//alert('CONTAINER ID: ' + containerId);
		WidgetManager.instance.deployWidgetInContainer(document.getElementById(containerId), this.subWidgets[containerId]);
	}

	if(this.content && this.content.onDeploy != 'undefined') {
//	    alert('DEPLOYING ' + this.content.content);
		WidgetManager.instance.deployWidgetInContainer(this.element, this.content);
	}


	//load state
//	this.refresh();
};

/*FrameWidget.prototype.onWindowResizeEvent = function(event) {
    if(typeof this.stickToWindowHeightMinus != 'undefined' && this.stickToWindowHeightMinus != null) {
//    alert(this.id + ': ' + this.container.style.height + ' -> ' + (document.documentElement.clientHeight - this.stickToWindowHeightMinus) + 'px');
		this.container.style.maxHeight = (document.documentElement.clientHeight - this.stickToWindowHeightMinus) + 'px';
	}
} */


FrameWidget.prototype.doStretchToOuterWidget = function() {

	for(var outerWidgetId in this.outerWidgetsToStretchTo) {

		var directionMap = this.outerWidgetsToStretchTo[outerWidgetId];
		var outerWidget = WidgetManager.instance.getWidget(outerWidgetId);

		var outerWidgetPosition = getElementPositionInPage(outerWidget.element);
		var widgetPosition = getElementPositionInPage(this.element);

		if(typeof directionMap['e'] != 'undefined') {

			var proposedWidth = outerWidgetPosition.x + outerWidget.width - widgetPosition.x - directionMap['e'].offset;
			if(proposedWidth < FrameWidget.MINIMUM_FRAME_WIDTH) {
				this.width = FrameWidget.MINIMUM_FRAME_WIDTH;
				this.offsetOverFlowLeft = proposedWidth - this.width;
			} else {
				this.width = proposedWidth;
			}
			outerWidget.addResizeListener(this, {'e':{'action':this.resizeEast, factor: 1}});
		}
		if(typeof directionMap['s'] != 'undefined') {
			var proposedHeight = outerWidgetPosition.y + outerWidget.height - widgetPosition.y - directionMap['s'].offset;
			if(proposedHeight < FrameWidget.MINIMUM_FRAME_HEIGHT) {
				this.height = FrameWidget.MINIMUM_FRAME_HEIGHT;
				this.offsetOverFlowTop = proposedHeight - this.height;
			} else {
				this.height = proposedHeight;
			}
			outerWidget.addResizeListener(this, {'s':{'action':this.resizeSouth, factor: 1}});
		}
	}
}

FrameWidget.prototype.refresh = function() {
/*	//load state
	if(this.source != null) {
		ajaxRequestManager.doRequest(this.source, this[this.source_load_action], this);
	} else if(this.content != null) {
		this.writeHTML();
	} */
};




//todo rename to activate / deactivate

FrameWidget.prototype.writeHTML = function() {
};

FrameWidget.prototype.onFocus = function() {
};

FrameWidget.prototype.onBlur = function() {
};

