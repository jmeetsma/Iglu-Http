
function MenuWidget(id, content) {
	Widget.call(this);
	this.id = id;
	this.source = null;
	if(typeof(content) != 'undefined') {
		this.content = content;
	} else {
		this.content = null;
	}
}

subclass(MenuWidget, Widget);


MenuWidget.prototype.allowHorizontalResize = function() {
	if(this.resizeDirections.indexOf('e') == -1) {
		this.resizeDirections += 'e';
	}
};

MenuWidget.prototype.allowVerticalResize = function() {
	if(this.resizeDirections.indexOf('s') == -1) {
		this.resizeDirections += 's';
	}
};

MenuWidget.prototype.alertSomething = function(value) {
	alert(value);
};

MenuWidget.prototype.process = function(value) {
	alert(value);
};

MenuWidget.prototype.draw = function(left, top) {
	if(this.element != null) {
		this.element.style.visibility = 'hidden';
		this.setSizeAndPosition();
		this.writeHTML();
		this.element.style.visibility = 'visible';
	}
};


MenuWidget.prototype.setSizeAndPosition = function() {

};


MenuWidget.prototype.writeHTML = function() {

	if(this.element && this.menu) {
		this.createTree(this.menu, this.element, false);
	}

};

MenuWidget.prototype.createTree = function(tree, container, insub) {
    for(var i in tree) {
        var item = tree[i];
        var itemId = container.id + '.' + item.id;
        var itemLabel = item.label;
        if(typeof(item.link) != 'undefined') {
        	var onclick = item.link_onclick;
//        	itemLabel = '<a href="' + item.link + '" target="' + item.link_target + '"' +  (onclick != null ? ' onclick="' + onclick + '"' : '') + '>' + itemLabel + '</a>';
			if(item.link.endsWith('.js')) {
        		itemLabel = '<a onclick="linkToJson(\'' + item.link + '\', \'' + item.link_target + '\', \'' + itemLabel + '\');\">' + itemLabel + '</a>';
			} else {
        		itemLabel = '<a onclick="linkToHtml(\'' + item.link + '\', \'' + item.link_target + '\', \'' + itemLabel + '\');\">' + itemLabel + '</a>';
        	}
        }
        var itemDiv = document.createElement('div');
        if(typeof(item.item_class_name) != 'undefined') {
			itemDiv.className = item.item_class_name;
        }
        container.appendChild(itemDiv);
        if(typeof(item.submenu) != 'undefined') {

            var branchDiv = document.createElement('div');
            branchDiv.setAttribute('id', itemId);

            itemDiv.onmouseover = new Function('showSubmenu(\'' + itemId + '\');');
            itemDiv.onmouseout = new Function('hideSubmenu(\'' + itemId + '\');');

            branchDiv.style.visibility = 'hidden';

			if(typeof(item.submenu_class_name) != 'undefined') {
				branchDiv.className = item.submenu_class_name;
			}


            itemDiv.innerHTML = itemLabel;
            itemDiv.appendChild(branchDiv);
            this.createTree(item.submenu, branchDiv, true);
        } else {
            itemDiv.innerHTML = itemLabel;
        }
    }
}


function showSubmenu(branchId) {
    var element = document.getElementById(branchId);
    element.style.visibility = 'visible';
	element.style.zIndex = 999;
}

function hideSubmenu(branchId) {
    var element = document.getElementById(branchId);
    element.style.visibility = 'hidden';
}



MenuWidget.prototype.refresh = function() {
	if(this.source != null) {
		ajaxRequestManager.doRequest(this.source, this[this.source_load_action], this);
	}
};


MenuWidget.prototype.onDestroy = function() {
	//save state
};


MenuWidget.prototype.evaluate = function(contents, menuWidget) {

	//alert(contents);
	menuWidget.menu = eval(contents);
	menuWidget.writeHTML();
	//save state
};


MenuWidget.prototype.onDeploy = function() {
	this.refresh();
};




//todo rename to activate / deactivate

MenuWidget.prototype.onFocus = function() {
};

MenuWidget.prototype.onBlur = function() {
};


MenuWidget.prototype.display = function(content, element)
{
};
