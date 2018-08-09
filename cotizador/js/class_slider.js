/******************************************************************************
Name:    Slider Control
Version: 1.0 (March 18 2008)
Author:  Sebastian Brink
Contact: http://www.quadrifolia.de

Licence:
Slider Control is licensed under a Creative Commons Attribution-Noncommercial 
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

// --- nomenclature

var id_slider =					'slider';
var id_sliderTrack =			'slider_track';
var id_sliderHandle =			'slider_handle';
var id_sliderLeftIcon =			'slider_left_icon';
var id_sliderRightIcon =		'slider_right_icon';

// --- class

if(!Control) var Control = {};
Control.Slider = Class.create();

Control.Slider.prototype = {
	
	initialize: function(target, options) {
		
		var slider = this;
		
		// options
		this.options = options || {};
		
		this.id_slider = this.options.slider;
		this.id_sliderTrack = this.options.sliderTrack;
		this.id_sliderHandle = this.options.sliderHandle;
		this.id_sliderLeftIcon = this.options.sliderLeftIcon;
		this.id_sliderRightIcon = this.options.sliderRightIcon;
		
		this.target = $(target);
		
		// create DOM nodes
		if(!$(this.id_slider)) {
			
			var objSlider = new Element('div', { id: this.id_slider });
			this.target.appendChild(objSlider);
			
			var objSliderLeftIcon = new Element('div', { id: this.id_sliderLeftIcon });
			objSlider.appendChild(objSliderLeftIcon);
			
			var objSliderTrack = new Element('div', { id: this.id_sliderTrack });
			objSlider.appendChild(objSliderTrack);
			
			var objSliderHandle = new Element('div', { id: this.id_sliderHandle });
			objSliderTrack.appendChild(objSliderHandle);
			
			var objSliderRightIcon = new Element('div', { id: this.id_sliderRightIcon });
			objSlider.appendChild(objSliderRightIcon);
			
		}
		
		this.sliderWidth = parseInt(Element.getStyle(this.id_sliderTrack, 'width'));
		this.handleWidth = parseInt(Element.getStyle(this.id_sliderHandle, 'width'));
		this.iconsWidth = parseInt(Element.getStyle(this.id_sliderLeftIcon, 'width'));
		
		this.track = $(this.id_sliderTrack);
		this.handle = $(this.id_sliderHandle);
		
		// events
		this.eventMouseDownHandle = this.startDrag.bindAsEventListener(this);
		this.eventMouseDownTrack = this.setSlider.bindAsEventListener(this);
		this.eventMouseUp   = this.endDrag.bindAsEventListener(this);
		this.eventMouseMove = this.moveSlider.bindAsEventListener(this);
			
		Event.observe(this.handle, 'mousedown', this.eventMouseDownHandle);
		Event.observe(this.track, 'mousedown', this.eventMouseDownTrack);
		
		this.active = false;
		this.initialized = true;
		
		this.draw(this.options.sliderValue);
	},
	
	startDrag: function(e) {
		this.position = parseInt(this.handle.style.marginLeft) || 0;
		this.startX = e.clientX - this.position;
		Event.observe(document, 'mousemove', this.eventMouseMove);
		Event.observe(document, 'mouseup', this.eventMouseUp);
		this.active = true;
	},
	
	endDrag: function(e) {
		if (this.active === true) {
			Event.stopObserving(document, 'mousedown', this.eventMouseMove);
			Event.stopObserving(document, 'mouseup', this.eventMouseUp);
			this.active = false;
		}
	},
	
	setSlider: function(e) {
		var element, offset;
		
		if (e.target) {
			element = e.target;
		} else if (e.srcElement) {
			element = e.srcElement;
		}
		
		// defeat Safari bug
		if (element.nodeType == 3) {
			element = element.parentNode;
		}
		
		if (element.id == this.id_sliderTrack) {
			if(e.layerX){
				offset = parseInt(e.layerX) - this.iconsWidth - (this.handleWidth/2);
			} else if (e.offsetX) {
				offset = parseInt(e.offsetX) - (this.handleWidth/2);
			}
			
			if (offset < 0) {
				offset = 0;
			}
			
			if (offset > (this.sliderWidth-this.handleWidth)) {
				offset = (this.sliderWidth-this.handleWidth);
			}
			
			this.options.sliderValue = offset / (this.sliderWidth-this.handleWidth);
			
			this.draw();
		}
	},
	
	moveSlider: function(e) {
		if (this.active === true) {
			disableSelection();

			this.posX = e.clientX;
			this.marginLeft = this.posX - this.startX;
			
			if (this.marginLeft < 0) {
				this.marginLeft = 0;
			}
			
			if (this.marginLeft > (this.sliderWidth-this.handleWidth)) {
				this.marginLeft = (this.sliderWidth-this.handleWidth);
			}
			
			this.options.sliderValue = this.marginLeft / (this.sliderWidth-this.handleWidth);
			
			this.draw();
		}
	},
	
	draw: function() {
		
		this.handle.setStyle({
			marginLeft: this.options.sliderValue * (this.sliderWidth-this.handleWidth) + 'px'
		});
		
		if (this.initialized && this.options.onSlide) {
			this.options.onSlide(this.options.sliderValue);
		}
	}
	
}

// --- END