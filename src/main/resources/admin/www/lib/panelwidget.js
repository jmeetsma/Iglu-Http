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


PanelWidget.prototype.allowHorizontalResize = function() {
	if(this.resizeDirections.indexOf('e') == -1) {
		this.resizeDirections += 'e';
	}
};

PanelWidget.prototype.allowVerticalResize = function() {
	if(this.resizeDirections.indexOf('s') == -1) {
		this.resizeDirections += 's';
	}
};


PanelWidget.prototype.setSizeAndPosition = function() {

	if(typeof this.width != 'undefined' && this.allowsResize('e')) {
		this.element.style.width = this.width + 'px';
	} else {
		this.element.style.display = 'table-row';
		this.element.style.whiteSpace = 'nowrap';
     }
	if(typeof this.height != 'undefined' && this.allowsResize('s')) {
		this.element.style.height = this.height + 'px';
	} else {
		this.element.style.display = 'table-cell';
		this.element.style.whiteSpace = 'nowrap';
	}
	if(this.positionListener != null && typeof(this.positionListener.onPanelPositionChanged) == 'function') {
		this.positionListener.onPanelPositionChanged(this);
	}};


PanelWidget.prototype.writeHTML = function() {

	if(this.container) {
		if((typeof this.content.writeHTML != 'undefined')) {
			this.content.writeHTML();
        } else {
			this.container.innerHTML = this.content;
		}
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
//	widgetmanager.registerDraggableWidget(this);

	this.setPositionFromPage();


	if(this.hasHeader) {
		this.header = document.createElement('div');
		this.header.id = this.id + '_header';
		this.header.className = 'panelheader';
		this.header.innerHTML = this.title;
		this.element.appendChild(this.header);
	}


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

	if((typeof this.content.writeHTML != 'undefined')) {
		widgetmanager.deployWidgetInContainer(this.container, this.content);
	}
	//load state
	this.refresh();
};

PanelWidget.prototype.onWindowResizeEvent = function(event) {
    if(typeof this.stickToWindowHeightMinus != 'undefined' && this.stickToWindowHeightMinus != null) {
//    alert(this.id + ': ' + this.container.style.height + ' -> ' + (document.documentElement.clientHeight - this.stickToWindowHeightMinus) + 'px');
		this.container.style.maxHeight = (document.documentElement.clientHeight - this.stickToWindowHeightMinus) + 'px';
	}
}



PanelWidget.prototype.refresh = function() {
	//load state
	if(this.source != null) {

		ajaxRequestManager.doRequest(this.source, this[this.source_load_action], this);
	} else if(this.content != null) {
		this.writeHTML();
	}
};

//todo rename to activate / deactivate

PanelWidget.prototype.onFocus = function() {
};

PanelWidget.prototype.onBlur = function() {
};


