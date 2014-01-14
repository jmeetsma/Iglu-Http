
/*
 * Is able to manage lots of different kinds of widgets.
 * It keeps order, facilitates focus, dragging, ignoring scrolling etc.
 *
 */
function WidgetManager()
{
	this.draggedWidget = null;
	this.mouseOffset = null;
	//todo floatingWidgets
	this.draggableWidgets = new Array();
	this.currentZIndex = 100;
	this.widgets = new Array();

	this.lastX = 0;
	this.lastY = 0;
}




/**
 *
 *
 */
WidgetManager.prototype.registerDraggableWidget = function(widget)
{
	//administer order
	this.draggableWidgets[widget.getDragSelectElement().id] = widget;

	widget.getDOMElement().style.zIndex = this.currentZIndex++;

	widget.getDragSelectElement().onmousedown = function(event)
	{
		var draggableWidget = widgetengine.draggableWidgets[this.id];
		document.body.style.cursor = 'move';
		widgetengine.draggedWidget = draggableWidget;
		//todo rename: is offset from element position
		widgetengine.mouseOffset = getMouseOffsetFromElementPosition(this, event);
	}

	widget.getDOMElement().onmousedown = function(event)
	{
		this.style.zIndex = widgetengine.currentZIndex++;
		var currentWidget = widgetengine.widgets[this.id];
		widgetengine.activateCurrentWidget(currentWidget);
//		widgetengine.draggedWidget = currentWidget;
	}

	this.activateCurrentWidget(widget);
}

/**
 * Deactivates former focussed (draggable) widget and activates current.
 *
 */
WidgetManager.prototype.activateCurrentWidget = function(currentWidget)
{
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
	var widget = this.widgets[newWidget.getId()];
	if(widget == null)
	{
		this.widgets[newWidget.getId()] = newWidget;

    	//LAYOUT: determine position / size

		var canvas = document.body;//getElementById('canvas');
		if(typeof x == 'undefined' || x == null)
		{
			var x = this.lastX += 50;
		}
		if(typeof y == 'undefined' || y == null)
		{
			var y = this.lastY += 50;
		}
		if(canvas != null)
    	{
			var element = document.getElementById(newWidget.getId());
    		if(element == null)
            {
    			element = document.createElement('div');

				//is this necessary?
				//use prefix 'widget_'
				element.setAttribute('id', newWidget.getId());

				canvas.appendChild(element);
			}
    		newWidget.setDOMElement(element);
		}
		if(newWidget.ignoresPageScroll)
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

    	var canvas = document.body;//getElementById('canvas');
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
	this.height = 0;
	this.width = 0;
	this.top = 0;
	this.left = 0;
	//element that must be clicked to drag the widget
	this.dragActivationElement = null;
	this.ignoresPageScroll = false;
}


Widget.prototype.getId = function()
{
	return this.id;
};

//(multiple) inherit members here...

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






///////////////////////
//                   //
//  Widget Functions //
//                   //
///////////////////////






function dropWidget(event)
{
	widgetengine.draggedWidget = null;
	document.body.style.cursor = 'auto';
}


function dragWidget(event)
{
	event = event || window.event;
	if(widgetengine.draggedWidget != null)
	{
		var mousePos = getMousePositionInWindow(event);
		widgetengine.draggedWidget.setPosition(mousePos.x - widgetengine.mouseOffset.x, mousePos.y - widgetengine.mouseOffset.y);
	}
}

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
    adminConsole[message.function](message.data, message.dataId);
}


WidgetManager.prototype.reportMessage = function(parameter) {
	alert(parameter.message);
}


WidgetManager.prototype.writeReturnValue = function(data, dataId) {
//	var content =
  //  ajaxRequestManager.doRequest('/cluster.html', adminConsole.createWindowWidget, [parameter.message, parameter.message, 100, 250, content]);
	//alert(dataId);
	document.getElementById("return_" + dataId).innerHTML = data.returnValue;
}


WidgetManager.prototype.createWindowWidget = function(responseMessage, windowSettings) {
    var element = document.createElement('html');
    element.innerHTML = '' + responseMessage;

    var nodeNames = '';
    for(var i = 0; i < element.childNodes.length; i++) {
        nodeNames += element.childNodes[i].nodeName + '\n';
    }

	if(!widgetengine.widgetExists(windowSettings.id)) {

	    var windowWidget = new WindowWidget(windowSettings, element.getElementsByTagName('body')[0].innerHTML);
    	widgetengine.deployWidget(windowWidget);

		if(typeof windowWidget.init != 'undefined') {
			windowWidget.init(windowSettings.data);
		}
	}

}







//todo sort out x,y <-> top,left









document.onmouseup = dropWidget;
document.onmousemove = dragWidget;
window.onscroll = scroll;


var widgetengine = new WidgetManager();
