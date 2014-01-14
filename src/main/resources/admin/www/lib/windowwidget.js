

function WindowWidget(windowSettings, content)
{
	this.id = windowSettings.id;
	this.height = windowSettings.height;
	this.width = windowSettings.width;
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
	if(typeof windowSettings.ignorePageScroll != 'undefined') {
		this.ignoresPageScroll = windowSettings.ignorePageScroll;
	} else {
		this.ignoresPageScroll = true;
	}
}




subclass(Widget, WindowWidget);
//WindowWidget.instance = new Function('id','return widgetengine.deployWidget(new WindowWidget(id))');



WindowWidget.prototype.alertSomething = function(value)
{
	alert(value);
};


WindowWidget.prototype.process = function(value)
{
	alert(value);
};


WindowWidget.prototype.draw = function(left, top)// + mode
{
	if(top != null) this.top = top;
	if(left != null) this.left = left;
	if(this.element != null)
	{
		this.element.style.visibility = 'hidden';

		this.element.style.position = 'absolute';
		this.element.style.top = this.top + 'px';
		this.element.style.left = this.left + 'px';
		if(typeof this.height != 'undefined') {
			this.element.style.height = this.height + 'px';
		}
		if(typeof this.width != 'undefined') {
			this.element.style.width = this.width + 'px';
		}
		this.element.style.margin = '0px';
		this.element.style.padding = '0px';
		this.element.style.background = 'white';
		this.element.style.border = '1px #AAAAAA solid';
		this.element.style.valign = 'top';

		this.writeHTML();
		this.element.style.visibility = 'visible';
	}

};

WindowWidget.prototype.writeHTML = function()
{
	//todo height must be larger than 32
	if(this.element)
	{
		var result = '<div id="' + this.id + '_header" style="margin: 0px; padding: 0px; top: 0px; left: 0px; height: 20px; ' +
					  'background: blue; color: white; font: bold 1em Arial">' +
					 '<div style="display: inline; float: left; padding: 2px; padding-left: 5px;">' + this.title + '</div><img src="' + contextroot + 'img/close_window.gif" style="display: inline; float: right;"' +
					 ' onclick="widgetengine.destroyWidget(\'' + this.getId() + '\')"></div>' +
					 '<div id="' + this.id + '_contents" style="margin: 0px; padding: 5px; top: 0px; left: 0px; background: white; color: black; font: normal 1em Arial; border: 1px white solid">';

		result += this.content;

		result += '</div>';

		this.element.innerHTML = result;
		this.dragActivationElement = document.getElementById(this.id + '_header');
		this.contentElement = document.getElementById(this.id + '_contents');
		if(typeof this.height != 'undefined') {
			this.contentElement.style.height = (this.height - 32) + 'px';
		}
		if(typeof this.width != 'undefined') {
			this.contentElement.style.width = (this.width - 12) + 'px';
			this.dragActivationElement.style.width = this.width;
		}
	}
};



//destructor
WindowWidget.prototype.onDestroy = function()
{
	//save state
};


WindowWidget.prototype.onDeploy = function()
{
	widgetengine.registerDraggableWidget(this);
	//load state
	this.refresh();
};

WindowWidget.prototype.refresh = function()
{
	//load state
	if(this.source != null)
	{
		ajaxRequestManager.doRequest(this.source, this.display, this);
	}
};

//todo rename to activate / deactivate


WindowWidget.prototype.onFocus = function()
{
	document.getElementById(this.id + '_header').style.background = 'blue';
};

WindowWidget.prototype.onBlur = function()
{
	document.getElementById(this.id + '_header').style.background = 'gray';
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



