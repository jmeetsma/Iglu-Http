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


//TODO is a split frame really
function SplitPanelSettings(id, height, width) {
	this.id = id;
	this.height = height;
	this.width = width;
}


function SplitPanelWidget(settings, firstPanelSize, firstPanel, secondPanel) {
	this.cssClassName = 'splitpanel';

	//this.construct(settings, firstPanelSize, firstPanel, secondPanel);
}

subclass(SplitPanelWidget, FrameWidget);

SplitPanelWidget.prototype.constructSplitPanelWidget = function(settings, firstPanelSize, firstPanel, secondPanel) {

	this.constructFrameWidget(settings);

	this.firstPanelSize = firstPanelSize;

	this.firstPanel = firstPanel;
	this.secondPanel = secondPanel;
};


SplitPanelWidget.prototype.alertSomething = function(value) {
	alert(value);
};

SplitPanelWidget.prototype.process = function(value) {
	alert(value);
};


SplitPanelWidget.prototype.setSizeAndPosition = function() {

	this.element.style.top = this.top + 'px';
	this.element.style.left = this.left + 'px';
/*	if(typeof this.height != 'undefined') {
		this.element.style.height = this.height + 'px';
	} else {
		this.element.style.height = '100%';
	}
	if(typeof this.width != 'undefined') {
		this.element.style.width = this.width + 'px';
	} else {
		this.element.style.width = '100%';
	}*/
};


SplitPanelWidget.prototype.writeHTML = function() {

};


SplitPanelWidget.prototype.onDestroy = function() {
	//save state
};

SplitPanelWidget.prototype.createContainers = function() {
	this.container = document.createElement('div');
	this.container.className = 'splitpanelcontainer';
//	this.container.style.width = this.element.offsetWidth;
	this.element.appendChild(this.container);

	this.firstPanelContainer = document.createElement('div');
	this.secondPanelContainer = document.createElement('div');
	this.setPanelClasses();
	this.container.appendChild(this.firstPanelContainer);
	this.container.appendChild(this.secondPanelContainer);
}





SplitPanelWidget.prototype.onPanelPositionChanged = function(panel) {
	this.secondPanel.setPositionFromPage();

	//TODO set second panel on 'calc(100% - ' + panel.width + 'px)';
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
	this.cssClassName = 'splitpanel';
	this.constructSplitPanelWidget(settings, firstPanelSize, firstPanel, secondPanel);
	firstPanel.height = firstPanelSize;
	firstPanel.allowVerticalResize();
}

subclass(HorizontalSplitPanelWidget, SplitPanelWidget);

HorizontalSplitPanelWidget.prototype.setPanelClasses = function() {
	this.firstPanelContainer.className = 'first_horizontal_splitpanel';
    this.secondPanelContainer.className = 'second_horizontal_splitpanel';
 }



HorizontalSplitPanelWidget.prototype.onDeploy = function() {

	this.draw();

//	this.container = this.element;

	this.createContainers();

	this.firstPanelContainer.style.height = this.firstPanelSize;


	var firstWidget = widgetmanager.deployWidgetInContainer(this.firstPanelContainer, this.firstPanel);
	/*firstWidget.element.style.height = '100%';  */
	/*firstWidget.element.style.width = '100%';  */
	WidgetManager.instance.registerResizeableWidget(firstWidget, firstWidget.resizeDirections);
	//secondPanel may be a splitPanel
	widgetmanager.deployWidgetInContainer(this.secondPanelContainer, this.secondPanel);

	this.firstPanel.positionListener = this;

};




//////////////////////////


function VerticalSplitPanelWidget(settings, firstPanelSize, firstPanel, secondPanel) {
	this.cssClassName = 'splitpanel';
	this.constructSplitPanelWidget(settings, firstPanelSize, firstPanel, secondPanel);
	firstPanel.width = firstPanelSize;
	firstPanel.allowHorizontalResize();
}

subclass(VerticalSplitPanelWidget, SplitPanelWidget);

VerticalSplitPanelWidget.prototype.setPanelClasses = function() {
	this.firstPanelContainer.className = 'first_vertical_splitpanel';
    this.secondPanelContainer.className = 'second_vertical_splitpanel';
}





VerticalSplitPanelWidget.prototype.onDeploy = function() {

	this.draw();

//	this.container = this.element;

	this.createContainers();
	this.firstPanelContainer.style.width = this.firstPanelSize;
	this.secondPanelContainer.style.width = this.container.offsetWidth - this.firstPanelSize;

	var firstWidget = widgetmanager.deployWidgetInContainer(this.firstPanelContainer, this.firstPanel);
	/*firstWidget.element.style.height = '100%';  */
	/*firstWidget.element.style.width = '100%';  */
	WidgetManager.instance.registerResizeableWidget(firstWidget, firstWidget.resizeDirections);
	//secondPanel may be a splitPanel
	widgetmanager.deployWidgetInContainer(this.secondPanelContainer, this.secondPanel);

	this.firstPanel.positionListener = this;

};

