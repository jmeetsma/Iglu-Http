/*
Hoe moet het werken?
-


*/


createPopup = function(element) {


	var coords = getElementPositionInWindow(element);


	var contentSettings = new Object();
	contentSettings.id = 'popup_contents';
	contentSettings.title = 'POPUP';
	contentSettings.source = 'content3.html';

	var content = new WidgetContent(contentSettings, 'TEST TEST');

	var  popupSettings = new Object();
	popupSettings.id = 'popup';
	popupSettings.top = coords.y + 10;
	popupSettings.left = coords.x + 20;
	var popup = new PopupWidget(popupSettings, content, element);

//	alert(coords.x);

	WidgetManager.instance.deployWidget(popup);
}

openWindowWithPanel = function(data, dataId) {
	var  panelSettings = new Object();
	panelSettings.id = dataId + '_contents_x';
	panelSettings.title = dataId;
	panelSettings.data = data;
	panelSettings.source = 'content.html';
	//panelSettings.initFunction = initWindow;

	var navigation_panel = new WidgetContent(panelSettings, 'TEST TEST');

	var  windowSettings = new Object();
	windowSettings.id = dataId;

    var windowWidget = new WindowWidget(windowSettings, navigation_panel);
   	widgetmanager.deployWidget(windowWidget);

}



openWindow = function(data, dataId) {
	var  windowSettings = new Object();
	windowSettings.id = dataId;
	windowSettings.title = dataId;
	windowSettings.data = data;
	windowSettings.initFunction = initWindow;
    ajaxRequestManager.doRequest('content.html', createWindowWidget, windowSettings, null);
}

function initWindow() {

}







//TODO move to widgetmanager
createWindowWidget = function(responseMessage, windowSettings) {
    var element = document.createElement('html');
    element.innerHTML = '' + responseMessage;

    var nodeNames = '';
    for(var i = 0; i < element.childNodes.length; i++) {
        nodeNames += element.childNodes[i].nodeName + '\n';
    }

	if(!widgetmanager.widgetExists(windowSettings.id)) {

	    var windowWidget = new WindowWidget(windowSettings, element.getElementsByTagName('body')[0].innerHTML);
    	widgetmanager.deployWidget(windowWidget);

		if(typeof windowWidget.init != 'undefined') {
			windowWidget.init(windowSettings.data);
		}
	} else {
		widgetmanager.activateCurrentWidget(windowSettings.id);
	}

}




function createPanels() {
try {
	var settings = new Object();

    settings.id = 'logstream';
    settings.width = 400;
    settings.height = 700;
    var logwidget = new LogStreamWidget(settings);

    settings.width = null;
    settings.height = null;


	settings.hasHeader = true;
	settings.title = 'code references';
	settings.stickToWindowHeightMinus = 90;  //windowSizeReduction/Difference
	settings.id = 'code_links';

	var code_links_panel = new PanelWidget(settings, logwidget);
	settings.id = 'code';
	settings.title = 'source';
	var code_panel = new PanelWidget(settings, '');
	settings.id = 'result_split';
	var codeSplitPanel = new VerticalSplitPanelWidget(settings, 375, code_links_panel, code_panel);

	settings.id = 'navigation';
	settings.title = 'navigation';
	settings.source = 'content.html';
//	settings.source = 'code/directories.js';
//	settings.source_load_action = 'evaluate';
	var navigation_panel = new PanelWidget(settings, '');

	settings.source = null;

	settings.id = 'display_split';
	var displaySplitPanel = new VerticalSplitPanelWidget(settings, 225, navigation_panel, codeSplitPanel);

	settings.stickToWindowHeightMinus = null;

	settings.hasHeader = false;
	settings.id = 'menu';
	settings.contents = '<div>menu</div>';

	var menu_panel = new PanelWidget(settings, settings.contents);
	menu_panel.set('panelContentClass', 'menupanelcontents');

	settings.id = 'splitpanel';
	var menuSplitPanel = new HorizontalSplitPanelWidget(settings, 40, menu_panel, displaySplitPanel);

	WidgetManager.instance.deployWidget(menuSplitPanel);

	createMenu();
	} catch (e) {
		alert(e);
	}
}




function createMenu() {

	var menuElement = document.getElementById('top_menu');
	var topMenuWidget = new MenuWidget('top_menu');

/*	topMenuWidget.set('source', 'menu.js');
	topMenuWidget.set('source_load_action', 'evaluate');

	WidgetManager.instance.deployWidgetInContainer(menuElement, topMenuWidget);
  */
	ajaxRequestManager.clearHistory();
}






