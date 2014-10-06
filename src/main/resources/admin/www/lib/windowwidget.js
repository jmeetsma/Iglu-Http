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

function WindowSettings(widgetId, title, height, width, source, ignorePageScroll) {
	this.id = widgetId;
	this.height = height;
	this.width = width;
	this.title = title;
	this.source = source;
	this.ignoresPageScroll = ignorePageScroll;
}


function WindowWidget(settings, content) {
	this.cssClassName = 'window';
	this.height = null;
	this.width = null;
	this.top = null;
	this.left = null;
	this.constructWindowWidget(settings, content);
}

subclass(WindowWidget, FrameWidget);


WindowWidget.prototype.constructWindowWidget = function(settings, content) {

	this.constructFrameWidget(settings, content);

	if(this.height == null) {
		this.height = 200;
	}
	if(this.width == null) {
		this.width = 300;
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






WindowWidget.prototype.setSizeAndPosition = function() {

	this.element.style.top = this.top + 'px';
	this.element.style.left = this.left + 'px';
	if(this.height != null) {
		this.element.style.height = this.height + 'px';
		if(this.contentElement != null) {
			this.contentElement.style.height = (this.height - (this.content.onDeploy ? 32 : 23)) + 'px';
		}
	}
	if(this.width != null) {
		this.element.style.width = this.width + 'px';
		if(this.contentElement != null) {
			this.contentElement.style.width = (this.width - (this.content.onDeploy ? 11 : 2)) + 'px';
		}
	}

};


WindowWidget.prototype.writeHTML = function() {

	if(this.element) {
		var result = '<div class="title_bar_inactive" id="' + this.id + '_header">' +
					 	'<div class="title">' + this.title + '</div>' +
					 	'<div class="close_icon" onclick="widgetmanager.destroyWidget(\'' + this.getId() + '\')"></div>' +
					 	'</div>' +
					 '<div class="window_contents" id="' + this.id + '_contents">';

        if(!this.content.writeHTML){
			result += this.content;
		}

		result += '</div>';

		this.element.innerHTML = result;
		this.dragActivationElement = document.getElementById(this.id + '_header');
		this.contentElement = document.getElementById(this.id + '_contents');

        if(this.content.writeHTML) {
        	this.content.element = this.contentElement;
			this.content.writeHTML();
		}
		this.setSizeAndPosition();
	}
};


WindowWidget.prototype.onDestroy = function() {
	//save state
	if(this.content.onDeploy) {
		WidgetManager.instance.destroyWidget(this.content.id);
	}

};


WindowWidget.prototype.onDeploy = function() {
	widgetmanager.registerDraggableWidget(this);
	widgetmanager.registerResizeableWidget(this, 'se');

	if(this.content.draw) {
		WidgetManager.instance.deployWidgetInContainer(this.contentElement, this.content);
		widgetmanager.registerResizeableWidget(this.content, 'se');
		//let content handle overflow
		this.contentElement.style.overflow = 'visible';
	}
	//load state
	this.refresh();
};

/*
WindowWidget.prototype.refresh = function() {
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

WindowWidget.prototype.onFocus = function() {

	log('this.id:' + this.id);

	this.setHeaderClass('title_bar_active');
};

WindowWidget.prototype.onBlur = function() {
	this.setHeaderClass('title_bar_inactive');
};

WindowWidget.prototype.setHeaderClass = function(className) {
	var header = document.getElementById(this.id + '_header');

//	alert(this.id);

	if(header != null) {
		header.className = className;
	}
};

WindowWidget.prototype.display = function(content, element)
{
	if(element != null)
	{
		element.content = content;
		document.getElementById(element.id + '_contents').innerHTML = content;
	}
	else
	{
		this.content = content;
		document.getElementById(this.id + '_contents').innerHTML = content;
	}
};



