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

function SplitPanelSettings(id, height, width) {
	this.id = id;
	this.height = height;
	this.width = width;
}


function SplitPanelWidget(settings, firstPanelSize, firstPanel, secondPanel) {
	//this.construct(settings, firstPanelSize, firstPanel, secondPanel);
}

SplitPanelWidget.prototype = new Widget();

SplitPanelWidget.prototype.construct = function(settings, firstPanelSize, firstPanel, secondPanel) {

	this.id = settings.id;
	this.firstPanelSize = firstPanelSize;

	this.firstPanel = firstPanel;
	this.secondPanel = secondPanel;

	if(typeof settings.height != 'undefined') {
		this.height = settings.height;
	} else {
//		this.height = '100%';
	}
	if(typeof settings.width != 'undefined') {
		this.width = settings.width;
	} else {
//		this.width = '100%';
	}
};


SplitPanelWidget.prototype.alertSomething = function(value) {
	alert(value);
};

SplitPanelWidget.prototype.process = function(value) {
	alert(value);
};

SplitPanelWidget.prototype.draw = function(left, top) {
	if(top != null) this.top = top;
	if(left != null) this.left = left;
	if(this.element != null) {
		this.element.style.visibility = 'hidden';
		this.element.className = 'splitpanel';
		this.setSizeAndPosition();
		this.writeHTML();
		this.element.style.visibility = 'visible';
	}
};


SplitPanelWidget.prototype.setSizeAndPosition = function() {

	this.element.style.top = this.top + 'px';
	this.element.style.left = this.left + 'px';
	if(typeof this.height != 'undefined') {
		this.element.style.height = this.height + 'px';
	} else {
		this.element.style.height = '100%';
	}
	if(typeof this.width != 'undefined') {
		this.element.style.width = this.width + 'px';
	} else {
		this.element.style.width = '100%';
	}
};


SplitPanelWidget.prototype.writeHTML = function() {

};


SplitPanelWidget.prototype.onDestroy = function() {
	//save state
};


SplitPanelWidget.prototype.onDeploy = function() {


	this.container = document.createElement('div');
	this.container.className = 'splitpanelcontainer';
	this.element.appendChild(this.container);

	widgetengine.deployWidgetInContainer(this.container, this.firstPanel);
	//secondPanel may be a splitPanel
	widgetengine.deployWidgetInContainer(this.container, this.secondPanel);

	this.firstPanel.positionListener = this;

	this.setPanelClasses();

};


SplitPanelWidget.prototype.onPanelPositionChanged = function(panel) {
	this.secondPanel.setPositionFromPage();
}


SplitPanelWidget.prototype.setPositionFromPage = function() {
	this.firstPanel.setPositionFromPage();
	this.secondPanel.setPositionFromPage();
}


SplitPanelWidget.prototype.refresh = function() {
	//load state
/*	if(this.source != null) {
		ajaxRequestManager.doRequest(this.source, this.display, this);
	} */
};

//todo rename to activate / deactivate

SplitPanelWidget.prototype.onFocus = function() {
};

SplitPanelWidget.prototype.onBlur = function() {
};


SplitPanelWidget.prototype.display = function(content, element)
{
};



//////////////////////////


function HorizontalSplitPanelWidget(settings, firstPanelSize, firstPanel, secondPanel) {
	this.construct(settings, firstPanelSize, firstPanel, secondPanel);
	firstPanel.height = firstPanelSize;
	firstPanel.allowVerticalResize();
}

HorizontalSplitPanelWidget.prototype = new SplitPanelWidget();

HorizontalSplitPanelWidget.prototype.setPanelClasses = function() {
	this.firstPanel.element.className = 'first_horizontal_splitpanel';
    this.secondPanel.element.className = 'second_splitpanel';
}

//////////////////////////


function VerticalSplitPanelWidget(settings, firstPanelSize, firstPanel, secondPanel) {
	this.construct(settings, firstPanelSize, firstPanel, secondPanel);
	firstPanel.width = firstPanelSize;
	firstPanel.allowHorizontalResize();
}

VerticalSplitPanelWidget.prototype = new SplitPanelWidget();

VerticalSplitPanelWidget.prototype.setPanelClasses = function() {
	this.firstPanel.element.className = 'first_vertical_splitpanel';
    this.secondPanel.element.className = 'second_splitpanel';
}


