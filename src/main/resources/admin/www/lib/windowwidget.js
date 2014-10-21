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

function WindowWidget(settings, content) {
	this.cssClassName = 'window';
	this.constructWindowWidget(settings, content);
}

subclass(WindowWidget, FrameWidget);


WindowWidget.prototype.constructWindowWidget = function(settings, content) {

	this.constructFrameWidget(settings, content);

	this.resizeDirections = 'se';
	this.isDraggable = true;

	if(this.height == null) {
		this.height = 200;
	}
	if(this.width == null) {
		this.width = 300;
	}

	if(typeof this.left == 'undefined' || this.left == null) {
		this.left = WidgetManager.instance.lastX += 20;
	}
	if(typeof this.top == 'undefined' || this.top == null) {
		this.top = WidgetManager.instance.lastY += 20;
	}


	if(typeof settings.title != 'undefined') {
		this.title = settings.title;
	} else {
		this.title = this.id;
	}
	if(typeof settings.initFunction != 'undefined') {
		this.init = settings.initFunction;
	}
	if(typeof settings.ignoresPageScroll != 'undefined') { //TODO replace with css function
		this.ignoresPageScroll = settings.ignoresPageScroll;
	} else {
		this.ignoresPageScroll = true;
	}
};




/*
FrameWidget.prototype.refreshElementPosition = function()
{
	WidgetManager.instance.lastX = this.left;
	WidgetManager.instance.lastY = this.top;

	if(typeof this.element != 'undefined')
	{
		this.element.style.top = this.top + 'px';
		this.element.style.left = this.left + 'px';
	}
}*/

WindowWidget.prototype.getDragSelectElement = function() {
	return this.dragActivationElement;
};





WindowWidget.prototype.setSizeAndPosition = function() {

	this.element.style.top = this.top + 'px';
	this.element.style.left = this.left + 'px';
	if(this.height != null) {
		this.element.style.height = this.height + 'px';
/*		if(this.contentElement != null) {
			this.contentElement.style.height = (this.height - (this.content.onDeploy ? 32 : 23)) + 'px';
		}  */
	}
	if(this.width != null) {
		this.element.style.width = this.width + 'px';
/*		if(this.contentElement != null) {
			this.contentElement.style.width = (this.width - (this.content.onDeploy ? 11 : 2)) + 'px';
		} */
	}

};


WindowWidget.prototype.writeHTML = function() {

//	if(this.element) {
	var result = '<div class="title_bar_inactive" id="' + this.id + '_header">' +
					'<div class="title">' + this.title + '</div>' +
					'<div class="close_icon" onclick="widgetmanager.destroyWidget(\'' + this.getId() + '\')"></div>' +
					'</div>';
				 //'<div id="' + this.id + '_contents">';

	var contentFrame = new FrameWidget({
        id : this.id + '_frame',
        cssClassName : 'panelcontentframe',
        //todo margin
        top: 30,
        left: 5,
        width: (this.width - 10),
        height: (this.height - 35)
	}, this.content);
	contentFrame.stretchToOuterWidget(this, {'e':{'offset':5}});
	contentFrame.stretchToOuterWidget(this, {'s':{'offset':5}});

	this.addResizeListener(contentFrame, {'e':{'action':contentFrame.resizeEast, factor: 1}});
	this.addResizeListener(contentFrame, {'s':{'action':contentFrame.resizeSouth, factor: 1}});
	this.addResizeListener(contentFrame, {'n':{'action':contentFrame.resizeSouth, factor: 1}});
	this.addResizeListener(contentFrame, {'w':{'action':contentFrame.resizeEast, factor: 1}});



//	alert('' + this.id + ': ' + this.width + '->' + contentFrame.width + '\n' +
//			'' + this.id + ': ' + this.height + '->' + contentFrame.height);

	this.subWidgets[this.element.id] = contentFrame;



/*
	if(this.content != null && !this.content.writeHTML){
		result += this.content;
	}
*/
	result += '</div>';

	this.element.innerHTML = result;
	this.dragActivationElement = document.getElementById(this.id + '_header');
//	this.contentElement = document.getElementById(this.id + '_contents');

/*	if(this.content != null && this.content.writeHTML) {
		this.content.element = this.contentElement;
		this.content.writeHTML();
	}
	this.setSizeAndPosition();*/
//	}
};


WindowWidget.prototype.onDestroy = function() {

	if(typeof this.left != 'undefined' && this.left != null) {
		WidgetManager.instance.lastX = this.left;
	}
	if(typeof this.right != 'undefined' && this.right != null) {
		WidgetManager.instance.lastY = this.top;
	}

	for(containerId in this.subWidgets) {
		WidgetManager.instance.destroyWidget(this.subWidgets[containerId].id);
	}
	if(this.content && this.content.onDestroy != 'undefined') {
		WidgetManager.instance.destroyWidget(this.content.id);
	}

/*	if(this.content.onDestroy) {
	/*	if(!this.content.draw) {
			WidgetManager.instance.destroyContentWidget(this.content.id);
		} else {* /
			WidgetManager.instance.destroyWidget(this.content.id);
		}
	}             */

};


/*WindowWidget.prototype.onDeploy = function() {

	this.draw();


	widgetmanager.registerDraggableWidget(this);
	widgetmanager.registerResizeableWidget(this, 'se');

	if(this.content.draw) {
		WidgetManager.instance.deployWidgetInContainer(this.contentElement, this.content);
		//let content handle overflow
		this.contentElement.style.overflow = 'visible';
	}

	if(this.content.onDeploy) {
		WidgetManager.instance.deployWidgetInContainer(this.contentElement, this.content);
	}

	//load state
	this.refresh();
};*/


/*
WindowWidget.prototype.refresh = function() {
	//load state
	if(this.source != null) {
		ajaxRequestManager.doRequest(this.source, this.display, this);
	}

		//do not overwrite dragSelectionElement etc.
	else if(this.content != null && !this.content.onDeploy) {

     	this.contentElement.innerHTML = this.content;
    }

    else if (this.content.refresh) {
    	this.content.refresh();
    }
}  */

//todo rename to activate / deactivate

WindowWidget.prototype.onFocus = function() {

	log('this.id:' + this.id);

	this.setHeaderClass('title_bar_active');
};

WindowWidget.prototype.onBlur = function() {
	this.setHeaderClass('title_bar_inactive');
};

WindowWidget.prototype.setHeaderClass = function(className) {
	var header = document.getElementById(this.id + '_header');

	if(header != null) {
		header.className = className;
	}
};

WindowWidget.prototype.display = function(content, element)
{
	if(element != null) {
		element.content = content;
		document.getElementById(element.id + '_contents').innerHTML = content;
	} else {
		this.content = content;
		document.getElementById(this.id + '_contents').innerHTML = content;
	}
};



