/******************************************************************************
Name:    Skimmer Control
Version: 1.0 (March 17 2008)
Author:  Sebastian Brink
Contact: http://www.quadrifolia.de

Licence:
Skimmer Control is licensed under a Creative Commons Attribution-Noncommercial 
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

// --- globals

var skimmerMaxWidth =			160;
var skimmerMaxHeight =			160;

// --- nomenclature

var class_Skimmer = 			'skimmer';
var class_SkimmerWrapper = 		'skimmerFrame';
var class_SkimmerMask = 		'skimmerMask';
var class_SkimmerTitle = 		'skimmerTitle';
var class_SkimmerCounter = 		'skimmerCounter';
var class_SkimmerMarker = 		'skimmerMarker';

// --- class

if(!Control) var Control = {};
Control.Skimmer = Class.create();

Control.Skimmer.prototype = {

	initialize: function(options) {
		
		var skimmer = this;
		
		// options
		this.options = options || {};
		this.marker = this.options.marker;
		this.indicator = this.options.indicator;
		this.size = this.options.size;
		
		// vars
		this.counter = 0;
		
		// collect the skimmers
		this.anchors = $$('div.'+this.marker);
		this.skimmerCounter = this.anchors.length;
			
		for (var i=0, j=this.anchors.length; i<j; i+=1) {
				
			// create listner
			Event.observe(this.anchors[i], 'mousemove', this.move.bindAsEventListener(this));
			Event.observe(this.anchors[i], 'mouseout', this.reset.bindAsEventListener(this));
			
			// create indicator
			if (this.indicator === true) {
				var skimmerMarker = new Element('div', { 'class': class_SkimmerMarker });
				this.anchors[i].appendChild(skimmerMarker);
			}

		}
		
	},
	
	move: function(e) {
		e = e||window.event;
		
		var activeSkimmer = $(Event.element(e)).up('.'+class_Skimmer);
		if (!activeSkimmer) {
			var activeSkimmer = Event.element(e);
		}
		
		// reset all other skimmers - fix for bubbling bug
		for (var i=0; i<this.skimmerCounter; i+=1) {
			var tmpSkimmerId = class_Skimmer + '_' + i;
			if ((activeSkimmer.id != tmpSkimmerId) && ($(tmpSkimmerId).lastChild.getStyle('display') != 'none')) {
				
				$(tmpSkimmerId).setStyle({
					backgroundPosition: '0px 0px'
				});
				
				$(tmpSkimmerId).lastChild.setStyle({
					display: 'none'
				});

				this.counter = 0;
			}
		}
		
		// get skimmer size
		if (this.counter == 0) {
			var imgSrc = activeSkimmer.getStyle('backgroundImage').split('url(');
			imgSrc = imgSrc[1].split(')');
			imgSrc = imgSrc[0];
		
			var image = new Image();
			image.src = imgSrc;
		
			this.counter = image.height / this.size;
		}
		
		// calc new position
		var mouseX = Event.pointerX(e)
		var offset = findPos(activeSkimmer);
		var imgPosition = Math.round((mouseX - offset[0]) / (this.size / (this.counter - 1)));
		
		// set indicator
		if (this.indicator === true) {
			activeSkimmer.lastChild.setStyle({
			  display: 'block'
			});
		}
		
		// move items
		this.moveImage(activeSkimmer, imgPosition);
	},
	
	moveImage: function(activeSkimmer, imgPosition) {
		
		// move indicator
		if (this.indicator === true) {
			if(imgPosition != (this.counter - 1)) {
				activeSkimmer.lastChild.setStyle({
				  width: Math.floor(this.size / this.counter) + 'px'
				});
			} else {
				activeSkimmer.lastChild.setStyle({
				  width: Math.floor(this.size / this.counter) + (this.size % Math.floor(this.size / this.counter)) + 'px'
				});
			}
			activeSkimmer.lastChild.setStyle({
			  left: (this.size / this.counter) * imgPosition + 'px'
			});
		}
	
		// move image
		activeSkimmer.setStyle({
		  backgroundPosition: '0px ' + (-this.size * imgPosition) + 'px'
		});
		
	},
	
	reset: function(e) {
		e = e||window.event;
		var eventTarget = e.relatedTarget || e.toElement;

		if ((eventTarget.getAttribute('class') != class_SkimmerMarker) && (eventTarget.getAttribute('class') != class_SkimmerMask)) {
			var activeSkimmer = $(Event.element(e)).up('.'+class_Skimmer);
			if (!activeSkimmer) {
				var activeSkimmer = Event.element(e);
			}
			this.moveImage(activeSkimmer, 0);
			this.counter = 0;
			if (this.indicator === true) {
				activeSkimmer.lastChild.setStyle({
				  display: 'none'
				});
			}
		}
	}
	
}

// --- END