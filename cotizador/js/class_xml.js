/******************************************************************************
Name:    processXML
Version: 1.0 (December 20 2007)
Author:  Sebastian Brink
Contact: http://www.quadrifolia.de

Licence:
processXML is licensed under a Creative Commons Attribution-Noncommercial 
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

processXML = Class.create();

processXML.prototype = {

	initialize: function(options) {
		
		// vars
		var xml = this;
		var req;
		
		this.isIE = false;
		this.tags = new Array();
		this.tmpTags = '';
		this.result = new Array();
		
		this.options = options || {};
		this.initialized = true;

	},
	
	load: function(url) {
	    // native XMLHttpRequest object
	    if (window.XMLHttpRequest) {
	        req = new XMLHttpRequest();
	        req.onreadystatechange = this.process;
	        req.open("GET", url, true);
	        req.send(null);
	    // IE on Windows ActiveX version
	    } else if (window.ActiveXObject) {
	        this.isIE = true;
	        req = new ActiveXObject("Microsoft.XMLHTTP");
	        if (req) {
	            req.onreadystatechange = this.process;
	            req.open("GET", url, true);
	            req.send();
	        }
	    }
	},
	
	findTagNames: function(node) {
		if (node.tagName) {
			if (this.tmpTags.search(node.tagName) == -1) {	
				if (this.tmpTags == '') {
					this.tmpTags = node.tagName;
				} else {
					this.tmpTags = this.tmpTags + ' ' + node.tagName;
				}
			}
		}
		if (node.hasChildNodes()) {
			for (var i=0, j=node.childNodes.length; i<j; i+=1) {
				if (node.childNodes[i].tagName) {
					if (this.tmpTags.search(node.childNodes[i].tagName) == -1) {
						this.tmpTags = this.tmpTags + ' ' + node.childNodes[i].tagName;
					}
				}
				if (node.childNodes[i].hasChildNodes()) {
					this.findTagNames(node.childNodes[i]);
				}
			}
		}
	},
	
	process: function() {
	    // only if req shows "loaded"
	    if (req.readyState == 4) {
	        // only if "OK"
	        if (req.status == 200) {
				var type = req.responseXML.getElementsByTagName("type");
				var content = req.responseXML;
				if (content.hasChildNodes()) {
					myXML.tmpTags = '';
					for (var i=0, j=content.childNodes.length; i<j; i+=1) {
						myXML.findTagNames(content.childNodes[i]);
					}
					myXML.buildContent();
			    }
	         } else {
	            alert("There was a problem retrieving the XML data:\n" + req.statusText);
	         }
	    }
	},
	
	buildContent: function() {
		
		// all available content tags will be collected in this.result['tags']
		
		// vars
		var whiteSpace = new RegExp(/[\f\n\r\t\u00A0\u2028\u2029]/g);
		var resultTags = new Array();
		
		// tags
		this.tags = this.tmpTags.split(' ');
		
		// collect content
		for (var i=0, j=this.tags.length; i<j; i+=1) {		
			var items = req.responseXML.getElementsByTagName(this.tags[i]);
			var itemsArray = new Array();
			for (var x=0, y=items.length; x<y; x+=1) {
				if ((items[x].firstChild.nodeType == 3) && (!whiteSpace.test(items[x].firstChild.nodeValue))) {
					itemsArray.push(items[x].firstChild.nodeValue);
				}
			}
			if (itemsArray.length > 0) {
				resultTags.push(this.tags[i]);
				this.result[this.tags[i]] = itemsArray;
			}
		}
		this.result['tags'] = resultTags;
		
		if (this.initialized && this.options.onBuild) {
			this.options.onBuild(this.result);
		}

	}
	
}

// --- END