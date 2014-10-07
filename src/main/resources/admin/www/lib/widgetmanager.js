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


/*
Widget
|_______________
|               |
|               WidgetContent
FrameWidget
|_______________ ___________________________________ ___________________________
|               |               |                   |                           |
PanelWidget     WindowWidget    LogStreamWidget     SplitPanelWidget            MenuWidget
                                                    |___________________________
                                                    |							|
                                                    HorizontalSplitPanelWidget  VerticalSplitpanelWidget
*/
/*
 * Keeps track of lots of different kinds of widgets.
 * It keeps order, facilitates focus, dragging, ignoring scrolling etc.
 *
 */
function WidgetManager() {
	this.resizeDirection = null;
	this.resizingWidget = null;

	this.draggedWidget = null;
	this.mouseOffset = null;

	this.draggableWidgets = new Array();
	this.resizeableWidgets = new Array();
	this.popupWidgets = new Array();

	this.currentZIndex = 100;
	this.widgets = new Array();
	this.initFunctions = new Array();

	this.currentWidget = null;

	this.lastX = 0;
	this.lastY = 0;

	this.resizeListeners = new Array();
    window.onresize = this.notifyWindowResizeListeners;


	this.timerListeners = new Array();
	this.FRAME_RATE = 50; // / sec
	this.TIMER_INTERVAL = 1000 / this.FRAME_RATE;

	this.settings = new Object();

}



WidgetManager.prototype.registerInitFunction = function(initFunction) {
	this.initFunctions[this.initFunctions.length] = initFunction;
}


WidgetManager.prototype.init = function() {

	document.onmouseup = dropWidget;
	document.onmousemove = dragWidget;
	window.onscroll = scroll;

	for(i = 0; i < this.initFunctions.length; i++) {
		this.initFunctions[i]();
	}
}

WidgetManager.prototype.notifyWindowResizeListeners = function(event) {

	//alert('resize ' + widgetmanager.resizeListeners.length);

	for(var i in widgetmanager.resizeListeners) {
		widgetmanager.resizeListeners[i].onWindowResizeEvent(event);
	}

}

WidgetManager.prototype.registerWindowResizeListener = function(listener) {
	this.resizeListeners[this.resizeListeners.length] = listener;
}


WidgetManager.prototype.registerTimerListener = function(listener, frameRate) {

	listener.frameRate = frameRate;
	listener.eventInterval = Math.round(this.FRAME_RATE / frameRate);
	log('registering timer listener ' + listener.id + ' with event interval ' + listener.eventInterval);
	listener.eventIntervalCountdown = listener.eventInterval;
	listener.timerIndex = this.timerListeners.length;
	this.timerListeners[this.timerListeners.length] = listener;
	log('current number of timer listeners: ' + this.timerListeners.length);
	if(this.timerListeners.length == 1) {
		log('starting timer');
    	setTimeout('WidgetManager.instance.tick();', this.TIMER_INTERVAL);
	}
}

WidgetManager.prototype.unregisterTimerListener = function(listener) {

	log('unregistering timer listener ' + listener.id);
	this.timerListeners.splice(listener.timerIndex,1);
}

WidgetManager.prototype.tick = function() {
	if(this.timerListeners.length > 0) {
    	setTimeout('WidgetManager.instance.tick();', this.TIMER_INTERVAL);
    } else {
   		log('stopping timer');
	}
	for(var i in this.timerListeners) {
		 if(this.timerListeners[i].eventIntervalCountdown-- <= 0) {
//			log('notifying ' + this.timerListeners[i].id);
			this.timerListeners[i].eventIntervalCountdown = this.timerListeners[i].eventInterval;
			this.timerListeners[i].onTimer();
		}
	}

}


function dropWidget(event) {
	widgetmanager.draggedWidget = null;
	widgetmanager.resizingWidget = null;
	document.body.style.cursor = 'auto';
}



function dragWidget(event) {

	event = event || window.event;
	if(widgetmanager.resizingWidget != null && widgetmanager.resizeDirection != null) {
		var mousePos = getMousePositionInWindow(event);
		if(widgetmanager.resizeDirection.indexOf('n') > -1) {
			widgetmanager.resizingWidget.resizeNorth(-1 * (mousePos.y - widgetmanager.mouseOffset.y - widgetmanager.resizingWidget.top));
		}
		if(widgetmanager.resizeDirection.indexOf('s') > -1) {
			widgetmanager.resizingWidget.resizeSouth(mousePos.y - widgetmanager.mouseOffset.y - widgetmanager.resizingWidget.top);
		}
		if(widgetmanager.resizeDirection.indexOf('w') > -1) {
			widgetmanager.resizingWidget.resizeWest(-1 * (mousePos.x - widgetmanager.mouseOffset.x - widgetmanager.resizingWidget.left));
		}
		if(widgetmanager.resizeDirection.indexOf('e') > -1) {
			widgetmanager.resizingWidget.resizeEast(mousePos.x - widgetmanager.mouseOffset.x - widgetmanager.resizingWidget.left);
		}
	} else if(widgetmanager.draggedWidget != null) {
		var mousePos = getMousePositionInWindow(event);
		widgetmanager.draggedWidget.setPosition(mousePos.x - widgetmanager.mouseOffset.x, mousePos.y - widgetmanager.mouseOffset.y);
	}
}

/**
 *
 *
 */
WidgetManager.prototype.registerDraggableWidget = function(widget)
{
	//administrate order
	this.draggableWidgets[widget.getDragSelectElement().id] = widget;

	widget.isDraggable = true;
	widget.getDragSelectElement().onmousedown = function(event)
	{
		if(widgetmanager.resizingWidget == null) {
			var draggableWidget = widgetmanager.draggableWidgets[this.id];
			WidgetManager.instance.draggedWidget = draggableWidget;
			WidgetManager.instance.mouseOffset = getMouseOffsetFromElementPosition(this, event);
		} else {

		}
	}
	widget.getDragSelectElement().onmouseover = function(event) {
		if(WidgetManager.instance.resizingWidget == null) {
			document.body.style.cursor = 'move';
		}
	}

	widget.getDragSelectElement().onmousemove = function(event) {
		if(WidgetManager.instance.resizingWidget == null) {
			document.body.style.cursor = 'move';
		}
	}
	widget.getDragSelectElement().onmouseout = function(event) {
		if(WidgetManager.instance.resizingWidget == null && widgetmanager.draggedWidget == null) {
			document.body.style.cursor = 'auto';
		}
	}
	widget.getDOMElement().onmousedown = function(event)
	{
		WidgetManager.instance.activateCurrentWidget(this.id);
	}

	this.activateCurrentWidget(widget);
}


WidgetManager.prototype.unregisterDraggableWidget = function(widget) {
	if(typeof widget.getDragSelectElement != 'undefined') {
		var draggableElement = widget.getDragSelectElement();
		if(draggableElement != null) {
			this.draggableWidgets[draggableElement.id] = null;
		}
	}
}

WidgetManager.prototype.registerPopupWidget = function(widget) {
	widget.isPopup = true;
	widget.mouseOverTrigger = true;
	widget.mouseOverPopup = false;

	widget.triggerElement.onmouseout = function(event) {
		var widget = WidgetManager.instance.getWidget(this.id + '_popup');
		setTimeout('WidgetManager.instance.destroyPopup("' + this.id + '_popup")', 1000);
		widget.mouseOverTrigger = false;
	}
	widget.element.onmouseout = function(event) {
		setTimeout('WidgetManager.instance.destroyPopup("' + this.id + '")', 1000);
		widget.mouseOverPopup = false;
	}
	widget.element.onmouseover = function(event) {
		WidgetManager.instance.getWidget(this.id).mouseOverPopup = true;
		log('mouse over popup');
	}
	this.activateCurrentWidget(widget);
}

WidgetManager.prototype.destroyPopup = function(widgetId) {
	log('id ' + widgetId);
	var widget = WidgetManager.instance.getWidget(widgetId);
	if(widget != null && !widget.mouseOverPopup) {
		widget.triggerElement.onmouseout = null;
		WidgetManager.instance.destroyWidget(widgetId);
	}
}



/**
 *
 *
 */
WidgetManager.prototype.registerResizeableWidget = function(widget, resizeDirections) {

	this.resizeableWidgets[widget.id] = widget;

	if(resizeDirections != null) {
		widget.resizeDirections = resizeDirections;
	} else {
		widget.resizeDirections = 'nesw';//North - East - South - West
	}
	widget.getDOMElement().onmousedown = function(event) {
		 WidgetManager.instance.activateCurrentWidget(this.id);
		if(WidgetManager.instance.resizeDirection != null) {
			WidgetManager.instance.resizingWidget = WidgetManager.instance.currentWidget;
		}
	}

	widget.getDOMElement().onmouseover = function(event) {
		if(WidgetManager.instance.resizingWidget == null) {
			WidgetManager.instance.determineResizeAction(widget, event);
		}
	}

	widget.getDOMElement().onmouseout = function(event) {
		if( WidgetManager.instance.resizingWidget == null) {
			document.body.style.cursor = 'auto';
    	    WidgetManager.instance.resizeDirection = null;
		}
	}

}


WidgetManager.prototype.determineResizeAction = function(widget, event)
{
	if(this.draggedWidget == null) {
		this.mouseOffset = getMouseOffsetFromElementPosition(widget.getDOMElement(), event);
		var direction = '';
		if(widget.allowsResize('n') && this.mouseOffset.y < 5) {
			direction = 'n';
         }
		if(widget.allowsResize('s') && this.mouseOffset.y > widget.height - 5) {
			direction = 's';
        }
		if(widget.allowsResize('w') && this.mouseOffset.x < 5) {
			direction += 'w';
        }
		if(widget.allowsResize('e') && this.mouseOffset.x > widget.width - 5) {
			direction += 'e';
         }
         if(direction != '') {
         	document.body.style.cursor = direction + '-resize';
         	this.resizeDirection = direction;
         } else {
         	if(document.body.style.cursor != 'move' && this.resizingWidget == null) {
				document.body.style.cursor = 'auto';
			}
         	this.resizeDirection = null;
         }
	}
}


/**
 * Deactivates former focussed (draggable) widget and activates current.
 *
 */
WidgetManager.prototype.activateCurrentWidget = function(widgetId)
{

	window.status = 'activating ' + widgetId;
	if( this.currentWidget == null || this.currentWidget.id != widgetId) {
		if(this.currentWidget != null) {
			this.currentWidget.onBlur();
		}
		this.currentWidget = this.widgets[widgetId];
		if(this.currentWidget != null) {
			if(this.currentWidget.isDraggable || this.currentWidget.isPopup) {
				this.currentWidget.element.style.zIndex = WidgetManager.instance.currentZIndex++;
				log('widget "' + this.currentWidget.element.id + '" set to z-index ' + this.currentWidget.element.style.zIndex);
			}
			this.currentWidget.onFocus();
		}
	}
}



/////////////////////////
//                     //
//  Widget Management  //
//                     //
/////////////////////////

WidgetManager.prototype.widgetExists = function(widgetId) {
	return this.widgets[widgetId] != null;
}


WidgetManager.prototype.deployWidget = function(newWidget, x, y)
{
	return this.deployWidgetInContainer(document.body, newWidget, x, y);
}

WidgetManager.prototype.deployWidgetInContainer = function(container, newWidget, x, y) {
	var widget = this.widgets[newWidget.getId()];
	if(widget == null) {

		this.widgets[newWidget.getId()] = newWidget;
		var element = container;
		if(newWidget.getId() != container.id) {
			var element = document.getElementById(newWidget.getId());
			if(element == null) {
				element = document.createElement('div');
				//is this necessary?
				//use prefix 'widget_'
				element.setAttribute('id', newWidget.getId());
				container.appendChild(element);
			}
		}
		newWidget.containerElement = container;
		newWidget.setDOMElement(element);
		//newWidget.draw();
    	newWidget.onDeploy();
		log('widget "' + newWidget.getId() + '" deployed');
	} else {
		log('widget "' + widget.getId() + '" already exists');
		this.activateCurrentWidget(widget.id);
    	return widget;
	}
	this.activateCurrentWidget(newWidget.id);
	return newWidget;
}



WidgetManager.prototype.destroyWidget = function(widgetId) {
	var widget = this.widgets[widgetId];
	if(widget != null) {
		log('removing widget "' + widgetId + '"');
		//call widget destructor
		widget.onDestroy();
		var element = document.getElementById(widgetId);
		if(element != null) {
			try {
				widget.containerElement.removeChild(element);
			} catch(e) {
				log('ERROR while removing ' + element + ': ' + e.message);
			}
		}
		this.unregisterDraggableWidget(widget);
		this.widgets[widgetId] = null;
		log('done');
	} else {
		log('NOT removing unregistered widget "' + widgetId + '"');
	}
}




WidgetManager.prototype.getWidget = function(id) {
	return this.widgets[id];
}

WidgetManager.prototype.containsWidget = function(id) {
	log('containsWidget(' + id + ')' + this.widgets[id]);
	return this.widgets[id] != null;
}






///////////////////////
//                   //
//  Abstract Widget  //
//   (base class)    //
//                   //
///////////////////////

function Widget() {
	this.constructWidget();
}

Widget.prototype.constructWidget = function(settings, content) {
	if(typeof settings == 'undefined') {
        throw 'widget must have settings';
	}
	this.id = settings.id;
	if(typeof this.id == 'undefined') {
        throw 'widget must have an id';
	}
	this.source_load_action = 'display';
}


Widget.prototype.set = function(name, value, defaultValue) {
	if(typeof this[name] == 'undefined') {
		throw('attribute "' + name + '" is not declared in ' + this.constructor.name);
	} else if(typeof value != 'undefined') {
		this[name] = value;
	} else if(typeof defaultValue != 'undefined') {
		this[name] = defaultValue;
	}
};


Widget.prototype.getId = function()
{
	return this.id;
};



Widget.prototype.setDOMElement = function(element)
{
	this.element = element;
};


Widget.prototype.getDOMElement = function()
{
	return this.element;
};



Widget.prototype.onDestroy = function()
{
};


Widget.prototype.onDeploy = function()
{
};


Widget.prototype.refresh = function()
{
}

Widget.prototype.onFocus = function()
{
};


Widget.prototype.onBlur = function()
{
};

Widget.prototype.processJavaScript = function(input)
{

//	alert('processJavaScript:' + input);
	try
	{
		eval('' + input);
	}
	catch(e)
	{
		alert('Error: ' + e.message);
	}
};


Widget.prototype.saveState = function() //JSON?
{
};

Widget.prototype.display = function(content, element)
{
	if(element != null)
	{
		element.content = content; /// ???
		document.getElementById(element.id).innerHTML = content;
	}
	else
	{
		this.content = content;
		document.getElementById(this.id).innerHTML = content;
	}
};

Widget.prototype.evaluate = function(content, element)
{
	eval(content);
};


//TODO separate content (WidgetContent) from position and size (FrameWidget)

///////////////////////
//                   //
//   WidgetContent   //
//                   //
///////////////////////


function WidgetContentSettings(id, stickToWindowHeightMinus, source, hasHeader, title) {
	this.id = id;
	this.stickToWindowHeightMinus;
	this.source = source;
	this.source_load_action = 'display';
	this.hasHeader = hasHeader;
	this.title = title;
}

function WidgetContent(settings, content) {
	this.constructWidgetContent(settings, content);
}

subclass(WidgetContent, Widget);


WidgetContent.prototype.constructWidgetContent = function(settings, content) {

	//invoke super
	this.constructWidget(settings, content);


	if(typeof settings.stickToWindowHeightMinus != 'undefined') {
		this.stickToWindowHeightMinus = settings.stickToWindowHeightMinus;
	}

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

}



WidgetContent.prototype.onDestroy = function()
{
};


WidgetContent.prototype.onDeploy = function()
{
};


WidgetContent.prototype.refresh = function() {
	//load state

	//alert(this.source);

	if(this.source != null) {

		ajaxRequestManager.doRequest(this.source, this[this.source_load_action], this);
	} else if(this.content != null) {
		this.writeHTML();
	}
};


WidgetContent.prototype.onFocus = function()
{
};


WidgetContent.prototype.onBlur = function()
{
};


WidgetContent.prototype.saveState = function() //JSON?
{
};

WidgetContent.prototype.writeHTML = function() {

	this.element.innerHTML = this.content;
};


WidgetContent.prototype.evaluate = function(content, element)
{
	eval(content);
};

///////////////////////////

var savedScrollPos = getScrollOffset();

function scroll(event)
{
//	window.status='SCROLLING';
	//todo update relatively positioned widgets
	var scrollPos = getScrollOffset();

	var offsetX = scrollPos.x - savedScrollPos.x;
	var offsetY = scrollPos.y - savedScrollPos.y;

	for(var draggableId in widgetmanager.draggableWidgets)
	{
		var widget = widgetmanager.draggableWidgets[draggableId];
		if(widget != null && widget.ignoresPageScroll)
		{
			widget.move(offsetX, offsetY);
		}
	}
	savedScrollPos = scrollPos;
}


WidgetManager.prototype.executeJson = function(responseMessage, feedbackMessage) {

    try {
        var message = eval("(" + responseMessage + ")");
    } catch(e) {
        alert(e.message + ' in:\n' + responseMessage);
    }

    eval(message.function + '(message.data, message.dataId)');
}






//todo sort out x,y <-> top,left


window.onscroll = scroll;


var widgetmanager = new WidgetManager();
WidgetManager.instance = widgetmanager;



