

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

	this.currentZIndex = 100;
	this.widgets = new Array();
	this.initFunctions = new Array();

	this.currentWidget = null;

	this.lastX = 0;
	this.lastY = 0;

	this.resizeListeners = new Array();

    window.onresize = this.notifyWindowResizeListeners;
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

	//alert('resize ' + widgetengine.resizeListeners.length);

	for(var i in widgetengine.resizeListeners) {
		widgetengine.resizeListeners[i].onWindowResizeEvent(event);
	}

}

WidgetManager.prototype.registerWindowResizeListener = function(listener) {
	this.resizeListeners[this.resizeListeners.length] = listener;
}



function dropWidget(event) {
	widgetengine.draggedWidget = null;
	widgetengine.resizingWidget = null;
	document.body.style.cursor = 'auto';
}



function dragWidget(event) {

	event = event || window.event;
	if(widgetengine.resizingWidget != null && widgetengine.resizeDirection != null) {
		var mousePos = getMousePositionInWindow(event);
		if(widgetengine.resizeDirection.indexOf('n') > -1) {
			widgetengine.resizingWidget.resizeNorth(-1 * (mousePos.y - widgetengine.mouseOffset.y - widgetengine.resizingWidget.top));
		}
		if(widgetengine.resizeDirection.indexOf('s') > -1) {
			widgetengine.resizingWidget.resizeSouth(mousePos.y - widgetengine.mouseOffset.y - widgetengine.resizingWidget.top);
		}
		if(widgetengine.resizeDirection.indexOf('w') > -1) {
			widgetengine.resizingWidget.resizeWest(-1 * (mousePos.x - widgetengine.mouseOffset.x - widgetengine.resizingWidget.left));
		}
		if(widgetengine.resizeDirection.indexOf('e') > -1) {
			widgetengine.resizingWidget.resizeEast(mousePos.x - widgetengine.mouseOffset.x - widgetengine.resizingWidget.left);
		}
	} else if(widgetengine.draggedWidget != null) {
		var mousePos = getMousePositionInWindow(event);
		widgetengine.draggedWidget.setPosition(mousePos.x - widgetengine.mouseOffset.x, mousePos.y - widgetengine.mouseOffset.y);
	}
}

/**
 *
 *
 */
WidgetManager.prototype.registerDraggableWidget = function(widget)
{
	//administratevoivod order
	this.draggableWidgets[widget.getDragSelectElement().id] = widget;

	widget.isDraggable = true;

	widget.getDOMElement().style.zIndex = this.currentZIndex++;

	widget.getDragSelectElement().onmousedown = function(event)
	{
		if(widgetengine.resizingWidget == null) {
			var draggableWidget = widgetengine.draggableWidgets[this.id];
			widgetengine.draggedWidget = draggableWidget;
			//todo rename: is offset from element position
			widgetengine.mouseOffset = getMouseOffsetFromElementPosition(this, event);
		} else {

		}
	}

	widget.getDragSelectElement().onmouseover = function(event) {
		if(widgetengine.resizingWidget == null) {
			document.body.style.cursor = 'move';
		}
	}

	widget.getDragSelectElement().onmousemove = function(event) {
		if(widgetengine.resizingWidget == null) {
			document.body.style.cursor = 'move';
		}
	}

	widget.getDragSelectElement().onmouseout = function(event) {
		if(widgetengine.resizingWidget == null && widgetengine.draggedWidget == null) {
			document.body.style.cursor = 'auto';
		}
	}


	widget.getDOMElement().onmousedown = function(event)
	{
		this.style.zIndex = widgetengine.currentZIndex++;
		var currentWidget = widgetengine.widgets[this.id];
		widgetengine.activateCurrentWidget(currentWidget);
	}

	this.activateCurrentWidget(widget);
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
		widget.resizeDirections = 'nesw';
	}

	//TODO only an active widget should respond to drag or resize events

	widget.getDOMElement().onmousedown = function(event) {

		if(this.isDraggable) {
			this.style.zIndex = widgetengine.currentZIndex++;
		}
		var currentWidget = widgetengine.widgets[this.id];
		widgetengine.activateCurrentWidget(currentWidget);
		if(widgetengine.resizeDirection != null) {
			widgetengine.resizingWidget = currentWidget;
		}
		log(widgetengine.resizeDirection);
	}

	widget.getDOMElement().onmouseover = function(event) {
		if(widgetengine.resizingWidget == null) {
			widgetengine.determineResizeAction(widget, event);
		}
//		alert('over');
	}

	/*widget.getDOMElement().onmousemove = function(event) {
		if(widgetengine.resizingWidget == null) {
			widgetengine.determineResizeAction(widget, event);
		}
	} */

	widget.getDOMElement().onmouseout = function(event) {
		if(widgetengine.resizingWidget == null) {
			document.body.style.cursor = 'auto';
    	    widgetengine.resizeDirection = null;
		}
//		alert('out');
	}

	this.activateCurrentWidget(widget);
}


WidgetManager.prototype.determineResizeAction = function(widget, event)
{
	if(this.draggedWidget == null) {
		//TODO rename: is offset from element position
		this.mouseOffset = getMouseOffsetFromElementPosition(widget.getDOMElement(), event);



		var direction = '';

		if(/*this.currentWidget == widget &&*/ widget.allowsResize('n') && this.mouseOffset.y < 5) {
			direction = 'n';
         }
		if(/*this.currentWidget == widget &&*/ widget.allowsResize('s') && this.mouseOffset.y > widget.height - 5) {
			direction = 's';
        }
		if(/*this.currentWidget == widget &&*/ widget.allowsResize('w') && this.mouseOffset.x < 5) {
			direction += 'w';
        }
		if(/*this.currentWidget == widget &&*/ widget.allowsResize('e') && this.mouseOffset.x > widget.width - 5) {
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
WidgetManager.prototype.activateCurrentWidget = function(currentWidget)
{
	this.currentWidget = currentWidget;
	for(var draggableId in this.draggableWidgets)
	{
		var widget = this.draggableWidgets[draggableId];
		if(widget != null && widget != currentWidget)
		{
			widget.onBlur();
		}
	}
	currentWidget.onFocus();
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

WidgetManager.prototype.deployWidgetInContainer = function(container, newWidget, x, y)
{
	var widget = this.widgets[newWidget.getId()];
	if(widget == null)
	{
		this.widgets[newWidget.getId()] = newWidget;

		if(typeof x == 'undefined' || x == null)
		{
			var x = this.lastX += 50;
		}
		if(typeof y == 'undefined' || y == null)
		{
			var y = this.lastY += 50;
		}
		if(container != null)
    	{
    		var element = container;
			if(newWidget.getId() != container.id) {
				var element = document.getElementById(newWidget.getId());
				if(element == null)
				{
					element = document.createElement('div');
					//is this necessary?
					//use prefix 'widget_'
					element.setAttribute('id', newWidget.getId());
					container.appendChild(element);
				}
			}
    		newWidget.setDOMElement(element);
		}
		if(newWidget.ignoresPageScroll) //TODO display: fixed
		{
			var scrollPos = getScrollOffset();
			x = x + scrollPos.x;
			y = y + scrollPos.y;
		}
		newWidget.draw(x, y);
    	newWidget.onDeploy();
	}
	else
	{
    	return widget;
	}
	return newWidget;
}


WidgetManager.prototype.destroyWidget = function(widgetId)
{
	var widget = this.widgets[widgetId];
	if(widget != null)
	{
		//call widget destructor
		widget.onDestroy();

    	var canvas = document.body;
    	if(canvas != null)
    	{
			var element = document.getElementById(widgetId);
    		if(element != null)
            {
				canvas.removeChild(element);
			}
		}
		var draggableElement = widget.getDragSelectElement();
		if(draggableElement != null)
		{
			this.draggableWidgets[draggableElement.id] = null;
		}
		this.widgets[widgetId] = null;
	}
}



WidgetManager.prototype.getWidget = function(id)
{
	return this.widgets[id];
}

WidgetManager.prototype.containsWidget = function(id)
{
	return this.widgets[id] != null;
}






///////////////////////
//                   //
//  Abstract Widget  //
//   (base class)    //
//                   //
///////////////////////

function Widget()
{
	this.id = 'Widget';
/*	this.height = 0;
	this.width = 0;
	this.top = 0;
	this.left = 0;
*/	//element that must be clicked to drag the widget
	this.dragActivationElement = null;
	this.ignoresPageScroll = false;

	this.resizeDirections = '';
	this.source_load_action = 'display';

}

Widget.prototype.set = function(name, value) {
	if(typeof(this[name]) == 'undefined') {
		throw('attribute "' + name + '" is not declared in ' + this.constructor.name);
	} else {
		this[name] = value;
	}
}


Widget.prototype.getId = function()
{
	return this.id;
};

Widget.prototype.allowsResize = function(direction)
{
	return this.resizeDirections.indexOf(direction) != -1;
};



Widget.prototype.setPosition = function(x, y)
{
	this.top = y;
	this.left = x;
	this.refreshElementPosition();
}


Widget.prototype.move = function(x, y)
{
	this.top += y;
	this.left += x;
	this.refreshElementPosition();
}

Widget.prototype.refreshElementPosition = function()
{
	widgetengine.lastX = this.left;
	widgetengine.lastY = this.top;

	if(typeof this.element != 'undefined')
	{
		this.element.style.top = this.top + 'px';
		this.element.style.left = this.left + 'px';
	}
}

Widget.prototype.getDragSelectElement = function()
{
	return this.dragActivationElement;
};


Widget.prototype.setDOMElement = function(element)
{
	this.element = element; // how about coords (x, y) ?
	if(this.dragActivationElement == null)
	{
		this.dragActivationElement = element;
	}
};


Widget.prototype.getDOMElement = function()
{
	return this.element;
};


Widget.prototype.getHeight = function()
{
	return this.height;
};


Widget.prototype.getWidth = function()
{
	return this.width;
};

Widget.prototype.resizeNorth = function(offset)
{
	//TODO use constants
	var newHeight = offset + this.height;
	if(newHeight < 20) {
		newHeight = 20;
	}
	this.top = this.top + this.height - newHeight;
	this.height = newHeight;
	//widgetengine.mouseOffset.y -= offset;

	this.setSizeAndPosition();
};

Widget.prototype.resizeWest = function(offset)
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

Widget.prototype.resizeSouth = function(offset)
{
	//TODO use constants
	var newHeight = offset + this.height;
	if(newHeight < 20) {
		newHeight = 20;
	}
	this.height = newHeight;
	widgetengine.mouseOffset.y += offset;

	this.setSizeAndPosition();
};

Widget.prototype.resizeEast = function(offset)
{
	//TODO use constants
	var newWidth = offset + this.width;
	if(newWidth < 100) {
		newWidth = 100;
	}
	this.width = newWidth;
	widgetengine.mouseOffset.x += offset;

	this.setSizeAndPosition();
};

Widget.prototype.draw = function(left, top)// + mode
{
	//todo provide a nice sample implementation
	alert('\'draw\' not implemented');
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

Widget.prototype.setSizeAndPosition = function()
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


Widget.prototype.setHTML = function(data)
{
	if(this.element != null)
	{
		this.element.innerHTML = data;
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


///////////////////////////

var savedScrollPos = getScrollOffset();

function scroll(event)
{
//	window.status='SCROLLING';
	//todo update relatively positioned widgets
	var scrollPos = getScrollOffset();

	var offsetX = scrollPos.x - savedScrollPos.x;
	var offsetY = scrollPos.y - savedScrollPos.y;

	for(var draggableId in widgetengine.draggableWidgets)
	{
		var widget = widgetengine.draggableWidgets[draggableId];
		if(widget != null && widget.ignoresPageScroll)
		{
			widget.move(offsetX, offsetY);
		}
	}
	savedScrollPos = scrollPos;
}


WidgetManager.prototype.executeJson = function(responseMessage, feedbackMessage) {

//    alert(responseMessage);
    try {
        var message = eval("(" + responseMessage + ")");
    } catch(e) {
        alert(e.message + ' in:\n' + responseMessage);
    }

    eval(message.function + '(message.data, message.dataId)');
//    adminConsole[message.function](message.data, message.dataId);
}






//todo sort out x,y <-> top,left


//document.onmouseup = dropWidget;
//document.onmousemove = dragWidget;
window.onscroll = scroll;


var widgetengine = new WidgetManager();
WidgetManager.instance = widgetengine;

