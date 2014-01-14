function registerEventHandler(element, eventDesc, handler)
{
	if(element.attachEvent)
	{
		element.attachEvent('on' + eventDesc, handler);
	}
	else
	{
		element.addEventListener(eventDesc, handler, false);
	}
}

//in Mozilla one could use classes as input, since the prototype member would be inherited
//for IE it works with objects only
function copyMembers(classA, classB)
{
	for (var n in classA)
	{
		classA[n] = classB[n];
	}
}


function subclass(baseclass, subclass)
{
	subclass.prototype = baseclass.prototype;
}

function getElementFromEvent(event)
{
	event = event || window.event;
	var element;
	if(typeof event.target != 'undefined')
	{
		element = event.target;
	}
	else if (typeof event.fromElement != 'undefined')
	{
		element = event.fromElement;
	}
	return element;
}


///////////////////
//               //
//  drag & drop  //
//               //
///////////////////

//mouse coordinates in window (not (scrollable) page)
function getMousePositionInWindow(event)
{
	event = event || window.event;
/*	if(typeof event.pageX != 'undefined')
	{
		return {x:event.pageX, y:event.pageY};
	} */
	return {x:event.clientX /*+ document.body.scrollLeft - document.body.clientLeft*/, y:event.clientY /*+ document.body.scrollTop - document.body.clientTop*/};
}

function getMousePositionInPage(event)
{
	event = event || window.event;
	if(typeof event.pageX != 'undefined')
	{
		return {x:event.pageX, y:event.pageY};
	}
	var scrollPos = getScrollOffset();
	return {x:event.clientX + scrollPos.x, y:event.clientY + scrollPos.y};
}


//determines offset from element position
function getMouseOffsetFromElementPosition(target, event)
{
	event = event || window.event;

	var docPos = getElementPositionInPage(target);
	var mousePos = getMousePositionInWindow(event);
	return {x:mousePos.x - docPos.x, y:mousePos.y - docPos.y};
}


function getScrollOffset()
{
  var scrOfX = 0, scrOfY = 0;
  if( typeof( window.pageYOffset ) == 'number' )
  {
    //Netscape compliant
    scrOfY = window.pageYOffset;
    scrOfX = window.pageXOffset;
  }
  else if( document.body && ( document.body.scrollLeft || document.body.scrollTop ) )
  {
    //DOM compliant
    scrOfY = document.body.scrollTop;
    scrOfX = document.body.scrollLeft;
  }
  else if( document.documentElement && ( document.documentElement.scrollLeft || document.documentElement.scrollTop ) )
  {
    //IE6 standards compliant mode
    scrOfY = document.documentElement.scrollTop;
    scrOfX = document.documentElement.scrollLeft;
  }
  return {x: scrOfX, y: scrOfY };
}

function getElementPositionInPage(element)
{
	var left = 0;
	var top  = 0;

	while (element.offsetParent)
	{
		left += element.offsetLeft;
		top  += element.offsetTop;
		element = element.offsetParent;
	}

	left += element.offsetLeft;
	top  += element.offsetTop;

	return {x:left, y:top};
}

function getElementPositionInWindow(element)
{
	var elementPosInPage = getElementPositionInPage(element);
	var scrollOffset = getScrollOffset();
	return {x:elementPosInPage.x - scrollOffset.x, y:elementPosInPage.y - scrollOffset.y};
}
