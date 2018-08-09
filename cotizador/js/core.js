/******************************************************************************
Name:    Basic Functions
Version: 0.9 (March 26 2008)
Author:  Sebastian Brink
Contact: http://www.quadrifolia.de

Licence:
Basic Functions is licensed under a Creative Commons Attribution-Noncommercial 
3.0 License (http://creativecommons.org/licenses/by-nc/3.0/).

You are free:
	* to copy, distribute and transmit the work
	* to adapt the work

Under the following conditions:
	* Attribution. You must attribute the work in the manner specified by 
	  the author or licensor.
	* Noncommercial. You may not use this work for commercial purposes.

* For any reuse or distribution, you must make clear to others the license 
  terms of this work. 
* Any of the above conditions can be waived if you get permission from the
  copyright holder.
* Nothing in this license impairs or restricts the author's moral rights.

Your fair dealing and other rights are in no way affected by the above.
******************************************************************************/

/******************************************************************************
  get the screensize
******************************************************************************/

function getScreenSize() {
	var x = y = 0;
	if (self.innerHeight) {
		// all except Explorer
		x = self.innerWidth;
		y = self.innerHeight;
	} else if (document.documentElement && document.documentElement.clientHeight) {
		// Explorer 6 Strict Mode
		x = document.documentElement.clientWidth;
		y = document.documentElement.clientHeight;
	} else if (document.body) {
		// other Explorers
		x = document.body.clientWidth;
		y = document.body.clientHeight;
	}

	return [x,y];
}

/******************************************************************************
  get the total site dimensions
******************************************************************************/

function getSiteDimensions() {
	
	var x = y = 0;
	var screensize = getScreenSize();
	
	if (window.innerHeight && window.scrollMaxY) {
		x = window.innerWidth + window.scrollMaxX;
		y = window.innerHeight + window.scrollMaxY;
	} else if (document.body.scrollHeight > document.body.offsetHeight) {
		// all but Explorer Mac
		x = document.body.scrollWidth;
		y = document.body.scrollHeight;
	} else if (document.documentElement && document.documentElement.scrollHeight > document.documentElement.offsetHeight) {
		// Explorer 6 strict mode
		x = document.documentElement.scrollWidth;
		y = document.documentElement.scrollHeight;
	} else {
		// Explorer Mac...would also work in Mozilla and Safari
		x = document.body.offsetWidth;
		y = document.body.offsetHeight;
	}
	
	// for small pages with total height less then height of the viewport
	if(y < screensize[1]) {
		y = screensize[1];
	}

	// for small pages with total width less then width of the viewport
	if(x < screensize[0]) {
		x = screensize[0];
	}

	return [x,y];
}

/******************************************************************************
  find the position of an element (http://www.quirksmode.org/js/findpos.html)
******************************************************************************/

function findPos(obj) {
	var curleft = curtop = 0;
	if (obj.offsetParent) {
		curleft = obj.offsetLeft
		curtop = obj.offsetTop
		while (obj = obj.offsetParent) {
			curleft += obj.offsetLeft
			curtop += obj.offsetTop
		}
	}
	return [curleft,curtop];
}

/******************************************************************************
  disable selection of site elements
******************************************************************************/

function disableSelection(){
	if(window.getSelection){
		if(navigator.userAgent.indexOf('AppleWebKit/') > -1){
			if(window.devicePixelRatio) {
				window.getSelection().removeAllRanges();
			} else {
				window.getSelection().collapse();
			}
		}else{
			window.getSelection().removeAllRanges();
		}
	}else if(document.selection){
		if(document.selection.empty){
			document.selection.empty();
		}else if(document.selection.clear){
			document.selection.clear();
		}
	}

	var element = document.body;
	if(navigator.userAgent.indexOf('Gecko') > -1 && navigator.userAgent.indexOf('KHTML') == -1){
		element.style.MozUserSelect = "none";
	}else if(navigator.userAgent.indexOf('AppleWebKit/') > -1){
		element.style.KhtmlUserSelect = "none"; 
	}else if(!!(window.attachEvent && !window.opera)){
		element.unselectable = "on";
		element.onselectstart = function() {
		        return false;
		};
	}
}

/******************************************************************************
  enable selection of site elements
******************************************************************************/

function enableSelection(){
	var element = document.body;
	if(navigator.userAgent.indexOf('Gecko') > -1 && navigator.userAgent.indexOf('KHTML') == -1){ 
		element.style.MozUserSelect = "";
	}else if(navigator.userAgent.indexOf('AppleWebKit/') > -1){
		element.style.KhtmlUserSelect = "";
	}else if(!!(window.attachEvent && !window.opera)){
		element.unselectable = "off";
		element.onselectstart = function() {
		        return true;
		};
	}else{
		return false;
	}
	return true;
}

/******************************************************************************
  clear nodes
******************************************************************************/

function clearContent(id) {
    var content = $(id);
    while(content.hasChildNodes()){
        content.removeChild(content.childNodes[0]);
    }    
}

// --- END