/******************************************************************************
Name:    Carousel Viewer
Version: 0.8 (March 30 2008)
Author:  Sebastian Brink
Contact: http://www.quadrifolia.de

Licence:
Carousel Viewer is licensed under a Creative Commons Attribution-Noncommercial 
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

var id_carousel = 						'carousel';
var id_carousel_item_title = 			'carousel_itemTitle';
var id_carousel_navi = 					'carousel_navi';
var id_carousel_navi_play = 			'carousel_naviPlay';
var id_carousel_list_item_prefix = 		'carousel_posItem_';
var id_carousel_image_prefix = 			'carousel_posImage_';
var id_carousel_reflection_prefix = 	'carousel_posReflection_';

var class_carousel_list = 				'carousel_list';
var class_carousel_list_item = 			'carousel_item';
var class_carousel_navi_play = 			'icon_play';
var class_carousel_navi_pause =			'icon_pause';
var class_carousel_navi_left =			'icon_left';
var class_carousel_navi_fastLeft =		'icon_fastLeft';
var class_carousel_navi_center =		'icon_center';
var class_carousel_navi_right = 		'icon_right';
var class_carousel_navi_fastRight = 	'icon_fastRight';

var class_opacity_100 = 				'opacity_100';
var class_opacity_30 = 					'opacity_30';
var class_opacity_15 = 					'opacity_15';
var class_opacity_0 = 					'opacity_0';

var folder_content = 					'content/';
var folder_cache = 						'cache/';
var file_reflection_prefix = 			'reflect_';

// --- class

Carousel = Class.create();

Carousel.prototype = {
	
	initialize: function(wrapper, options) {
		
		var carousel = this;
		
		this.wrapper = wrapper;
		
		// options
		this.options = options || {};
		this.animationTime = this.options.animationTime;
		this.waitTime = this.options.waitTime;
		this.fastAnimationTime = this.options.fastAnimationTime;
		this.fastWaitTime = this.options.fastWaitTime;
		this.saveTime = this.options.saveTime;
		this.displayTitle = this.options.displayTitle;
		this.carouselWidth = this.options.carouselWidth;
		this.carouselHeight = this.options.carouselHeight;
		this.reflectionHeight = this.options.reflectionHeight;
		this.reflectionTopMargin = this.options.reflectionTopMargin;
		this.imgSourceType = this.options.imgSourceType;
		this.imgSource = this.options.imgSource;
		
		// vars
		this.position = 0;
		this.elements = 0;
		this.imgArray = [];
		this.animationRunning = false;
		this.breakGoto = false;
		this.activeNavigation = true;
		this.direction = '';
		this.oldAnimationTime = this.animationTime;
		this.oldWaitTime = this.waitTime;
		this.timestamp = new Date().getTime();

		this.initialized = true;
		
		this.build();
		
	},
	
	build: function() {
		
		// vars
		var complete = 0;
		
		// get the content
		if (this.imgSourceType == 'href') {
			
			// vars
			var items = $(this.imgSource).getElementsByTagName('a');

			// set elements counter
			this.elements = items.length;
			
			// build array
			for (var i=0, j=items.length; i<j; i+=1) {
				this.imgArray[i] = new Image();
				this.imgArray[i].src = items[i].firstChild.getAttribute('src');
				this.imgArray[i].reflection = items[i].firstChild.getAttribute('src').replace('output=img','output=refl');
				this.imgArray[i].href = items[i].href;
				this.imgArray[i].title = items[i].title;

				if (this.imgArray[i].complete === true) {
					complete += 1;
				}
			}
			
		} else if (this.imgSourceType == 'array') {
			
			// set elements counter
			this.elements = this.imgSource.length;
			
			// img array
			this.imgArray = this.imgSource;
			
			// check if images are fully loaded
			for (var i=0, j=this.elements; i<j; i+=1) {
				if (this.imgArray[i].complete === true) {
					complete += 1;
				}
			}

		}
		
		// build elements
		if(!$(id_carousel)) {
			
			var objCarousel = new Element('div', { id: id_carousel }).setStyle({
				position: 'absolute',
				width: this.carouselWidth + 'px',
				height: this.carouselHeight + 'px',
				left: '0px',
				top: '0px'
			});
			$(this.wrapper).appendChild(objCarousel);	
			
		} else {
			clearContent(id_carousel);
			var objCarousel = $(id_carousel);
		}
		
		var objCarouselPlayButton = new Element('div', { 'class': class_carousel_navi_play, id: id_carousel_navi_play });
		objCarousel.appendChild(objCarouselPlayButton);
		
		var objCarouselImgTitle = new Element('div', { id: id_carousel_item_title });
		objCarousel.appendChild(objCarouselImgTitle);
		
		var objCarouselList = new Element('ul', { 'class': class_carousel_list });
		objCarousel.appendChild(objCarouselList);
		
		var objCarouselIcon = new Element('div', { id: id_carousel_navi }).setStyle({
			backgroundColor: 'transparent',
			backgroundRepeat: 'no-repeat',
			backgroundPosition: 'top left'
		});
		objCarousel.appendChild(objCarouselIcon);
		
		Event.observe(objCarouselPlayButton, 'mousedown', this.play.bindAsEventListener(this));
		Event.observe(objCarouselIcon, 'mousedown', this.click.bindAsEventListener(this));
		Event.observe(objCarouselIcon, 'mousemove', this.iconHover.bindAsEventListener(this));
		
		// write carousel content
		if(complete == this.elements) {
			for (var i=0, j=this.imgArray.length; i<j; i+=1) {
				
				// calculate image sizes
				var itemWidth = this.imgArray[i].width;
				var itemHeight = this.imgArray[i].height + this.reflectionHeight + this.reflectionTopMargin;

				var maxWidth = (this.carouselWidth / 10) * 4;
				var maxHeight = (maxWidth * itemHeight) / itemWidth;

				if (maxHeight > this.carouselHeight) {
					maxWidth = (maxWidth * this.carouselHeight) / maxHeight;
					maxHeight = this.carouselHeight;
				}

				var factor = maxHeight / itemHeight;

				this.imgArray[i].maxWidth = maxWidth;
				this.imgArray[i].maxHeight = maxHeight;
				this.imgArray[i].factor = factor;

				// set title
				if ((i == 0) && (this.displayTitle === true)) {
					$(id_carousel_item_title).setStyle({
						width: (maxWidth - 10) + 'px',
						height: '30px',
						lineHeight: '30px',
						marginTop: (this.imgArray[i].height * factor) + ((this.carouselHeight - maxHeight) / 2) + 'px',
						marginLeft: ((this.carouselWidth / 10) * 3) + Math.floor((((this.carouselWidth / 10) * 4) - maxWidth) / 2) + 5 + 'px'
					});
					var textTitle = document.createTextNode(this.imgArray[i].title);
					$(id_carousel_item_title).appendChild(textTitle);
				}
				
				// build carousel content
				if (i == 0) {
					
					var objCarouselListItem = new Element('li', { 'class': (class_carousel_list_item + ' ' + class_opacity_100), id: (id_carousel_list_item_prefix + i) }).setStyle({
						width: ((this.carouselWidth / 10) * 4) + 'px',
						height: maxHeight + 'px',
						marginTop: ((this.carouselHeight - maxHeight) / 2) + 'px',
						marginLeft: ((this.carouselWidth / 10) * 3) + Math.floor((((this.carouselWidth / 10) * 4) - maxWidth) / 2) + 'px',
						opacity: 1.0
					});
					objCarouselList.appendChild(objCarouselListItem);
					
					var objCarouselLink = new Element('a', { 'class': (lightbox_marker + '_' + this.timestamp), href: this.imgArray[i].href, alt: this.imgArray[i].title });
					objCarouselListItem.appendChild(objCarouselLink);
					objCarouselLink.onclick = function() {return false;};
					
					var objCarouselImg = new Element('img', { src: this.imgArray[i].src, id: (id_carousel_image_prefix + i) }).setStyle({
						width: maxWidth + 'px',
						height: (this.imgArray[i].height * factor) + 'px'
					});
					objCarouselLink.appendChild(objCarouselImg);
					
					var objCarouselReflection = new Element('img', { src: this.imgArray[i].reflection, id: (id_carousel_reflection_prefix + i) }).setStyle({
						width: maxWidth + 'px',
						height: (this.reflectionHeight * factor) + 'px',
						marginTop: this.reflectionTopMargin + 'px'
					});
					objCarouselListItem.appendChild(objCarouselReflection);

				} else if (i == (1)) {
					
					var objCarouselListItem = new Element('li', { 'class': (class_carousel_list_item + ' ' + class_opacity_30), id: (id_carousel_list_item_prefix + i) }).setStyle({
						width: ((this.carouselWidth / 10) * 2) + 'px',
						height: (maxHeight / 2) + 'px',
						marginTop: ((this.carouselHeight - (maxHeight / 2)) / 2) + 'px',
						marginLeft: (this.carouselWidth / 10) + Math.floor((((this.carouselWidth / 10) * 2) - (maxWidth / 2)) / 2) + 'px',
						opacity: 0.3
					});
					objCarouselList.appendChild(objCarouselListItem);
					
					var objCarouselLink = new Element('a', { 'class': (lightbox_marker + '_' + this.timestamp), href: this.imgArray[i].href, alt: this.imgArray[i].title });
					objCarouselListItem.appendChild(objCarouselLink);
					objCarouselLink.onclick = function() {return false;};
					
					var objCarouselImg = new Element('img', { src: this.imgArray[i].src, id: (id_carousel_image_prefix + i) }).setStyle({
						width: (maxWidth / 2) + 'px',
						height: ((this.imgArray[i].height * factor) / 2) + 'px'
					});
					objCarouselLink.appendChild(objCarouselImg);
					
					var objCarouselReflection = new Element('img', { src: this.imgArray[i].reflection, id: (id_carousel_reflection_prefix + i) }).setStyle({
						width: (maxWidth / 2) + 'px',
						height: ((this.reflectionHeight * factor) / 2) + 'px',
						marginTop: this.reflectionTopMargin + 'px'
					});
					objCarouselListItem.appendChild(objCarouselReflection);

				} else if (i == (2)) {
					
					var objCarouselListItem = new Element('li', { 'class': (class_carousel_list_item + ' ' + class_opacity_15), id: (id_carousel_list_item_prefix + i) }).setStyle({
						width: (this.carouselWidth / 10) + 'px',
						height: (maxHeight / 4) + 'px',
						marginTop: ((this.carouselHeight - (maxHeight / 4)) / 2) + 'px',
						marginLeft:  Math.floor(((this.carouselWidth / 10) - (maxWidth / 4)) / 2) + 'px',
						opacity: 0.15
					});
					objCarouselList.appendChild(objCarouselListItem);
					
					var objCarouselLink = new Element('a', { 'class': (lightbox_marker + '_' + this.timestamp), href: this.imgArray[i].href, alt: this.imgArray[i].title });
					objCarouselListItem.appendChild(objCarouselLink);
					objCarouselLink.onclick = function() {return false;};
					
					var objCarouselImg = new Element('img', { src: this.imgArray[i].src, id: (id_carousel_image_prefix + i) }).setStyle({
						width: (maxWidth / 4) + 'px',
						height: ((this.imgArray[i].height * factor) / 4) + 'px'
					});
					objCarouselLink.appendChild(objCarouselImg);
					
					var objCarouselReflection = new Element('img', { src: this.imgArray[i].reflection, id: (id_carousel_reflection_prefix + i) }).setStyle({
						width: (maxWidth / 4) + 'px',
						height: ((this.reflectionHeight * factor) / 4) + 'px',
						marginTop: this.reflectionTopMargin + 'px'
					});
					objCarouselListItem.appendChild(objCarouselReflection);

				} else {
					
					var objCarouselListItem = new Element('li', { 'class': (class_carousel_list_item + ' ' + class_opacity_0), id: (id_carousel_list_item_prefix + i) }).setStyle({
						width: '0px',
						height: '0px',
						marginTop: (this.carouselHeight / 2) + 'px',
						marginLeft: '0px',
						opacity: 0.0
					});
					objCarouselList.appendChild(objCarouselListItem);
					
					var objCarouselLink = new Element('a', { 'class': (lightbox_marker + '_' + this.timestamp), href: this.imgArray[i].href, alt: this.imgArray[i].title });
					objCarouselListItem.appendChild(objCarouselLink);
					objCarouselLink.onclick = function() {return false;};
					
					var objCarouselImg = new Element('img', { src: this.imgArray[i].src, id: (id_carousel_image_prefix + i) }).setStyle({
						width: '0px',
						height: '0px'
					});
					objCarouselLink.appendChild(objCarouselImg);
					
					var objCarouselReflection = new Element('img', { src: this.imgArray[i].reflection, id: (id_carousel_reflection_prefix + i) }).setStyle({
						width: '0px',
						height: '0px',
						marginTop: '0px'
					});
					objCarouselListItem.appendChild(objCarouselReflection);

				}
				
				// set event listner
				Event.observe(objCarouselListItem, 'mousemove', this.iconHover.bindAsEventListener(this));
				Event.observe(objCarouselListItem, 'mouseout', this.iconHide.bindAsEventListener(this));
				Event.observe(objCarouselLink, 'mousedown', this.click.bindAsEventListener(this));
				
			}
			
			// initialize the viewer
			myViewer = new imgViewer({
				marker: lightbox_marker + '_' + this.timestamp,
				close: lightbox_close,
				listner: false
			});
			
			// add some empty values for the animation
			this.imgArray[this.elements] = 0;
			this.imgArray[this.elements+1] = 0;
			this.imgArray[this.elements+2] = 0;
			this.imgArray[this.elements+3] = 0;
			this.imgArray[-1] = 0;
			this.imgArray[-2] = 0;
			this.imgArray[-3] = 0;

			// create animation effects
			this.buildAnimations();
			
		} else {
			setTimeout('myCarousel.build()',250);
		}
	},
	
	// -------------------------------------------------------------------------------------------------------
	// NAVIGATION
	// -------------------------------------------------------------------------------------------------------
	
	// play button
	play: function() {
		if (this.activeNavigation === true) {
			if (this.animationRunning === false) {
				if (this.position < this.elements-1) {
					this.doAnimation('forward');
				} else {
					this.doAnimation('backward');
				}
			} else {
				this.stopAnimation();
				this.breakGoto = true;
			}
		}
	},
	
	// play button status
	switchPlayButton: function(state) {
		if (state == 'play') {
			$(id_carousel_navi_play).className = class_carousel_navi_play;
		} else if (state == 'pause') {
			$(id_carousel_navi_play).className = class_carousel_navi_pause;
		}
	},
	
	// carousel items
	click: function(e) {
		
		e = e || window.event;
		Event.stop(e); // doesn't work in safai 2.0.3

		if (this.activeNavigation === true) {
			if (this.animationRunning === true) {
				this.stopAnimation();
			}

			var mouseX = this.getMouseX(e);
			var offset = $(id_carousel).viewportOffset();
			var mousePosition = mouseX-offset[0];

			if (mousePosition < (this.carouselWidth/10)) {
				this.gotoPosition(this.position+2, 'start');
			} else if (mousePosition < ((this.carouselWidth/10) * 3)) {
				this.moveForward();
			} else if (mousePosition < ((this.carouselWidth/10) * 7)) {
				myViewer.load($(id_carousel_list_item_prefix+this.position).firstChild);
			} else if (mousePosition < ((this.carouselWidth/10) * 9)) {
				this.moveBackward();
			} else {
				this.gotoPosition(this.position-2, 'start');
			}
			
		}
		
	},
	
	// carousel icons
	iconHover: function(e) {
		if (this.animationRunning === false) {
			
			e = e || window.event;
			
			var mouseX = this.getMouseX(e);
			var offset = $(id_carousel).viewportOffset();
			var mousePosition = mouseX - offset[0];
			var maxWidth = (this.carouselWidth / 10) * 4;
			var iconHeight = parseInt(Element.getStyle(id_carousel_navi, 'height'));
			var iconWidth = parseInt(Element.getStyle(id_carousel_navi, 'width'));

			if (mousePosition < (this.carouselWidth/10)) {
				if (this.position < this.elements-2) {
					$(id_carousel_navi).className = class_carousel_navi_fastLeft;
					$(id_carousel_navi).setStyle({
						marginTop: (this.carouselHeight / 2) - (((this.reflectionHeight * this.imgArray[this.position+2].factor) / 8) + (iconHeight / 2)) + 'px',
						marginLeft: (maxWidth / 8) - (iconWidth / 2) + 'px',
						display: 'block'
					});
				}
			} else if (mousePosition < ((this.carouselWidth/10) * 3)) {
				if (this.position < this.elements-1) {
					$(id_carousel_navi).className = class_carousel_navi_left;
					$(id_carousel_navi).setStyle({
						marginTop: (this.carouselHeight / 2) - (((this.reflectionHeight * this.imgArray[this.position+1].factor) / 4) + (iconHeight / 2)) + 'px',
						marginLeft: ((this.carouselWidth/10) * 3) - (maxWidth / 4) - (iconWidth / 2) + 'px',
						display: 'block'
					});
				}
			} else if (mousePosition < ((this.carouselWidth/10) * 7)) {
				$(id_carousel_navi).className = class_carousel_navi_center;
				$(id_carousel_navi).setStyle({
					marginTop: (this.carouselHeight / 2) - (((this.reflectionHeight * this.imgArray[this.position].factor) / 2) + (iconHeight / 2)) + 'px',
					marginLeft: ((this.carouselWidth/10) * 7) - (maxWidth / 2) - (iconWidth / 2) + 'px',
					display: 'block'
				});
			} else if (mousePosition < ((this.carouselWidth/10) * 9)) {
				if (this.position > 0) {
					$(id_carousel_navi).className = class_carousel_navi_right;
					$(id_carousel_navi).setStyle({
						marginTop: (this.carouselHeight / 2) - (((this.reflectionHeight * this.imgArray[this.position-1].factor) / 4) + (iconHeight / 2)) + 'px',
						marginLeft: ((this.carouselWidth/10) * 9) - (maxWidth / 4) - (iconWidth / 2) + 'px',
						display: 'block'
					});
				}
			} else {
				if (this.position > 1) {
					$(id_carousel_navi).className = class_carousel_navi_fastRight;
					$(id_carousel_navi).setStyle({
						marginTop: (this.carouselHeight / 2) - (((this.reflectionHeight * this.imgArray[this.position-2].factor) / 8) + (iconHeight / 2)) + 'px',
						marginLeft: this.carouselWidth - (maxWidth / 8) - (iconWidth / 2) + 'px',
						display: 'block'
					});
				}
			}
		}
	},
	
	iconHide: function() {
		$(id_carousel_navi).setStyle({
			display: 'none'
		});
	},

	// activate navigation
	activateNavigation: function() {
		this.activeNavigation = true;
		window.aniCarouselPlayButton.seekTo(1);
	},

	// deactivate navigation
	deactivateNavigation: function() {
		this.activeNavigation = false;
		window.aniCarouselPlayButton.seekTo(0.6);
	},
	
	getMouseX: function(e){
		
		e = e || window.event;
		
		var posX = 0;
		
		if (e.pageX != undefined) {
			posX = e.pageX;
		} else if (e.clientX != undefined) {
			posX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		}
		return posX;
	},
	
	// -------------------------------------------------------------------------------------------------------
	// TITLE
	// -------------------------------------------------------------------------------------------------------
	
	// hide image title
	aniImgTitle: function(action, speed) {
		if (speed == 'normal') {
			window.aniCarouselImgTitle.seekTo(0);
		} else {
			window.aniCarouselImgTitleFast.seekTo(0);
		}
		setTimeout('myCarousel.updateImgTitle("'+action+'","'+speed+'")', (this.animationTime+this.saveTime));
	},
	
	// change and display image title
	updateImgTitle: function(action, speed) {
		if (action == 'forward') {
			
			$(id_carousel_item_title).setStyle({
				width: this.imgArray[this.position+1].maxWidth - 10 + 'px',
				height: '30px',
				lineHeight: '30px',
				marginTop: (this.imgArray[this.position+1].height * this.imgArray[this.position+1].factor) + ((this.carouselHeight - this.imgArray[this.position+1].maxHeight) / 2) + 'px',
				marginLeft: ((this.carouselWidth / 10) * 3) + Math.floor((((this.carouselWidth / 10) * 4) - this.imgArray[this.position+1].maxWidth) / 2) + 5 + 'px'
			});

			while ($(id_carousel_item_title).firstChild) {
				$(id_carousel_item_title).removeChild($(id_carousel_item_title).firstChild);
			}

			var textTitle = document.createTextNode(this.imgArray[this.position+1].title);
			$(id_carousel_item_title).appendChild(textTitle);

		} else if (action == 'backward') {
			
			$(id_carousel_item_title).setStyle({
				width: this.imgArray[this.position-1].maxWidth - 10 + 'px',
				height: '30px',
				lineHeight: '30px',
				marginTop: (this.imgArray[this.position-1].height * this.imgArray[this.position-1].factor) + ((this.carouselHeight - this.imgArray[this.position-1].maxHeight) / 2) + 'px',
				marginLeft: ((this.carouselWidth / 10) * 3) + Math.floor((((this.carouselWidth / 10) * 4) - this.imgArray[this.position-1].maxWidth) / 2) + 5 + 'px'
			});

			while ($(id_carousel_item_title).firstChild) {
				$(id_carousel_item_title).removeChild($(id_carousel_item_title).firstChild);
			}

			var textTitle = document.createTextNode(this.imgArray[this.position-1].title);
			$(id_carousel_item_title).appendChild(textTitle);

		}

		if (speed == 'normal') {
			window.aniCarouselImgTitle.seekTo(1);
		} else {
			window.aniCarouselImgTitleFast.seekTo(1);
		}
	},
	
	// -------------------------------------------------------------------------------------------------------
	// ANIMATION
	// -------------------------------------------------------------------------------------------------------
	
	buildAnimations: function() {
		
		// rotate forward
		window.rotateForward = new Animator({
			duration: this.animationTime
		}
		).addSubject(new CSSStyleSubject(
			$(id_carousel_list_item_prefix+(this.position+3)), 'position: absolute; height: '+(this.imgArray[this.position+3].maxHeight / 4)+'px; width: '+(this.carouselWidth / 10)+'px; margin-top: '+((this.carouselHeight-(this.imgArray[this.position+3].maxHeight / 4))/2)+'px; margin-left: '+Math.floor(0 + (((this.carouselWidth / 10) - (this.imgArray[this.position+3].maxWidth / 4)) / 2))+'px; opacity: 0.15;')
		).addSubject(new CSSStyleSubject(
			$(id_carousel_image_prefix+(this.position+3)), 'height: '+((this.imgArray[this.position+3].height * this.imgArray[this.position+3].factor) / 4)+'px; width: '+(this.imgArray[this.position+3].maxWidth / 4)+'px;')
		).addSubject(new CSSStyleSubject(
			$(id_carousel_reflection_prefix+(this.position+3)), 'height: '+((this.reflectionHeight * this.imgArray[this.position+3].factor) / 4)+'px; margin-top: '+this.reflectionTopMargin+'px; width: '+(this.imgArray[this.position+3].maxWidth / 4)+'px;')
		).addSubject(new CSSStyleSubject(
			$(id_carousel_list_item_prefix+(this.position+2)), 'position: absolute; height: '+(this.imgArray[this.position+2].maxHeight / 2)+'px; width: '+((this.carouselWidth / 10) * 2)+'px; margin-top: '+((this.carouselHeight-(this.imgArray[this.position+2].maxHeight / 2))/2)+'px; margin-left: '+Math.floor((this.carouselWidth / 10) + ((((this.carouselWidth / 10) * 2) - (this.imgArray[this.position+2].maxWidth / 2)) / 2))+'px; opacity: 0.3;')
		).addSubject(new CSSStyleSubject(
			$(id_carousel_image_prefix+(this.position+2)), 'height: '+((this.imgArray[this.position+2].height * this.imgArray[this.position+2].factor) / 2)+'px; width: '+(this.imgArray[this.position+2].maxWidth / 2)+'px;')
		).addSubject(new CSSStyleSubject(
			$(id_carousel_reflection_prefix+(this.position+2)), 'height: '+((this.reflectionHeight * this.imgArray[this.position+2].factor) / 2)+'px; margin-top: '+this.reflectionTopMargin+'px; width: '+(this.imgArray[this.position+2].maxWidth / 2)+'px;')
		).addSubject(new CSSStyleSubject(
			$(id_carousel_list_item_prefix+(this.position+1)), 'position: absolute; height: '+this.imgArray[this.position+1].maxHeight+'px; width: '+((this.carouselWidth / 10) * 4)+'px; margin-top: '+((this.carouselHeight-this.imgArray[this.position+1].maxHeight)/2)+'px; margin-left: '+Math.floor(((this.carouselWidth / 10) * 3) + ((((this.carouselWidth / 10) * 4) - (this.imgArray[this.position+1].maxWidth)) / 2))+'px; opacity: 1.0;')
		).addSubject(new CSSStyleSubject(
			$(id_carousel_image_prefix+(this.position+1)), 'height: '+(this.imgArray[this.position+1].height * this.imgArray[this.position+1].factor)+'px; width: '+(this.imgArray[this.position+1].maxWidth)+'px;')
		).addSubject(new CSSStyleSubject(
			$(id_carousel_reflection_prefix+(this.position+1)), 'height: '+(this.reflectionHeight * this.imgArray[this.position+1].factor)+'px; margin-top: '+this.reflectionTopMargin+'px; width: '+(this.imgArray[this.position+1].maxWidth)+'px;')
		).addSubject(new CSSStyleSubject(
			$(id_carousel_list_item_prefix+this.position), 'position: absolute; height: '+(this.imgArray[this.position].maxHeight / 2)+'px; width: '+((this.carouselWidth / 10) * 2)+'px; margin-top: '+((this.carouselHeight-(this.imgArray[this.position].maxHeight / 2))/2)+'px; margin-left: '+Math.floor(((this.carouselWidth / 10) * 7) + ((((this.carouselWidth / 10) * 2) - (this.imgArray[this.position].maxWidth / 2)) / 2))+'px; opacity: 0.3;')
		).addSubject(new CSSStyleSubject(
			$(id_carousel_image_prefix+(this.position)), 'height: '+((this.imgArray[this.position].height * this.imgArray[this.position].factor) / 2)+'px; width: '+(this.imgArray[this.position].maxWidth / 2)+'px;')
		).addSubject(new CSSStyleSubject(
			$(id_carousel_reflection_prefix+(this.position)), 'height: '+((this.reflectionHeight * this.imgArray[this.position].factor) / 2)+'px; margin-top: '+this.reflectionTopMargin+'px; width: '+(this.imgArray[this.position].maxWidth / 2)+'px;')
		).addSubject(new CSSStyleSubject(
			$(id_carousel_list_item_prefix+(this.position-1)), 'position: absolute; height: '+(this.imgArray[this.position-1].maxHeight / 4)+'px; width: '+(this.carouselWidth / 10)+'px; margin-top: '+((this.carouselHeight-(this.imgArray[this.position-1].maxHeight / 4))/2)+'px; margin-left: '+Math.floor(((this.carouselWidth / 10) * 9) + (((this.carouselWidth / 10) - (this.imgArray[this.position-1].maxWidth / 4)) / 2))+'px; opacity: 0.15;')
		).addSubject(new CSSStyleSubject(
			$(id_carousel_image_prefix+(this.position-1)), 'height: '+((this.imgArray[this.position-1].height * this.imgArray[this.position-1].factor) / 4)+'px; width: '+(this.imgArray[this.position-1].maxWidth / 4)+'px;')
		).addSubject(new CSSStyleSubject(
			$(id_carousel_reflection_prefix+(this.position-1)), 'height: '+((this.reflectionHeight * this.imgArray[this.position-1].factor) / 4)+'px; margin-top: '+this.reflectionTopMargin+'px; width: '+(this.imgArray[this.position-1].maxWidth / 4)+'px;')
		).addSubject(new CSSStyleSubject(
			$(id_carousel_list_item_prefix+(this.position-2)), 'position: absolute; height: 0px; width: 0px; margin-top: '+(this.carouselHeight / 2)+'px; margin-left: '+this.carouselWidth+'px; opacity: 0.0;')
		).addSubject(new CSSStyleSubject(
			$(id_carousel_image_prefix+(this.position-2)), 'height: 0px; width: 0px;')
		).addSubject(new CSSStyleSubject(
			$(id_carousel_reflection_prefix+(this.position-2)), 'height: 0px; margin-top: 0px; width: 0px;')
		);
		
		// rotate backward
		window.rotateBackward = new Animator({
			duration: this.animationTime
		}
		).addSubject(new CSSStyleSubject(
			$(id_carousel_list_item_prefix+(this.position+2)), 'position: absolute; height: 0px; width: 0px; margin-top: '+(this.carouselHeight / 2)+'px; margin-left: 0px; opacity: 0.0;')
		).addSubject(new CSSStyleSubject(
			$(id_carousel_image_prefix+(this.position+2)), 'height: 0px; width: 0px;')
		).addSubject(new CSSStyleSubject(
			$(id_carousel_reflection_prefix+(this.position+2)), 'height: 0px; margin-top: 0px; width: 0px;')
		).addSubject(new CSSStyleSubject(
			$(id_carousel_list_item_prefix+(this.position+1)), 'position: absolute; height: '+(this.imgArray[this.position+1].maxHeight / 4)+'px; width: '+(this.carouselWidth / 10)+'px; margin-top: '+((this.carouselHeight-(this.imgArray[this.position+1].maxHeight / 4))/2)+'px; margin-left: '+Math.floor(0 + (((this.carouselWidth / 10) - (this.imgArray[this.position+1].maxWidth / 4)) / 2))+'px; opacity: 0.15;')
		).addSubject(new CSSStyleSubject(
			$(id_carousel_image_prefix+(this.position+1)), 'height: '+((this.imgArray[this.position+1].height * this.imgArray[this.position+1].factor) / 4)+'px; width: '+(this.imgArray[this.position+1].maxWidth / 4)+'px;')
		).addSubject(new CSSStyleSubject(
			$(id_carousel_reflection_prefix+(this.position+1)), 'height: '+((this.reflectionHeight * this.imgArray[this.position+1].factor) / 4)+'px; margin-top: '+this.reflectionTopMargin+'px; width: '+(this.imgArray[this.position+1].maxWidth / 4)+'px;')
		).addSubject(new CSSStyleSubject(
			$(id_carousel_list_item_prefix+this.position), 'position: absolute; height: '+(this.imgArray[this.position].maxHeight / 2)+'px; width: '+((this.carouselWidth / 10) * 2)+'px; margin-top: '+((this.carouselHeight-(this.imgArray[this.position].maxHeight / 2))/2)+'px; margin-left: '+Math.floor((this.carouselWidth / 10) + ((((this.carouselWidth / 10) * 2) - (this.imgArray[this.position].maxWidth / 2)) / 2))+'px; opacity: 0.3;')
		).addSubject(new CSSStyleSubject(
			$(id_carousel_image_prefix+(this.position)), 'height: '+((this.imgArray[this.position].height * this.imgArray[this.position].factor) / 2)+'px; width: '+(this.imgArray[this.position].maxWidth / 2)+'px;')
		).addSubject(new CSSStyleSubject(
			$(id_carousel_reflection_prefix+(this.position)), 'height: '+((this.reflectionHeight * this.imgArray[this.position].factor) / 2)+'px; margin-top: '+this.reflectionTopMargin+'px; width: '+(this.imgArray[this.position].maxWidth / 2)+'px;')
		).addSubject(new CSSStyleSubject(
			$(id_carousel_list_item_prefix+(this.position-1)), 'position: absolute; height: '+this.imgArray[this.position-1].maxHeight+'px; width: '+((this.carouselWidth / 10) * 4)+'px; margin-top: '+((this.carouselHeight-this.imgArray[this.position-1].maxHeight)/2)+'px; margin-left: '+Math.floor(((this.carouselWidth / 10) * 3) + ((((this.carouselWidth / 10) * 4) - (this.imgArray[this.position-1].maxWidth)) / 2))+'px; opacity: 1.00;')
		).addSubject(new CSSStyleSubject(
			$(id_carousel_image_prefix+(this.position-1)), 'height: '+((this.imgArray[this.position-1].height * this.imgArray[this.position-1].factor))+'px; width: '+(this.imgArray[this.position-1].maxWidth)+'px;')
		).addSubject(new CSSStyleSubject(
			$(id_carousel_reflection_prefix+(this.position-1)), 'height: '+(this.reflectionHeight * this.imgArray[this.position-1].factor)+'px; margin-top: '+this.reflectionTopMargin+'px; width: '+(this.imgArray[this.position-1].maxWidth)+'px;')
		).addSubject(new CSSStyleSubject(
			$(id_carousel_list_item_prefix+(this.position-2)), 'position: absolute; height: '+(this.imgArray[this.position-2].maxHeight / 2)+'px; width: '+((this.carouselWidth / 10) * 2)+'px; margin-top: '+((this.carouselHeight-(this.imgArray[this.position-2].maxHeight / 2))/2)+'px; margin-left: '+Math.floor(((this.carouselWidth / 10) * 7) + ((((this.carouselWidth / 10) * 2) - (this.imgArray[this.position-2].maxWidth / 2)) / 2))+'px; opacity: 0.3;')
		).addSubject(new CSSStyleSubject(
			$(id_carousel_image_prefix+(this.position-2)), 'height: '+((this.imgArray[this.position-2].height * this.imgArray[this.position-2].factor) / 2)+'px; width: '+(this.imgArray[this.position-2].maxWidth / 2)+'px;')
		).addSubject(new CSSStyleSubject(	
			$(id_carousel_reflection_prefix+(this.position-2)), 'height: '+((this.reflectionHeight * this.imgArray[this.position-2].factor) / 2)+'px; margin-top: '+this.reflectionTopMargin+'px; width: '+(this.imgArray[this.position-2].maxWidth / 2)+'px;')
		).addSubject(new CSSStyleSubject(
			$(id_carousel_list_item_prefix+(this.position-3)), 'position: absolute; height: '+(this.imgArray[this.position-3].maxHeight / 4)+'px; width: '+(this.carouselWidth / 10)+'px; margin-top: '+((this.carouselHeight-(this.imgArray[this.position-3].maxHeight / 4))/2)+'px; margin-left: '+Math.floor(((this.carouselWidth / 10) * 9) + (((this.carouselWidth / 10) - (this.imgArray[this.position-3].maxWidth / 4)) / 2))+'px; opacity: 0.15;')
		).addSubject(new CSSStyleSubject(	
			$(id_carousel_image_prefix+(this.position-3)), 'height: '+((this.imgArray[this.position-3].height * this.imgArray[this.position-3].factor) / 4)+'px; width: '+(this.imgArray[this.position-3].maxWidth / 4)+'px;')
		).addSubject(new CSSStyleSubject(	
			$(id_carousel_reflection_prefix+(this.position-3)), 'height: '+((this.reflectionHeight * this.imgArray[this.position-3].factor) / 4)+'px; margin-top: '+this.reflectionTopMargin+'px; width: '+(this.imgArray[this.position-3].maxWidth / 4)+'px;')
		);
		
		// image title animation
		window.aniCarouselImgTitle = new Animator({
			duration: (this.animationTime / 2)
		}).addSubject(new NumericalStyleSubject(
		    $(id_carousel_item_title), 'opacity', 0, 1)
		);
	
		window.aniCarouselImgTitleFast = new Animator({
			duration: 50
		}).addSubject(new NumericalStyleSubject(
		    $(id_carousel_item_title), 'opacity', 0, 1)
		);
		
		// play button animation
		window.aniCarouselPlayButton = new Animator({
			duration: 50
		}).addSubject(new NumericalStyleSubject(
		    $(id_carousel_navi_play), 'opacity', 0, 1)
		);
		
	},
	
	// build the new animations for the next step
	update: function(action) {
		if (action == 'forward') {	
			this.position+=1;
		} else if (action == 'backward') {
			this.position-=1;
		}
		this.buildAnimations();
	},
	
	// animates the carousel forward or backward
	doAnimation: function(action) {
		if (this.animationRunning === false) {
			this.animationRunning = true;
			this.switchPlayButton('pause');
		}

		if (action == 'forward') {
			window.rotateForward.seekTo(1);
			this.aniImgTitle('forward', 'normal');
			setTimeout('myCarousel.update("forward")', this.animationTime+this.saveTime);
			if (this.position < this.elements-2) {
				this.animation = setTimeout('myCarousel.doAnimation("forward")', this.animationTime+this.waitTime+this.saveTime);
			} else {
				this.stopAnimation();
			}
		} else if (action == 'backward') {
			window.rotateBackward.seekTo(1);
			this.aniImgTitle('backward', 'normal');
			setTimeout('myCarousel.update("backward")', this.animationTime+this.saveTime);
			if (this.position > 1) {
				this.animation = setTimeout('myCarousel.doAnimation("backward")', this.animationTime+this.waitTime+this.saveTime);
			} else {
				this.stopAnimation();
			}
		}
	},
	
	// stops the animation
	stopAnimation: function() {
		this.animationRunning = false;
		clearTimeout(this.animation);
		setTimeout('myCarousel.switchPlayButton("play")', this.animationTime+this.saveTime);
	},
	
	// move the carousel one step forward
	moveForward: function() {
		if (this.animationRunning === true) {
			this.stopAnimation();
		}
		this.deactivateNavigation();
		this.iconHide();
		window.rotateForward.seekTo(1);
		this.aniImgTitle('forward', 'normal');
		setTimeout('myCarousel.update("forward")', this.animationTime+this.saveTime);
		setTimeout('myCarousel.activateNavigation()', this.animationTime+this.saveTime);
	},
	
	// move the carousel on step backward
	moveBackward: function() {
		if (this.animationRunning === true) {
			this.stopAnimation();
		}
		this.deactivateNavigation();
		this.iconHide();
		window.rotateBackward.seekTo(1);
		this.aniImgTitle('backward', 'normal');
		setTimeout('myCarousel.update("backward")', this.animationTime+this.saveTime);
		setTimeout('myCarousel.activateNavigation()', this.animationTime+this.saveTime);
	},
	
	// fast animation to position
	gotoPosition: function(targetPosition, status) {

		if (status == 'start') {

			if (this.animationRunning === false) {

				// deactivate navigation
				this.deactivateNavigation();

				// set times
				this.oldAnimationTime = this.animationTime;
				this.oldWaitTime = this.waitTime;
				this.animationTime = this.fastAnimationTime;
				this.waitTime = this.fastWaitTime;

				// build fast animations
				this.buildAnimations();

				// direction
				if(targetPosition < 0) {
					targetPosition = 0;
				}

				if(targetPosition > this.imgArray.length-5) {
					targetPosition = this.imgArray.length-5;
				}

				if(targetPosition > this.position) {
					direction = 'forward';
					this.animationRunning = true;
				} else if (targetPosition < this.position) {
					direction = 'backward';
					this.animationRunning = true;
				} else {
					this.animationTime = this.oldAnimationTime;
					this.waitTime = this.oldWaitTime;
					this.buildAnimations();
					this.activateNavigation();
					return false;
				}

			} else {

				// direction
				if(targetPosition < 0) {
					targetPosition = 0;
				}

				if(targetPosition > imgArray.length-5) {
					targetPosition = imgArray.length-5;
				}

				if(targetPosition > position) {
					direction = 'forward';
					this.breakGoto = true;
				} else if (targetPosition < position) {
					direction = 'backward';
					this.breakGoto = true;
				} else {
					this.breakGoto = true;
				}

			}

		}

		if (direction == 'forward') {
			window.rotateForward.seekTo(1);
			this.aniImgTitle('forward', 'fast');
			setTimeout('myCarousel.updateGoto("forward", '+ targetPosition +')', this.animationTime+this.saveTime);
		} else if (direction == 'backward') {
			window.rotateBackward.seekTo(1);
			this.aniImgTitle('backward', 'fast');
			setTimeout('myCarousel.updateGoto("backward", '+ targetPosition +')', this.animationTime+this.saveTime);
		}

	},
	
	updateGoto: function(action, targetPosition) {
		if (action == 'forward') {	
			this.position+=1;
		} else if (action == 'backward') {
			this.position-=1;
		}

		if (this.breakGoto === false) {
			if (this.position != targetPosition) {
				this.buildAnimations();
				this.gotoPosition(targetPosition, 'recall');
			} else {
				this.animationRunning = false;
				this.animationTime = this.oldAnimationTime;
				this.waitTime = this.oldWaitTime;
				this.activateNavigation();
				this.buildAnimations();
			}
		} else {
			this.breakGoto = false;
		}
	}
	
}

// --- END