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

function PanelSettings(id, width, height, stickToWindowHeightMinus, source, hasHeader, title) {
	this.id = id;
	this.width = width;
	this.height = height;
	this.stickToWindowHeightMinus;
	this.source = source;
	this.source_load_action = 'display';
	this.hasHeader = hasHeader;
	this.title = title;
}


function PanelWidget(settings, content) {
	this.cssClassName = 'panel';
	this.constructPanelWidget(settings, content);
}

subclass(PanelWidget, FrameWidget);

PanelWidget.prototype.constructPanelWidget = function(settings, content) {

	//invoke super
	this.constructFrameWidget(settings, content);

	if(typeof settings.stickToWindowHeightMinus != 'undefined') {
		this.stickToWindowHeightMinus = settings.stickToWindowHeightMinus;
	}

	this.resizeDirections = '';

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
};



PanelWidget.prototype.onDestroy = function() {
	//save state
};

PanelWidget.prototype.setPositionFromPage = function() {

	this.top = getElementPositionInPage(this.element).y;
	this.left = getElementPositionInPage(this.element).x;
}



PanelWidget.prototype.onDeploy = function() {

	this.draw();
//	widgetmanager.registerDraggableWidget(this);

	this.setPositionFromPage();


	if(this.hasHeader) {
		this.header = document.createElement('div');
		this.header.id = this.id + '_header';
		this.header.className = 'panelheader';
		this.header.innerHTML = this.title;
		this.element.appendChild(this.header);
	}

    //TODO new content widget
	this.container = document.createElement('div');
	this.container.id = this.id + '_contents';
	this.container.className = 'panelcontents' + (this.panelContentClass != null ? ', ' + this.panelContentClass : '');
	this.container.onmouseover = new Function('event', 'event.stopPropagation();');
	this.container.onmouseout = new Function('event', 'event.stopPropagation();');
	this.element.appendChild(this.container);

    if(typeof this.stickToWindowHeightMinus != 'undefined' && this.stickToWindowHeightMinus != null) {
		this.container.style.maxHeight = (document.documentElement.clientHeight - this.stickToWindowHeightMinus) + 'px';
		widgetmanager.registerWindowResizeListener(this);
	}

    if(this.resizeDirections.length > 0) {
		widgetmanager.registerResizeableWidget(this, this.resizeDirections);
	}

	if((typeof this.content.onDeploy != 'undefined')) {
		widgetmanager.deployWidgetInContainer(this.container, this.content);
	}
	//load state
	this.refresh();
};




//todo rename to activate / deactivate

PanelWidget.prototype.onFocus = function() {
};

PanelWidget.prototype.onBlur = function() {
};


