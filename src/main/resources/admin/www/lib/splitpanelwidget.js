
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
	}
	if(typeof this.width != 'undefined') {
		this.element.style.width = this.width + 'px';
	}
	if(this.contentElement != null) {
		this.contentElement.style.height = (this.height - 33) + 'px';
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
	widgetengine.deployWidgetInContainer(this.container, this.secondPanel);

	//load state
//	this.refresh();
};

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

//////////////////////////


function VerticalSplitPanelWidget(settings, firstPanelSize, firstPanel, secondPanel) {
	this.construct(settings, firstPanelSize, firstPanel, secondPanel);
	firstPanel.width = firstPanelSize;
	firstPanel.allowHorizontalResize();
}

VerticalSplitPanelWidget.prototype = new SplitPanelWidget();
