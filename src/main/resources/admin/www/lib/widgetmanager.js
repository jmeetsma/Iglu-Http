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

	this.masterFrame = null;

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

	this.masterFrameWidget = null;

	this.settings = new Object();

}



WidgetManager.prototype.registerInitFunction = function(initFunction) {
	this.initFunctions[this.initFunctions.length] = initFunction;
}


WidgetManager.prototype.init = function() {

	//document.onmouseup = dropWidget;
	//document.onmousemove = dragWidget;
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

	if(typeof container == 'undefined' || container == null) {
		throw 'container is ' + container + ' while deploying widget ' + newWidget.getId();
	}

	if(newWidget.constructor.name == 'MasterFrameWidget') {
		this.masterFrameWidget = newWidget;
	}

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




WidgetManager.prototype.executeJson = function(responseMessage, feedbackMessage) {

    try {
        var message = eval("(" + responseMessage + ")");
    } catch(e) {
        alert(e.message + ' in:\n' + responseMessage);
    }

    eval(message.function + '(message.data, message.dataId)');
}






//todo sort out x,y <-> top,left



var widgetmanager = new WidgetManager();
WidgetManager.instance = widgetmanager;



