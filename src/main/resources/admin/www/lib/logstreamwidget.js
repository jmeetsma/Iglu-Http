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

function LogStreamSettings(id, width, height, stickToWindowHeightMinus, source, hasHeader, title) {
	this.id = id;
	this.width = width;
	this.height = height;
	this.stickToWindowHeightMinus;
	this.source = source;
	this.source_load_action = 'loadEntries';
	this.hasHeader = hasHeader;
	this.title = title;
}


function LogStreamWidget(settings, content) {
	this.bufferSize = 100;
	this.lines = new Array();
	this.cssClassName = 'logstream';
	this.source_load_action = 'loadEntries';
	this.constructLogStreamWidget(settings, content);
}

subclass(LogStreamWidget, FrameWidget);

LogStreamWidget.prototype.constructLogStreamWidget = function(settings, content) {
	this.constructFrameWidget(settings, content);
};



LogStreamWidget.prototype.writeHTML = function() {

	this.content = '';
	for(var i in this.lines) {
		this.content += (this.lines[i] + '<br>\n');
	}
	this.element.innerHTML = this.content;
	this.element.scrollTop = 5000;
};


LogStreamWidget.prototype.append = function(line) {

	this.lines.push(line);
	if(this.lines.length > this.bufferSize) {
		this.lines.splice(0,1);
	}
	this.writeHTML();
};

LogStreamWidget.prototype.onTimer = function(line) {

	this.refresh();
};

LogStreamWidget.prototype.loadEntries = function(entries, logStreamWidget) {
	var entryStrings = eval(entries);
	for(var[i] in entryStrings) {
		logStreamWidget.append(entryStrings[i]);
	}
}



LogStreamWidget.prototype.onDestroy = function() {
	log('log stream widget destroyed');
	WidgetManager.instance.unregisterTimerListener(this);
	//save state
};

LogStreamWidget.prototype.setSizeAndPosition = function() {

	if(typeof this.width != null) {
		this.element.style.width = this.width + 'px';
	}	if(typeof this.height != null) {
		this.element.style.height = this.height + 'px';
	}
};


