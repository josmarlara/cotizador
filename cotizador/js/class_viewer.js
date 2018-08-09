/******************************************************************************
Name:    Image Viewer
Version: 0.9 (March 30 2008)
Author:  Sebastian Brink
Contact: http://www.quadrifolia.de

Licence:
Image Viewer is licensed under a Creative Commons Attribution-Noncommercial 
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

var lightbox_marker =				'lightbox';
var lightbox_close = 				'left';
var lightbox_listner =				true;
var lightbox_space = 				100;
var lightbox_border = 				10;
var lightbox_title_lineheight = 	30;
var lightbox_title_opacity = 		0.8;
var lightbox_overlay_opacity = 		0.8;
var lightbox_processing_opacity = 	0.6;

// --- nomenclature

var id_viewer = 					'imgViewer';
var id_viewer_overlay =				'imgViewer_overlay';
var id_viewer_loading =				'imgViewer_loading';
var id_viewer_processing =			'imgViewer_processing';
var id_viewer_container =			'imgViewer_container';
var id_viewer_image =				'imgViewer_image';
var id_viewer_title =				'imgViewer_title';
var id_viewer_closebox =			'imgViewer_closebox';
var id_viewer_navi_left =			'imgViewer_naviLeft';
var id_viewer_navi_right =			'imgViewer_naviRight';

// --- initialize
//------------------------------------------------------------------------------------------------------------------------
// function initViewer() { 
// 	myViewer = new imgViewer({
// 		marker: 'lightbox',
// 		close: 'left',
// 		listner: true
// 	});
// }
// 
// Event.observe(window, 'load', initViewer, false);
//------------------------------------------------------------------------------------------------------------------------

// --- class

imgViewer = Class.create();

imgViewer.prototype = {

	initialize: function(options) {
		
		var viewer = this;
		
		// options
		this.options = options || {};
		this.marker = this.options.marker;
		this.closePosition = this.options.close;
		this.listner = this.options.listner;
		
		// vars
		this.position = 0;
		this.firstRun = true;
		
		// add event listner
		if (this.listner === true) {
			this.anchors = $$('a.'+this.marker);
		
			for (var i=0, j=this.anchors.length; i<j; i+=1) {
				Event.observe(this.anchors[i], 'click', this.load.bindAsEventListener(this));
			}
		} else {
			this.anchors = $$('a.'+this.marker);
		}
		
		// create DOM nodes
		if(!$(id_viewer_overlay)) {
			var objBody = $$('body')[0];
			
			var objOverlay = new Element('div', { id: id_viewer_overlay }).setStyle({
				display: 'none'
			});
			objBody.appendChild(objOverlay);
			
			var objLoading = new Element('div', { id: id_viewer_loading });
			objOverlay.appendChild(objLoading);
			
			var objViewer = new Element('div', { id: id_viewer }).setStyle({
				display: 'none'
			});
			objBody.appendChild(objViewer);
			
			var objProcessing = new Element('div', { id: id_viewer_processing }).setStyle({
				display: 'none'
			});
			objBody.appendChild(objProcessing);

			// build animations
			this.basicAnimations();
		}

	},
	
	load: function(e) {
		
		// event
		if (!e.type) {
			var element = e;
		} else {
			e = e||window.event;
			var element = $(Event.element(e)).up('.'+this.marker);
			if (!element) {
				var element = Event.element(e);
			}
		}
		
		if (this.firstRun === true) {
			
			// lightbox space
			this.lightbox_fullSpace = ((lightbox_space + lightbox_border) * 2);
		
			// get dimensions
			this.viewport = document.viewport.getDimensions();
			this.siteDimensions = getSiteDimensions();
			this.scrollOffset = document.viewport.getScrollOffsets();
		
			// set overlay
			$(id_viewer_overlay).setStyle({ width: this.siteDimensions[0] + 'px' });
			$(id_viewer_overlay).setStyle({ height: this.siteDimensions[1] + 'px' });
			
			// set loading animation
			var id_viewer_loading_width = parseInt($(id_viewer_loading).getStyle('width'));
			var id_viewer_loading_height = parseInt($(id_viewer_loading).getStyle('height'));
			
			$(id_viewer_loading).setStyle({ marginLeft: Math.floor(this.scrollOffset['left'] + (this.viewport['width'] / 2) - (id_viewer_loading_width / 2)) + 'px' });
			$(id_viewer_loading).setStyle({ marginTop: Math.floor(this.scrollOffset['top'] + (this.viewport['height'] / 2) - (id_viewer_loading_height / 2)) + 'px' });
			
			// set processing animation
			var id_viewer_processing_width = parseInt($(id_viewer_processing).getStyle('width'));
			var id_viewer_processing_height = parseInt($(id_viewer_processing).getStyle('height'));
			
			$(id_viewer_processing).setStyle({ marginLeft: Math.floor( this.scrollOffset['left'] + (this.viewport['width'] / 2) - (id_viewer_processing_width / 2)) + 'px' });
			$(id_viewer_processing).setStyle({ marginTop: Math.floor(this.scrollOffset['top'] + (this.viewport['height'] / 2) - (id_viewer_processing_height / 2)) + 'px' });
		
			// show overlay
			window.imgViewer_aniOverlay.seekTo(lightbox_overlay_opacity);
		
			// build image
			if (element.href) {
				this.src = element.href;
			} else {
				this.src = element;
			}
		
			this.image = new Image();
			this.image.src = this.src;
		
		}
		
		// build DOM
		if (this.image.complete === true) {
			
			// get image position
			this.srcSource = this.src.split('/');
			this.srcSource = this.srcSource[this.srcSource.length-1];
			this.srcSource = this.srcSource.replace(/\?/g, '_');
			
			for (var i=0, j=this.anchors.length; i<j; i+=1) {
				
				this.srcCheck = this.anchors[i].readAttribute('href').split('/');
				this.srcCheck = this.srcCheck[this.srcCheck.length-1];
				this.srcCheck = this.srcCheck.replace(/\?/g, '_');
				
				if (this.srcSource.match(this.srcCheck)) {
					this.position = i;
					if (this.anchors[i].readAttribute('title') != null) {
						this.imgTitle = this.anchors[i].readAttribute('title');
					} else {
						this.imgTitle = this.anchors[i].readAttribute('alt');
					}
				}
			}

			// check if image is larger then screen
			if ((this.image.width + this.lightbox_fullSpace) > this.viewport['width']) {
				this.imgWidth = this.viewport['width'] - this.lightbox_fullSpace;
				this.imgHeight = (this.image.height * this.imgWidth) / this.image.width;
			} else {
				this.imgWidth = this.image.width;
				this.imgHeight = this.image.height;
			}

			if ((this.imgHeight + this.lightbox_fullSpace) > this.viewport['height']) {
				this.imgWidth = (this.imgWidth * (this.viewport['height'] - this.lightbox_fullSpace)) / this.imgHeight;
				this.imgHeight = this.viewport['height'] - this.lightbox_fullSpace;
			}
			
			// build
			var objImgFrame = new Element('div', { id: id_viewer_container }).setStyle({
				position: 'absolute',
				width: this.imgWidth + (lightbox_border * 2) + 'px',
				height: this.imgHeight + (lightbox_border * 2) + 'px',
				marginLeft: Math.floor(this.scrollOffset['left'] + (this.viewport['width'] / 2) - ((this.imgWidth + (lightbox_border * 2)) / 2)) + 'px',
				marginTop: Math.floor(this.scrollOffset['top'] + (this.viewport['height'] / 2) - ((this.imgHeight + (lightbox_border * 2)) / 2)) + 'px'
			});
			$(id_viewer).appendChild(objImgFrame);
			
			var objImg = new Element('img', { id: id_viewer_image, src: this.image.src }).setStyle({
				width: this.imgWidth + 'px',
				height: this.imgHeight + 'px',
				marginLeft: lightbox_border + 'px',
				marginTop: lightbox_border + 'px'
			});
			objImgFrame.appendChild(objImg);
			
			var objTitle = new Element('div', { id: id_viewer_title }).setStyle({
				position: 'absolute',
				display: 'block',
				width: (this.imgWidth - lightbox_border) + 'px',
				height: '0px',
				top: (this.imgHeight + lightbox_border) + 'px',
				left: '0px',
				marginLeft: lightbox_border + 'px',
				marginTop: '0px',
				paddingLeft: (lightbox_border / 2) + 'px',
				paddingRight: (lightbox_border / 2) + 'px',
				lineHeight: lightbox_title_lineheight + 'px',
				opacity: lightbox_title_opacity,
				overflow: 'hidden'
			}).update(this.imgTitle);
			objImgFrame.appendChild(objTitle);
			
			var objClosebox = new Element('div', { id: id_viewer_closebox });
			$(id_viewer).appendChild(objClosebox);
			
			if (this.closePosition == 'left') {
				$(id_viewer_closebox).setStyle({
					marginLeft: Math.floor(this.scrollOffset['left'] + (this.viewport['width'] / 2) - ((this.imgWidth + (lightbox_border * 2)) / 2) - (parseInt($(id_viewer_closebox).getStyle('width')) / 2)) + 'px',
					marginTop: Math.floor(this.scrollOffset['top'] + (this.viewport['height'] / 2) - ((this.imgHeight + (lightbox_border * 2)) / 2) - (parseInt($(id_viewer_closebox).getStyle('height')) / 2)) + 'px'
				});
			} else {
				$(id_viewer_closebox).setStyle({
					marginLeft: Math.floor(this.scrollOffset['left'] + (this.viewport['width'] / 2) + ((this.imgWidth + (lightbox_border * 2)) / 2) - (parseInt($(id_viewer_closebox).getStyle('width')) / 2)) + 'px',
					marginTop: Math.floor(this.scrollOffset['top'] + (this.viewport['height'] / 2) - ((this.imgHeight + (lightbox_border * 2)) / 2) - (parseInt($(id_viewer_closebox).getStyle('height')) / 2)) + 'px'
				});
			}
			
			var objNaviLeft = new Element('div', { id: id_viewer_navi_left });
			$(id_viewer).appendChild(objNaviLeft);
			
			var id_viewer_navi_left_width = parseInt($(id_viewer_navi_left).getStyle('width'));
			var id_viewer_navi_left_height = parseInt($(id_viewer_navi_left).getStyle('height'));
			$(id_viewer_navi_left).setStyle({
				marginLeft: Math.floor(this.scrollOffset['left'] + (this.viewport['width'] / 2)) - id_viewer_navi_left_width + 'px',
				marginTop: Math.floor(this.scrollOffset['top'] + this.viewport['height'] - (this.lightbox_fullSpace / 2) + (((this.lightbox_fullSpace / 2) - id_viewer_navi_left_height) / 2)) + 'px'
			});
			
			var objNaviRight = new Element('div', { id: id_viewer_navi_right });
			$(id_viewer).appendChild(objNaviRight);
			
			var id_viewer_navi_right_width = parseInt($(id_viewer_navi_right).getStyle('width'));
			var id_viewer_navi_right_height = parseInt($(id_viewer_navi_right).getStyle('height'));
			$(id_viewer_navi_right).setStyle({
				marginLeft: Math.floor(this.scrollOffset['left'] + (this.viewport['width'] / 2)) + 'px',
				marginTop: Math.floor(this.scrollOffset['top'] + this.viewport['height'] - (this.lightbox_fullSpace / 2) + (((this.lightbox_fullSpace / 2) - id_viewer_navi_right_height) / 2)) + 'px'
			});
			
			// event listner
			Event.observe(objImg, 'mouseover', new Function('fx_Img_TitleIn', 'window.imgViewer_aniTitle.seekTo(1)'));
			Event.observe(objImg, 'mouseout', new Function('fx_Img_TitleOut', 'window.imgViewer_aniTitle.seekTo(0)'));
			Event.observe(objTitle, 'mouseover', new Function('fx_Title_TitleIn', 'window.imgViewer_aniTitle.seekTo(1)'));
			Event.observe(objTitle, 'mouseout', new Function('fx_Title_TitleOut', 'window.imgViewer_aniTitle.seekTo(0)'));
			Event.observe(objClosebox, 'click', new Function('fx_closeBox', 'myViewer.hide()'));
			Event.observe(objNaviLeft, 'click', new Function('fx_naviLeft', 'myViewer.prev()'));
			Event.observe(objNaviRight, 'click', new Function('fx_naviRight', 'myViewer.next()'));

			// build animations
			this.imgAnimations();
			
			// set firstRun back
			this.firstRun = true;

			// display the first image
			this.show();
		} else {
			this.firstRun = false;
			setTimeout("myViewer.load('"+element+"')",50);
		}
		
	},
	
	next: function() {
		
		// vars
		var positionNext, src, image, imgWidth, imgHeight, imgTitle;
		
		// show img loading
		window.imgViewer_aniProcessing.seekTo(lightbox_processing_opacity);
		
		// next image
		positionNext = this.position + 1;
		if (positionNext >= this.anchors.length) {
			positionNext = 0;
		}
		
		// image title
		if (this.anchors[positionNext].getAttribute('title') != null) {
			this.imgTitle = this.anchors[positionNext].getAttribute('title');
		} else {
			this.imgTitle = this.anchors[positionNext].getAttribute('alt');
		}

		// build image
		src = this.anchors[positionNext].getAttribute('href');
		image = new Image();
		image.src = src;

		if (image.complete === true) {
			
			window.imgViewer_aniImage.seekTo(0);
			window.imgViewer_aniTitle.seekTo(0);

			// check if image is larger then screen
			if ((image.width + this.lightbox_fullSpace) > this.viewport['width']) {
				imgWidth = this.viewport['width'] - this.lightbox_fullSpace;
				imgHeight = (image.height * imgWidth) / image.width;
			} else {
				imgWidth = image.width;
				imgHeight = image.height;
			}

			if ((imgHeight + this.lightbox_fullSpace) > this.viewport['height']) {
				imgWidth = (imgWidth * (this.viewport['height'] - this.lightbox_fullSpace)) / imgHeight;
				imgHeight = this.viewport['height'] - this.lightbox_fullSpace;
			}

			// set title
			$(id_viewer_title).setStyle({
				top: (imgHeight + lightbox_border) + 'px',
				width: (imgWidth - lightbox_border) + 'px'
			}).update(this.imgTitle);;
			
			// hide img loading
			window.imgViewer_aniProcessing.seekTo(0);

			// resize box
			this.resize(image.src, imgWidth, imgHeight);

			// set position
			this.position = positionNext;
		} else {
			setTimeout("myViewer.next()",50);
		}
		
	},
	
	prev: function() {
		
		// vars
		var positionPrev, src, image, imgWidth, imgHeight, imgTitle;
		
		// show img loading
		window.imgViewer_aniProcessing.seekTo(lightbox_overlay_opacity);
		
		// next image
		positionPrev = this.position - 1;
		if (positionPrev < 0) {
			positionPrev = this.anchors.length - 1;
		}
		
		// image title
		if (this.anchors[positionPrev].getAttribute('title') != null) {
			this.imgTitle = this.anchors[positionPrev].getAttribute('title');
		} else {
			this.imgTitle = this.anchors[positionPrev].getAttribute('alt');
		}

		// build image
		src = this.anchors[positionPrev].getAttribute('href');
		image = new Image();
		image.src = src;

		if (image.complete === true) {
			window.imgViewer_aniImage.seekTo(0);
			window.imgViewer_aniTitle.seekTo(0)

			// check if image is larger then screen
			if ((image.width + this.lightbox_fullSpace) > this.viewport['width']) {
				var imgWidth = this.viewport['width'] - this.lightbox_fullSpace;
				var imgHeight = (image.height * imgWidth) / image.width;
			} else {
				var imgWidth = image.width;
				var imgHeight = image.height;
			}

			if ((imgHeight + this.lightbox_fullSpace) > this.viewport['height']) {
				imgWidth = (imgWidth * (this.viewport['height'] - this.lightbox_fullSpace)) / imgHeight;
				imgHeight = this.viewport['height'] - this.lightbox_fullSpace;
			}

			// set title
			$(id_viewer_title).setStyle({
				top: (imgHeight + lightbox_border) + 'px',
				width: (imgWidth - lightbox_border) + 'px'
			}).update(this.imgTitle);;
			
			// hide img loading
			window.imgViewer_aniProcessing.seekTo(0);

			// resize box
			this.resize(image.src, imgWidth, imgHeight);

			// set position
			this.position = positionPrev;
		} else {
			setTimeout("myViewer.prev()",50);
		}
		
	},
	
	show: function() {
		if ($(id_viewer_overlay).style.display == 'block') {
			window.imgViewer_aniViewer.seekTo(1);
			window.imgViewer_aniLoading.seekTo(0);
		} else {
			setTimeout("myViewer.show()",50);
		}
	},
	
	hide: function() {
		window.imgViewer_aniViewer.seekTo(0);
		window.imgViewer_aniOverlay.seekTo(0);
		window.imgViewer_aniProcessing.seekTo(0);
		this.clear();
	},
	
	clear: function() {
		if ($(id_viewer_overlay).style.display == 'none') {
			// removes all child nodes
			while ($(id_viewer).firstChild) {
				$(id_viewer).removeChild($(id_viewer).firstChild);
			}
			window.imgViewer_aniLoading.seekTo(1);
		} else {
			setTimeout("myViewer.clear()",50);
		}
	},
	
	resize: function(img, x, y) {
		if ($(id_viewer_image).style.display == 'none') {
			
			x = parseInt(x);
			y = parseInt(y);
			
			var imgWidth = x + 'px';
			var imgHeight = y + 'px';
			
			var boxWidth = x + (lightbox_border * 2) + 'px';
			var boxHeight = y + (lightbox_border * 2) + 'px';
			
			var marginLeft = Math.floor(this.scrollOffset['left'] + (this.viewport['width'] / 2) - ((x + (lightbox_border * 2)) / 2)) + 'px';
			var marginTop = Math.floor(this.scrollOffset['top'] + (this.viewport['height'] / 2) - ((y + (lightbox_border * 2)) / 2)) + 'px';
			
			if (this.closePosition == 'left') {
				var marginLeftClose = Math.floor(this.scrollOffset['left'] + (this.viewport['width'] / 2) - ((x + (lightbox_border * 2)) / 2)  - (parseInt($(id_viewer_closebox).getStyle('width')) / 2)) + 'px';
			} else {
				var marginLeftClose = Math.floor(this.scrollOffset['left'] + (this.viewport['width'] / 2) + ((x + (lightbox_border * 2)) / 2)  - (parseInt($(id_viewer_closebox).getStyle('width')) / 2)) + 'px';
			}
			var marginTopClose = Math.floor(this.scrollOffset['top'] + (this.viewport['height'] / 2) - ((y + (lightbox_border * 2)) / 2)  - (parseInt($(id_viewer_closebox).getStyle('height')) / 2)) + 'px';

			$(id_viewer_image).setAttribute('src', img);
			$(id_viewer_image).style.width = imgWidth;
			$(id_viewer_image).style.height = imgHeight;

			// resize animation
			this.resizeAnimations(boxWidth, boxHeight, marginLeft, marginTop, marginLeftClose, marginTopClose);
			window.imgViewer_aniResize.seekTo(1);

		} else {
			setTimeout("myViewer.resize('"+img+"', '"+x+"', '"+y+"')",50);
		}
	},

// --- animations (Documentation: http://berniecode.com/writing/animator.html)	
	
	basicAnimations: function() {
		
		// visibilty of the viewer
		window.imgViewer_aniViewer = new Animator({
			duration: 250
		}).addSubject(new NumericalStyleSubject(
		    $(id_viewer), 'opacity', 0, 1)
		).addSubject(this.setVisibilityViewer);
	
		// visibilty of the overlay
		window.imgViewer_aniOverlay = new Animator({
			duration: 250
		}).addSubject(new NumericalStyleSubject(
		    $(id_viewer_overlay), 'opacity', 0, 1)
		).addSubject(this.setVisibiltyOverlay);
	
		// visibility of the loading indicator
		window.imgViewer_aniLoading = new Animator({
			duration: 250
		}).addSubject(new NumericalStyleSubject(
		    $(id_viewer_loading), 'opacity', 0, 1)
		).addSubject(this.setVisibiltyLoading);
		
		// visibility of the img loading indicator
		window.imgViewer_aniProcessing = new Animator({
			duration: 250
		}).addSubject(new NumericalStyleSubject(
		    $(id_viewer_processing), 'opacity', 0, 1)
		).addSubject(this.setVisibiltyProcessing);
	},
	
	resizeAnimations: function(boxWidth, boxHeight, marginLeft, marginTop, marginLeftClose, marginTopClose) {
		window.imgViewer_aniResize = new Animator().addSubject(new CSSStyleSubject(
			$(id_viewer_container), 'width: '+boxWidth+'; height: '+boxHeight+'; margin-left: '+marginLeft+'; margin-top: '+marginTop+';')
		).addSubject(new CSSStyleSubject(
			$(id_viewer_closebox), 'margin-left: '+marginLeftClose+'; margin-top: '+marginTopClose+';')
		).addSubject(this.showImage);
	},
	
	imgAnimations: function() {
		
		// visibilty of the image
		window.imgViewer_aniImage = new Animator({
			duration: 250
		}).addSubject(new NumericalStyleSubject(
		    $(id_viewer_image), 'opacity', 0, 1)
		).addSubject(new NumericalStyleSubject(
			$(id_viewer_navi_left), 'opacity', 0.2, 1)
		).addSubject(new NumericalStyleSubject(
			$(id_viewer_navi_right), 'opacity', 0.2, 1)
		).addSubject(
			this.setVisibiltyImage
		);
		
		// visibilty of the title
		window.imgViewer_aniTitle = new Animator({
			duration: 250
		}).addSubject(	new CSSStyleSubject(
			$(id_viewer_title), 'height: '+lightbox_title_lineheight+'px; margin-top: -'+lightbox_title_lineheight+'px')
		);
		
	},
	
	showImage: function(value) {
		if(value == 1) {
			window.imgViewer_aniImage.seekTo(1);
		}
	},
	
	setVisibilityViewer: function(value) {
		if(value == 0) {
			$(id_viewer).setStyle({ display: 'none' });
		} else {
			$(id_viewer).setStyle({ display: 'block' });
		}
	},
	
	setVisibiltyOverlay: function(value) {
		if(value == 0) {
			$(id_viewer_overlay).setStyle({ display: 'none' });
		} else {
			$(id_viewer_overlay).setStyle({ display: 'block' });
		}
	},
	
	setVisibiltyLoading: function(value) {
		if(value == 0) {
			$(id_viewer_loading).setStyle({ display: 'none' });
		} else {
			$(id_viewer_loading).setStyle({ display: 'block' });
		}
	},
	
	setVisibiltyProcessing: function(value) {
		if(value == 0) {
			$(id_viewer_processing).setStyle({ display: 'none' });
		} else {
			$(id_viewer_processing).setStyle({ display: 'block' });
		}
	},
	
	setVisibiltyImage: function(value) {
		if(value == 0) {
			$(id_viewer_image).setStyle({ display: 'none' });
		} else {
			$(id_viewer_image).setStyle({ display: 'block' });
		}
	}
	
}

// --- END