/******************************************************************************
Name:    Scroller Control
Version: 0.9 (March 27 2008)
Author:  Sebastian Brink
Contact: http://www.quadrifolia.de

Licence:
Scroller Control is licensed under a Creative Commons Attribution-Noncommercial 
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

var setting_scroller_arrow =			'both'; 		// top, bottom, both
var setting_track_position = 			'right'; 		// right, left
var setting_offset_top =				-7;				// the top handle offset (depends on the used graphics)
var setting_offset_bottom =				-7;				// the bottom handle offset (depends on the used graphics)
var setting_default_mousewhell_off = 	false;			// turns the default mousewhell actions for the whole page off
var setting_mousewhell_trigger = 		'container';	// document, container (container turns the default mousewhell actions off if the cursor is inside the container)

// --- nomenclature

var id_scroller_container =				'scroller_container';
var id_scroller_track = 				'scroller_track';
var id_scroller_up =					'scroller_up';
var id_scroller_down = 					'scroller_down';
var id_scroller_handle = 				'scroller_handle';
var id_scroller_handle_top =			'scroller_handle_top';
var id_scroller_handle_middle = 		'scroller_handle_middle';
var id_scroller_handle_bottom =			'scroller_handle_bottom';

// --- class

contentScroller = Class.create();

contentScroller.prototype = {
	
	initialize: function(container, content, options) {
		var scroller = this;
		
		// options
		this.options = options || {};
		
		this.arrowPosition = this.options.arrowPosition;
		this.trackPosition = this.options.trackPosition;
		this.offsetTop = this.options.offsetTop;
		this.offsetBottom = this.options.offsetBottom;
		this.contentLeftMargin = this.options.contentLeftMargin;
		this.contentRightMargin = this.options.contentRightMargin;
		
		// set content
		this.content = $(content);
		
		// create scroller
		if(!$(id_scroller_track)) {
			var objContainer = document.getElementById(container);
			
			var objTrack = new Element('div', { 'id': id_scroller_track });
			objContainer.appendChild(objTrack);
			
			var objArrowUp = new Element('div', { 'id': id_scroller_up });
			objTrack.appendChild(objArrowUp);
			
			var objArrowDown = new Element('div', { 'id': id_scroller_down });
			objTrack.appendChild(objArrowDown);
			
			var objHandle = new Element('div', { 'id': id_scroller_handle });
			objTrack.appendChild(objHandle);
			
			var objHandleTop = new Element('div', { 'id': id_scroller_handle_top });
			objHandle.appendChild(objHandleTop);
			
			var objHandleMiddle = new Element('div', { 'id': id_scroller_handle_middle });
			objHandle.appendChild(objHandleMiddle);
			
			var objHandleBottom = new Element('div', { 'id': id_scroller_handle_bottom });
			objHandle.appendChild(objHandleBottom);
			
			// set styles
			this.containerWidth = parseInt(Element.getStyle(objContainer, 'width'));
			this.trackHeight = parseInt(Element.getStyle(objContainer, 'height'));
			this.trackWidth = parseInt(Element.getStyle(objTrack, 'width'));
			this.handleCapTopHeight = parseInt(Element.getStyle(objHandleTop, 'height'));
			this.handleCapBottomHeight = parseInt(Element.getStyle(objHandleBottom, 'height'));
			this.handleHeight = this.handleCapTopHeight + this.handleCapBottomHeight;
			this.arrowUpHeight = parseInt(Element.getStyle(objArrowUp, 'height'));
			this.arrowDownHeight = parseInt(Element.getStyle(objArrowDown, 'height'));
			
			objTrack.setStyle({
				height: this.trackHeight + 'px',
				top: '0px'
			});
			
			if (this.trackPosition == 'left') {
				objTrack.setStyle({
					left: '0px'
				});
			} else if (this.trackPosition == 'right') {
				objTrack.setStyle({
					left: this.containerWidth - this.trackWidth + 'px'
				});
			}
			
			if (this.arrowPosition == 'top') {
				objHandle.setStyle({
					marginTop: this.arrowUpHeight + this.arrowDownHeight + this.offsetTop + 'px'
				});
				objArrowUp.setStyle({
					marginTop: '0px'
				});
				objArrowDown.setStyle({
					marginTop: this.arrowUpHeight + 'px'
				});
			} else if (this.arrowPosition == 'both') {
				objHandle.setStyle({
					marginTop: this.arrowUpHeight + this.offsetTop + 'px'
				});
				objArrowUp.setStyle({
					marginTop: '0px'
				});
				objArrowDown.setStyle({
					marginTop: this.trackHeight - this.arrowDownHeight + 'px'
				});
			} else if (this.arrowPosition == 'bottom') {
				objHandle.setStyle({
					marginTop: this.offsetTop + 'px'
				});
				objArrowUp.setStyle({
					marginTop: this.trackHeight - this.arrowUpHeight - this.arrowDownHeight + 'px'
				});
				objArrowDown.setStyle({
					marginTop: this.trackHeight - this.arrowDownHeight + 'px'
				});
			}
			
			// set elements
			this.handle = objHandle;
			this.handleMiddle = objHandleMiddle;
			this.track = objTrack;
			this.up = objArrowUp;
			this.down = objArrowDown;
			
			// set event listner
			this.eventMouseDownHandle = this.startDrag.bindAsEventListener(this);
			this.eventMouseDownTrack = this.setHandle.bindAsEventListener(this);
			this.eventMouseUp   = this.endDrag.bindAsEventListener(this);
			this.eventMouseMove = this.moveHandle.bindAsEventListener(this);
			this.eventMouseDownArrowUp = this.startScroll.bindAsEventListener(this, 'up');
			this.eventMouseDownArrowDown = this.startScroll.bindAsEventListener(this, 'down');
			this.eventMouseUpArrow = this.endScroll.bindAsEventListener(this);
			this.eventMouseWheel = this.wheel.bindAsEventListener(this);

			Event.observe(this.handle, 'mousedown', this.eventMouseDownHandle);
			Event.observe(this.track, 'mousedown', this.eventMouseDownTrack);
			Event.observe(this.up, 'mousedown', this.eventMouseDownArrowUp);
			Event.observe(this.down, 'mousedown', this.eventMouseDownArrowDown);
			if (setting_mousewhell_trigger == 'container') {
				Event.observe(objContainer, 'mousewheel', this.eventMouseWheel);
				Event.observe(objContainer, "DOMMouseScroll", this.eventMouseWheel); // Firefox
			} else {
				Event.observe(document, 'mousewheel', this.eventMouseWheel);
				Event.observe(document, "DOMMouseScroll", this.eventMouseWheel); // Firefox
			}
			
		}
		
		// resize
		this.resizeHandle();
		
		this.active = false;
		this.scroll = false;
		this.initialized = true;
	},
	
	startDrag: function(e) {
		this.position = parseInt(this.handle.style.marginTop) || 0;
		this.startY = e.clientY - this.position;
		Event.observe(document, 'mousemove', this.eventMouseMove);
		Event.observe(document, 'mouseup', this.eventMouseUp);
		this.active = true;
		disableSelection();
	},
	
	endDrag: function(e) {
		if (this.active === true) {
			Event.stopObserving(document, 'mousedown', this.eventMouseMove);
			Event.stopObserving(document, 'mouseup', this.eventMouseUp);
			this.active = false;
			enableSelection();
		}
	},
	
	startScroll: function(e, direction) {
		this.scroll = true;
		Event.observe(document, 'mouseup', this.eventMouseUpArrow);
		this.moveArrow(direction);
	},
	
	endScroll: function(e) {
		this.scroll = false;
		Event.stopObserving(document, 'mouseup', this.eventMouseUpArrow);
	},
	
	wheel: function(event) {
		var delta = 0;
		if (!event) event = window.event;

		if (event.wheelDelta) {
			// IE / Opera
			delta = event.wheelDelta / 120;
			if (window.opera) {
				delta = -delta;
			}
		} else if (event.detail) {
			// Mozilla
			//delta = -event.detail/3;
			delta = -event.detail; // scroll faster
		}
		
		if (delta) {
			this.marginTop = (this.marginTop-=delta) || 0;
			this.draw('wheel');
		}
		
		// prevent default actions
		if ((setting_default_mousewhell_off === true) || (setting_mousewhell_trigger == 'container')) {
			if (event.preventDefault) {
				event.preventDefault();
			}
			event.returnValue = false;
		}
	},
	
	setHandle: function(e) {
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
		
		if (element.id == this.track.getAttribute('id')) {
			if(e.layerY){
				this.marginTop = parseInt(e.layerY) - (this.handleHeight/2);
			} else if (e.offsetY) {
				this.marginTop = parseInt(e.offsetY) - (this.handleHeight/2);
			}
			
			this.draw('track');
		}
	},
	
	moveHandle: function(e) {
		if (this.active === true) {

			this.posY = e.clientY;
			this.marginTop = this.posY - this.startY;
			
			this.draw('handle');
		}
	},
	
	moveArrow: function(direction) {
		if (this.scroll === true) {
			
			var scrollStep = Math.round(this.scrollFactor);
			if (scrollStep < 1) {
				scrollStep = 1;
			}
			
			if (direction == 'up') {
				this.marginTop = (this.marginTop-=scrollStep) || 0;
			} else if (direction == 'down') {
				this.marginTop = (this.marginTop+=scrollStep) || 0;
			}
			this.draw('arrow');
			setTimeout('myScroller.moveArrow("'+direction+'")', 0);
		}
	},
	
	draw: function(element) {
		if (this.arrowPosition == 'top') {
			if (this.marginTop < (this.arrowUpHeight + this.arrowDownHeight + this.offsetTop)) {
				this.marginTop = this.arrowUpHeight + this.arrowDownHeight + this.offsetTop;
			}
			if (this.marginTop > (this.trackHeight - this.handleHeight - this.offsetBottom)) {
				this.marginTop = (this.trackHeight - this.handleHeight - this.offsetBottom);
			}
			this.options.scrollerValue = (this.marginTop - this.arrowUpHeight - this.arrowDownHeight - this.offsetTop) / (this.trackHeight - this.handleHeight - this.arrowUpHeight - this.arrowDownHeight - this.offsetTop - this.offsetBottom);
		} else if (this.arrowPosition == 'both') {
			if (this.marginTop < (this.arrowUpHeight + this.offsetTop)) {
				this.marginTop = this.arrowUpHeight + this.offsetTop;
			}
			if (this.marginTop > (this.trackHeight - this.handleHeight - this.arrowDownHeight - this.offsetBottom)) {
				this.marginTop = (this.trackHeight - this.handleHeight - this.arrowDownHeight - this.offsetBottom);
			}
			this.options.scrollerValue = (this.marginTop - this.arrowUpHeight - this.offsetTop) / (this.trackHeight - this.handleHeight - this.arrowUpHeight - this.arrowDownHeight - this.offsetTop - this.offsetBottom);
		} else if (this.arrowPosition == 'bottom') {
			if (this.marginTop < this.offsetTop) {
				this.marginTop = this.offsetTop;
			}
			if (this.marginTop > (this.trackHeight - this.handleHeight - this.arrowUpHeight - this.arrowDownHeight - this.offsetBottom)) {
				this.marginTop = (this.trackHeight - this.handleHeight - this.arrowUpHeight - this.arrowDownHeight - this.offsetBottom);
			}
			this.options.scrollerValue = (this.marginTop - this.offsetTop) / (this.trackHeight - this.handleHeight - this.arrowUpHeight - this.arrowDownHeight - this.offsetTop - this.offsetBottom);
		}
		
		// movement
		if(element == 'track') {
			window.scroller_move = new Animator({
				duration: 500
			}).addSubject(new CSSStyleSubject(
				this.handle, 'margin-top: '+this.marginTop+'px')
			).addSubject(new CSSStyleSubject(
				this.content, 'margin-top: -'+((this.marginTop - (this.arrowUpHeight + this.offsetTop)) * this.scrollFactor)+'px')
			);
		
			window.scroller_move.seekTo(1);
		} else {
			this.handle.style.marginTop = this.marginTop + 'px';
			this.content.style.marginTop = '-' + ((this.marginTop - (this.arrowUpHeight + this.offsetTop)) * this.scrollFactor) + 'px';
		}
		
		if (this.initialized && this.options.onScroll) {
			this.options.onScroll(this.options.scrollerValue);
		}
	},
	
	resizeHandle: function() {
		
		// reset top margins
		// TODO: resize without setting the margins back
		this.content.style.marginTop = '0px';
		
		if (this.arrowPosition == 'top') {
			this.handle.setStyle({
				marginTop: this.arrowUpHeight + this.arrowDownHeight + this.offsetTop + 'px'
			});
		} else if (this.arrowPosition == 'both') {
			this.handle.setStyle({
				marginTop: this.arrowUpHeight + this.offsetTop + 'px'
			});
		} else if (this.arrowPosition == 'bottom') {
			this.handle.setStyle({
				marginTop: this.offsetTop + 'px'
			});
		}
		
		
		// content horizontal position and track visibility
		this.contentHeight = parseInt(Element.getStyle(this.content, 'height'));
		if (this.contentHeight > this.trackHeight) {
			if (this.trackPosition == 'left') {
				this.content.setStyle({
					position: 'absolute',
					left: this.trackWidth + this.contentLeftMargin + 'px',
					width: this.containerWidth - this.trackWidth - this.contentLeftMargin - this.contentRightMargin + 'px'
				});
			} else if (this.trackPosition == 'right') {
				this.content.setStyle({
					position: 'absolute',
					left: this.contentLeftMargin + 'px',
					width: this.containerWidth - this.trackWidth - this.contentLeftMargin - this.contentRightMargin + 'px'
				});
			}
		} else {
			this.content.setStyle({
				position: 'absolute',
				left: this.contentLeftMargin + 'px',
				width: this.containerWidth - this.contentLeftMargin - this.contentRightMargin + 'px'
			});
		}
		
		// content height
		this.contentHeight = parseInt(Element.getStyle(this.content, 'height'));
		
		// handle height
		this.handleHeight = (this.trackHeight * (this.trackHeight - (this.arrowUpHeight + this.offsetTop) - (this.arrowDownHeight + this.offsetBottom))) / this.contentHeight;
		$(id_scroller_handle_middle).setStyle({
			height: (this.handleHeight - this.handleCapTopHeight - this.handleCapBottomHeight) + 'px'
		});
		
		// track visibilty
		if ((this.contentHeight > this.trackHeight) && (Element.getStyle(id_scroller_track, 'display') == 'none')) {
			this.track.setStyle({
				display: 'block'
			});
			
			// fix for thumbnail view on resize
			if ((Element.getStyle(id_thumbs, 'display') == 'block') && (Element.getStyle(id_overview, 'display') == 'none')) {
				this.resizeHandle();
				myResize.draw(startSize);
			}
		} else if (this.contentHeight <= this.trackHeight) {
			this.track.setStyle({
				display: 'none'
			});
		}
		
		// track scrolling space
		this.trackSpace = this.trackHeight - this.handleHeight - (this.arrowUpHeight + this.offsetTop) - (this.arrowDownHeight + this.offsetBottom);
		
		// content hidden height
		this.contentScroll = this.contentHeight - this.trackHeight;
		
		// scroll factor
		this.scrollFactor = this.contentScroll / this.trackSpace;
		
	},
	
	setContent: function(contentId) {
		// reset top margins
		this.content.setStyle({
			marginTop: '0px'
		});
		
		if (this.arrowPosition == 'top') {
			this.handle.setStyle({
				marginTop: this.arrowUpHeight + this.arrowDownHeight + this.offsetTop + 'px'
			});
		} else if (this.arrowPosition == 'both') {
			this.handle.setStyle({
				marginTop: this.arrowUpHeight + this.offsetTop + 'px'
			});
		} else if (this.arrowPosition == 'bottom') {
			this.handle.setStyle({
				marginTop: this.offsetTop + 'px'
			});
		}
		
		// new content
		this.content = $(contentId);
		this.content.setStyle({
			marginTop: '0px'
		});
		
		// set handle
		this.resizeHandle();
	}
	
}

// --- END