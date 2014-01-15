function WindowSettings(widgetId, title, height, width, source, ignorePageScroll) {
	this.id = widgetId;
	this.height = height;
	this.width = width;
	this.title = title;
	this.source = source;
	this.ignoresPageScroll = ignorePageScroll;
}


function WindowWidget(windowSettings, content) {
	this.id = windowSettings.id;
	if(typeof windowSettings.height != 'undefined') {
		this.height = windowSettings.height;
	} else {
		this.height = 200;
	}
	if(typeof windowSettings.width != 'undefined') {
		this.width = windowSettings.width;
	} else {
		this.width = 300;
	}
	if(typeof windowSettings.title != 'undefined') {
		this.title = windowSettings.title;
	} else {
		this.title = this.id;
	}
	if(typeof windowSettings.source != 'undefined') {
		this.source = windowSettings.source;
	} else {
		this.source = null;
	}
	if(typeof content != 'undefined') {
		this.content = content;
	} else {
		this.content = 'loading...';
	}
	if(typeof windowSettings.initFunction != 'undefined') {
		this.init = windowSettings.initFunction;
	}
	if(typeof windowSettings.ignoresPageScroll != 'undefined') {
		this.ignoresPageScroll = windowSettings.ignoresPageScroll;
	} else {
		this.ignoresPageScroll = true;
	}
}

subclass(Widget, WindowWidget);


WindowWidget.prototype.alertSomething = function(value) {
	alert(value);
};

WindowWidget.prototype.process = function(value) {
	alert(value);
};

WindowWidget.prototype.draw = function(left, top) {
	if(top != null) this.top = top;
	if(left != null) this.left = left;
	if(this.element != null) {
		this.element.style.visibility = 'hidden';
		this.element.className = 'window';
		this.setSizeAndPosition();
		this.writeHTML();
		this.element.style.visibility = 'visible';
	}
};


WindowWidget.prototype.setSizeAndPosition = function() {

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


WindowWidget.prototype.writeHTML = function() {

	if(this.element) {
		var result = '<div class="title_bar_active" id="' + this.id + '_header">' +
					 	'<div class="title">' + this.title + '</div>' +
					 	'<div class="close_icon" onclick="widgetengine.destroyWidget(\'' + this.getId() + '\')"></div>' +
					 	'</div>' +
					 '<div class="window_contents" id="' + this.id + '_contents">';

		result += this.content;

		result += '</div>';

		this.element.innerHTML = result;
		this.dragActivationElement = document.getElementById(this.id + '_header');
		this.contentElement = document.getElementById(this.id + '_contents');
		if(typeof this.height != 'undefined') {
			this.contentElement.style.height = (this.height - 33) + 'px';
		}
	}
};


WindowWidget.prototype.onDestroy = function() {
	//save state
};


WindowWidget.prototype.onDeploy = function() {
	widgetengine.registerDraggableWidget(this);
	widgetengine.registerResizeableWidget(this);
	//load state
	this.refresh();
};

WindowWidget.prototype.refresh = function() {
	//load state
	if(this.source != null) {
		ajaxRequestManager.doRequest(this.source, this.display, this);
	}
};

//todo rename to activate / deactivate

WindowWidget.prototype.onFocus = function() {
	document.getElementById(this.id + '_header').className = 'title_bar_active';
};

WindowWidget.prototype.onBlur = function() {
	document.getElementById(this.id + '_header').className = 'title_bar_inactive';
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



