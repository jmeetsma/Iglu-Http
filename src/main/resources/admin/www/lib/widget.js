///////////////////////
//                   //
//  Abstract Widget  //
//   (base class)    //
//                   //
///////////////////////

function Widget(settings, content) {
	this.constructWidget(settings, content);
}

Widget.prototype.constructWidget = function(settings) {

	this.id = null;
	this.cssClassName = null;

	if(typeof settings == 'undefined') {
        throw 'widget ' + this.constructor.name + ' must have settings';
	}
	for(var name in settings) {
      	this.set(name, settings[name], this[name]);
    }
	if(this.id == null) {
        throw 'widget ' + this.constructor.name + ' must have an id';
	}
	this.source_load_action = 'display';
}

//TODO move to settings Object

Widget.prototype.set = function(name, value, defaultValue) {
	if(typeof this[name] == 'undefined') {
		throw('attribute "' + name + '" is not declared in ' + this.constructor.name);
	} else if(typeof value != 'undefined') {
		this[name] = value;
	} else if(typeof defaultValue != 'undefined') {
		this[name] = defaultValue;
	}
};


Widget.prototype.getId = function()
{
	return this.id;
};



Widget.prototype.setDOMElement = function(element)
{
	this.element = element;
	if(this.cssClassName != null) {
		element.className = this.cssClassName;
	}
};


Widget.prototype.getDOMElement = function()
{
	return this.element;
};



Widget.prototype.onDestroy = function()
{
};


Widget.prototype.onDeploy = function()
{
};


Widget.prototype.refresh = function()
{
}

Widget.prototype.onFocus = function()
{
};


Widget.prototype.onBlur = function()
{
};

Widget.prototype.processJavaScript = function(input)
{

//	alert('processJavaScript:' + input);
	try
	{
		eval('' + input);
	}
	catch(e)
	{
		alert('Error: ' + e.message);
	}
};


Widget.prototype.saveState = function() //JSON?
{
};

Widget.prototype.display = function(content, element)
{
	if(element != null)
	{
		element.content = content; /// ???
		document.getElementById(element.id).innerHTML = content;
	}
	else
	{
		this.content = content;
		document.getElementById(this.id).innerHTML = content;
	}
};

Widget.prototype.evaluate = function(content, element) {
	eval(content);
};


//TODO separate content (WidgetContent) from position and size (FrameWidget)

///////////////////////
//                   //
//   WidgetContent   //
//                   //
///////////////////////



function WidgetContent(settings, content) {
	this.constructWidgetContent(settings, content);
}

subclass(WidgetContent, Widget);


WidgetContent.prototype.constructWidgetContent = function(settings, content) {

	this.source = null;
	this.content = null;
	this.source_load_action = 'display';
	this.hasHeader = false;
	this.title = '-';

	//invoke super
	this.constructWidget(settings);

	this.set('content', content);

	if(typeof settings.stickToWindowHeightMinus != 'undefined') {
		this.stickToWindowHeightMinus = settings.stickToWindowHeightMinus;
	}

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

	if(typeof settings.source != 'undefined') {
		this.source = settings.source;
	} else {
		this.source = null;
	}
	if(typeof settings.source_load_action != 'undefined' && settings.source_load_action != null) {
		this.source_load_action = settings.source_load_action;
	} else {
		if(typeof this.source_load_action == 'undefined') {
			this.source_load_action = 'display';
		 }
	}
	log('source load action of ' + this.id  + ' is ' + this.source_load_action);
	if(typeof content != 'undefined') {
		this.content = content;
	} else {
		this.content = 'loading...';
	}

}




WidgetContent.prototype.onDestroy = function()
{
};


WidgetContent.prototype.onDeploy = function() {
	this.refresh();
};


WidgetContent.prototype.refresh = function() {
	//load state
    if(this.content != null) {
      	this.writeHTML();
    }
	if(this.source != null) {
		ajaxRequestManager.doRequest(this.source, this[this.source_load_action], this);
	}
};


WidgetContent.prototype.writeHTML = function() {
	this.element.innerHTML = this.content;
};