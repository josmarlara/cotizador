/******************************************************************************
Name:    qGallery
Version: 0.9 (March 31 2008)
Author:  Sebastian Brink
Contact: http://www.quadrifolia.de

Licence:
qGallery is licensed under a Creative Commons Attribution-Noncommercial 
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
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE REGENTS OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
DAMAGE.
******************************************************************************/


/******************************************************************************
CREDITS: Bernard Sumption (berniecode.com), Peter-Paul Koch (quirksmode.org),
Lokesh Dhakar (huddletogether.com), Apple (apple.com), and others.
******************************************************************************/



//------------------------------------------------------------------------------------------------------------------------
// globals
//------------------------------------------------------------------------------------------------------------------------

var contentFolder = 			'content';		// folder containing the images

var wrapper = 					'gallery'; 		// id of the element that should contain the gallery
var fullscreen = 				false;			// not implemented yet
var reflection =				true;			// image reflections - false / true
var showThumbs = 				true;
var showMosaic = 				false;			// not implemented yet
var showCarousel =				true;

var contentRightMargin =		10;
var contentLeftMargin =			10;

var thumbsMaxWidth = 			400;
var thumbsMaxHeight = 			400;
var thumbsMinMargin =			20;
var thumbsMarginTop =			10;

var reflectionHeight = 			50;
var reflectionTopMargin = 		2;
var reflectionColor =			'000000';
var reflectionStartAlpha =		80;
var reflectionEndAlpha =		0;

// imgLoader
var imgCounter =				0;

// error
var errorBreak = 				false;

var totalMaxHeight, totalMaxWidth, errorType, errorValue, checkObj;

//------------------------------------------------------------------------------------------------------------------------
// files
//------------------------------------------------------------------------------------------------------------------------

var xml_overview =				contentFolder+'/overview.xml';

//------------------------------------------------------------------------------------------------------------------------
// nomenclature
//------------------------------------------------------------------------------------------------------------------------

// main parts
var id_header = 				'gallery_header';
var id_content = 				'gallery_content';
var id_footer = 				'gallery_footer';
var id_title = 					'gallery_title';
var id_overview = 				'gallery_overview';

// animation parts
var id_loader = 				'gallery_loader';
var id_loader_ani = 			'gallery_loader_animation';

// thumbnail-view elements
var id_thumbs = 				'thumbs';
var id_thumbsList =				'thumbs_list';
var class_thumbsListItem =		'thumbs_item';
var class_thumbsImage =			'thumbs_img';
var class_thumbsReflection =	'thumbs_reflection';
var class_thumbsTitle =			'thumbs_title';

// button elements
var id_buttons =				'buttons';
var id_button_thumbs =			'viewGrid';
var id_button_mosaic =			'viewMosaic';
var id_button_carousel =		'viewCarousel';
var id_button_overview = 		'viewOverview';

//------------------------------------------------------------------------------------------------------------------------
// translations
//------------------------------------------------------------------------------------------------------------------------

if ((navigator.userLanguage) && (navigator.userLanguage.indexOf('de') > -1)) {
	var user_language = 'de';
} else if (navigator.language.indexOf('de') > -1) {
	var user_language = 'de';
}

if (user_language == 'de') {
	var lang_pictures = 'Bilder';
} else {
	var lang_pictures = 'images';
}

//------------------------------------------------------------------------------------------------------------------------
// initialize the gallery
//------------------------------------------------------------------------------------------------------------------------

function initGallery() { 
	myXML = new processXML({});
	
	myGallery = new Gallery({
		wrapper: wrapper,
		reflection: reflection,
		fullscreen: fullscreen
	});
}

Event.observe(window, 'load', initGallery, false);

//------------------------------------------------------------------------------------------------------------------------




//------------------------------------------------------------------------------------------------------------------------
// CLASS Galery
//
// initialize the gallery parts
//------------------------------------------------------------------------------------------------------------------------

Gallery = Class.create();

Gallery.prototype = {

	initialize: function(options) {
		
		var gallery = this;
		
		// options
		this.options = options || {};
		this.wrapper = this.options.wrapper;
		this.reflection = this.options.reflection;
		this.fullscreen = this.options.fullscreen;
		
		// ini builder
		myBuilder = new Builder({
			wrapper: this.wrapper,
			reflection: this.reflection
		});
		
		// start
		this.gallery();
		
	},
	
	gallery: function() {
		myBuilder.gallery();
		this.overview();
	},
	
	overview: function() {
		myBuilder.overview(xml_overview);
	},
	
	thumbs: function(xml, recall) {
		
		if (recall === false) {
			
			window.aniLoader.seekTo(1);
			setTimeout(function() {myBuilder.thumbs(xml);}, 500);
		
		} else if ((recall === true) && (errorBreak === false)) {
			
			// vars
			var imgReady = true;
			var imgElements = $$('#'+id_thumbs+' img');
			
			var imgArray = new Array();
			var startValues = new Array();
			
			// check if all images are loaded
			for (var i=0, j=imgElements.length; i<j; i+=1) {
				if (imgElements[i].complete != true) {
					imgReady = false;
				}
			}
				
			if(imgReady === false) {
				
				setTimeout(function() {myGallery.thumbs('', true);}, 250);
				
			} else {
				
				// get size of images
				imgArray = new Array();
				this.zeroTrigger = false;
				this.images = $$('.'+class_thumbsImage);
				this.titles = $$('.'+class_thumbsTitle);
				this.listItem = $$('.'+class_thumbsListItem);
				for (var i=0, j=this.images.length; i<j; i+=1) {
					imgArray[i] = new Image();
					imgArray[i].src = this.images[i].src;
					
					// safari image width and height = 0 bug
					if ((imgArray[i].width == 0) || (imgArray[i].height == 0)) {
						this.zeroTrigger = true;
					}
				}
				
				if (this.zeroTrigger === true) {
					
					setTimeout(function() {myGallery.thumbs('', true);}, 50);
					
				} else {
					
					for (var i=0; i<imgArray.length; i+=1) {
						startValues[i] = new Array(imgArray[i].width, imgArray[i].height);
					
						// img max values
						if (typeof totalMaxWidth == 'undefined' || imgArray[i].width > totalMaxWidth) {
							totalMaxWidth = imgArray[i].width;
						}
						if (typeof totalMaxHeight == 'undefined' || imgArray[i].height > totalMaxHeight) {
							totalMaxHeight = imgArray[i].height;
						}
					}
				
					// set reflections
					if (this.reflection === true) {
						this.reflectionImages = document.getElementsByClassName(class_thumbsReflection);
						for (var i=0, j=this.reflectionImages.length; i<j; i+=1) {
							this.reflectionImages[i].setStyle({ display: 'block' });
						}
					} else {
						this.reflectionImages = 'empty';
					}

					// ini slider
				    mySlider = new Control.Slider(id_footer, {
				        sliderValue: startSize, slider: id_slider, sliderTrack: id_sliderTrack, sliderHandle: id_sliderHandle, sliderLeftIcon: id_sliderLeftIcon, sliderRightIcon: id_sliderRightIcon
				    });
			
					// ini scroller
					if(!$(id_scroller_track)) {
						myScroller = new contentScroller(id_scroller_container, id_thumbs, {
							arrowPosition: setting_scroller_arrow,
							trackPosition: setting_track_position,
							offsetTop: setting_offset_top,
							offsetBottom: setting_offset_bottom,
							contentRightMargin: contentRightMargin,
							contentLeftMargin: contentLeftMargin
						});
					} else {
						myScroller.setContent(id_thumbs);
					}
				
					// ini buttons
					myButtons = new Control.Buttons(id_footer, {
						showThumbs: showThumbs, showMosaic: showMosaic, showCarousel: showCarousel, idButtons: id_buttons, idThumbs: id_button_thumbs, idMosaic: id_button_mosaic, idCarousel: id_button_carousel
					});
			
					// ini resize
				    myResize = new Resize(id_thumbs, {
						listItem: this.listItem,
						images: this.images,
						reflections: this.reflectionImages,
						titles: this.titles,
						startValues: startValues
					});
				
					// ini viewer
					myViewer = new imgViewer({
						marker: lightbox_marker,
						close: lightbox_close,
						listner: lightbox_listner
					});
				
					// show thumbnails
					switchView(id_thumbs);
				}

			}
		
		} else {
			if (errorType == '404') {
				alert('ERROR: image "'+errorValue+'" is missing!')
			} else if (errorType == 'failure') {
				alert('ERROR: something went wrong!')
			}
			return true;
		}
	
	},
	
	carousel: function() {
		
		if(typeof myCarousel == 'object') {
			myCarousel.stopAnimation();
		}

		myCarousel = new Carousel(id_content, {
			animationTime: 800,
			waitTime: 1000,
			fastAnimationTime: 50,
			fastWaitTime: 0,
			saveTime: 0,
			displayTitle: true,
			carouselWidth: parseInt(Element.getStyle(id_content, 'width')) - (contentLeftMargin + contentRightMargin),
			carouselHeight: parseInt(Element.getStyle(id_content, 'height')),
			reflectionHeight: 50,
			reflectionTopMargin: 2,
			imgSourceType: 'href',
			imgSource: id_thumbs
		});
		
	}
		
}

//------------------------------------------------------------------------------------------------------------------------





//------------------------------------------------------------------------------------------------------------------------
// CLASS Builder
//
// build the gallery parts
//------------------------------------------------------------------------------------------------------------------------

Builder = Class.create();

Builder.prototype = {
	
	initialize: function(options) {
		
		var builder = this;
		
		// options
		this.options = options || {};
		this.wrapper = this.options.wrapper;
		this.reflection = this.options.reflection;
		
		// vars
		this.wrapperWidth = parseInt(Element.getStyle(wrapper, 'width'));
		this.wrapperHeight = parseInt(Element.getStyle(wrapper, 'height'));
		
		this.initialized = true;
		
	},
	
	gallery: function() {
		
		// build elements
		
		var objHeader = new Element('div', { id: id_header });
		$(this.wrapper).appendChild(objHeader);
		
		var objContent = new Element('div', { id: id_content });
		$(this.wrapper).appendChild(objContent);
		
		var objFooter = new Element('div', { id: id_footer });
		$(this.wrapper).appendChild(objFooter);
		
		var objTitle = new Element('div', { id: id_title });
		objHeader.appendChild(objTitle);
		
		var objButton = new Element('a', { id: id_button_overview, href: '#' });
		objHeader.appendChild(objButton);
		
		Event.observe(objButton, 'click', new Function('fx', 'myButtons.show_overview()'));
		
		var objLoader = new Element('div', { id: id_loader });
		$(this.wrapper).appendChild(objLoader);
		
		var objLoaderAni = new Element('div', { id: id_loader_ani });
		objLoader.appendChild(objLoaderAni);
		
		// set styles
		this.headerHeight = parseInt(Element.getStyle(id_header, 'height'));
		this.footerHeight = parseInt(Element.getStyle(id_footer, 'height'));
		this.contentHeight = this.wrapperHeight - this.headerHeight - this.footerHeight;
		
		$(id_header).setStyle({
			width: this.wrapperWidth + 'px',
			top: '0px',
			left: '0px'
		});
		
		$(id_content).setStyle({
			width: this.wrapperWidth + 'px',
			height: this.contentHeight + 'px',
			top: this.headerHeight + 'px',
			left: '0px'
		});
		
		$(id_footer).setStyle({
			width: this.wrapperWidth + 'px',
			top: (this.headerHeight + this.contentHeight) + 'px',
			left: '0px'
		});
		
		$(id_button_overview).setStyle({
			display: 'none'
		});
		
		$(id_loader).setStyle({
			width: this.wrapperWidth + 'px',
			height: this.contentHeight + 'px',
			top: this.headerHeight + 'px',
			left: '0px'
		});
		
		// build animations
		buildAnimation_loader();
		
	},
	
	overview: function(xml_file) {
		
		// load xml file
		myXML.load(xml_file);
		
		// call this functions on xml load
		myXML.options.onBuild = function(value) {
			
			// build elements
			
			var objHeadline = new Element('h1', {}).update(value['name'][0]);
			$(id_title).appendChild(objHeadline);
			
			var objButtonSpan = new Element('span', {}).update(value['name'][0]);
			$(id_button_overview).appendChild(objButtonSpan);
			
			var objOverview = new Element('div', { id: id_overview });
			$(id_content).appendChild(objOverview);

			for (var i=0, j=value['id'].length; i<j; i+=1) {
				
				var objSkimmerWrapper = new Element('div', { 'class': class_SkimmerWrapper, id: (class_SkimmerWrapper + '_' + i) });
				objOverview.appendChild(objSkimmerWrapper);
				
				var objSkimmer = new Element('div', { 'class': class_Skimmer, id: (class_Skimmer + '_' + i) }).setStyle({
					backgroundColor: 'transparent',
					background: 'url(skimmer.php?mode=xml&id=' + value['id'][i] + '&dir='+contentFolder+'&xml=' + value['xml'][i] + '&sWidth=' + skimmerMaxWidth + '&sHeight=' + skimmerMaxHeight + ')',
					backgroundRepeat: 'no-repeat',
					backgroundPosition: 'top left'
				});
				objSkimmerWrapper.appendChild(objSkimmer);
				
				Event.observe(objSkimmer, 'click', new Function('fx', 'myGallery.thumbs("'+contentFolder+'/'+value['xml'][i]+'", false)'));
				
				var objSkimmerMask = new Element('div', { 'class': class_SkimmerMask });
				objSkimmer.appendChild(objSkimmerMask);
				
				var objSkimmerTitle = new Element('p', { 'class': class_SkimmerTitle }).update(value['title'][i]);
				objSkimmerWrapper.appendChild(objSkimmerTitle);
				
				var objSkimmerCounter = new Element('p', { 'class': class_SkimmerCounter }).update(value['img_count'][i] + ' ' + lang_pictures);
				objSkimmerWrapper.appendChild(objSkimmerCounter);

			}
			
			// calculate margins
			var skimmerWidth = parseInt(Element.getStyle((class_SkimmerWrapper + '_0'), 'width'));
			var skimmerHeight = parseInt(Element.getStyle((class_SkimmerWrapper + '_0'), 'height'));
			var skimmerTopMargin = parseInt(Element.getStyle((class_SkimmerWrapper + '_0'), 'marginTop'));
			var skimmerMinMargin = parseInt(Element.getStyle((class_SkimmerWrapper + '_0'), 'marginLeft'));
			var skimmerFrames = document.getElementsByClassName(class_SkimmerWrapper);
			var skimmerCounter = value['id'].length;
			var skimmerMaxInLine = Math.floor( parseInt(Element.getStyle(id_overview, 'width')) / (skimmerWidth + skimmerMinMargin) );
			var skimmerNewMargin = Math.floor( ( parseInt(Element.getStyle(id_overview, 'width')) - (skimmerMaxInLine * (skimmerWidth + skimmerMinMargin)) - skimmerMinMargin ) / (skimmerMaxInLine + 1) );
				
			// calculate overview height
			var lineCount = Math.ceil(skimmerCounter / skimmerMaxInLine);
			var newOverviewHeight = (lineCount * (skimmerHeight + skimmerTopMargin));
			$(id_overview).setStyle({
				height: newOverviewHeight + 'px'
			});
			
			// init the scrollbar
			myScroller = new contentScroller("gallery_content", "gallery_overview", {
				arrowPosition: setting_scroller_arrow,
				trackPosition: setting_track_position,
				offsetTop: setting_offset_top,
				offsetBottom: setting_offset_bottom,
				contentRightMargin: contentRightMargin,
				contentLeftMargin: contentLeftMargin
			});
			
			// recalculate everything
			skimmerMaxInLine = Math.floor( parseInt(Element.getStyle(id_overview, 'width')) / (skimmerWidth + skimmerMinMargin) );
			skimmerNewMargin = Math.floor( ( parseInt(Element.getStyle(id_overview, 'width')) - (skimmerMaxInLine * (skimmerWidth + skimmerMinMargin)) - skimmerMinMargin ) / (skimmerMaxInLine + 1) );
			lineCount = Math.ceil(skimmerCounter / skimmerMaxInLine);
			newOverviewHeight = (lineCount * (skimmerHeight + skimmerTopMargin));
			$(id_overview).setStyle({
				height: newOverviewHeight + 'px'
			});
			
			// set scrollbar
			myScroller.resizeHandle();
			
			// set the new skimmer margin
			for (var i=0, j=skimmerFrames.length; i<j; i+=1) {
				skimmerFrames[i].style.marginLeft = skimmerMinMargin + skimmerNewMargin +'px';
			}
			
			// init the skimmer function
			mySkimmer = new Control.Skimmer({
				marker: class_Skimmer,
				indicator: true,
				size: 160
			});
			
			// loading screen
			if ($(id_loader).getStyle('display') != 'none') {
				window.aniLoader.seekTo(0);
			}
		}
	},
	
	thumbs: function(xml_file) {
			
		// load xml file
		myXML.load(xml_file);

		// call this functions on xml load
		myXML.options.onBuild = function(value) {
			
			// get dimensions
			this.viewport = document.viewport.getDimensions();
		
			// build elements
			if(!$(id_thumbs)) {
				var objThumbs = new Element('div', { id: id_thumbs });
				$(id_content).appendChild(objThumbs);
			} else {
				clearContent(id_thumbs);
				var objThumbs = $(id_thumbs);
			}
		
			var objList = new Element('ul', { 'class': id_thumbsList });
			objThumbs.appendChild(objList);
		
			// build list elements
			for (var i=0, j=value['title'].length; i<j; i+=1) {
				
				// check if file exists (with javascript)
				// javascript method disabled, because it loads the file				
				// checkObj = new Ajax.Request(contentFolder+'/'+value['file'][i], {
				// 	onSuccess: function(response) {
				// 		checkObj.transport.abort();
				// 	},
				// 	on404: function(response) {
				// 		errorBreak = true;
				// 		errorType = '404';
				// 	},
				// 	onFailure: function(response) {
				// 		errorBreak = true;
				// 		errorType = 'failure';
				// 	}
				// });
				
				// check if file exists (with php)
				checkObj = new Ajax.Request('image.php?check=true&dir='+contentFolder+'&img='+value['file'][i], {
					onSuccess: function(response) {
						var responseMessage = new Array();
						responseMessage = response.responseText.split('|');
						if (responseMessage[0] == 404) {
							errorBreak = true;
							errorType = '404';
							errorValue = responseMessage[1];
						}
					},
					onFailure: function(response) {
						errorBreak = true;
						errorType = 'failure';
					}
				});
				
				// build
				var objListElement = new Element('li', { 'class': class_thumbsListItem });
				objList.appendChild(objListElement);
				
				var objLink = new Element('a', { 'class': lightbox_marker, href: 'viewer.php?dir='+contentFolder+'&img=' + value['file'][i] + '&width=' + this.viewport['width'] + '&height=' + this.viewport['height'], title: value['title'][i] });
				objLink.onclick = function() {return false;};
				objListElement.appendChild(objLink);
				
				var objThumb = new Element('img', { 'class': class_thumbsImage, src: 'image.php?dir='+contentFolder+'&img=' + value['file'][i] + '&width=' + thumbsMaxWidth + '&height=' + thumbsMaxHeight + '&sWidth=' + skimmerMaxWidth + '&sHeight=' + skimmerMaxHeight + '&rHeight=' + reflectionHeight + '&color=' + reflectionColor + '&sAlpha=' + reflectionStartAlpha + '&eAlpha=' + reflectionEndAlpha + '&output=img' });
				objLink.appendChild(objThumb);

				if (myBuilder.reflection === true) {
					var objReflection = new Element('img', { 'class': class_thumbsReflection, src: 'image.php?dir='+contentFolder+'&img=' + value['file'][i] + '&width=' + thumbsMaxWidth + '&height=' + thumbsMaxHeight + '&sWidth=' + skimmerMaxWidth + '&sHeight=' + skimmerMaxHeight + '&rHeight=' + reflectionHeight + '&color=' + reflectionColor + '&sAlpha=' + reflectionStartAlpha + '&eAlpha=' + reflectionEndAlpha + '&output=refl' });
					objListElement.appendChild(objReflection);
				}

				var objTitle = new Element('div', { 'class': class_thumbsTitle });
				objListElement.appendChild(objTitle);
				
				var objTitleSpan = new Element('span', {}).update(value['title'][i]);
				objTitle.appendChild(objTitleSpan);
		
			}
			
			// recall
			myGallery.thumbs('', true);
			
		}
	}
	
}

//------------------------------------------------------------------------------------------------------------------------





//------------------------------------------------------------------------------------------------------------------------
// CLASS CONTROL BUTTONS
//
// controls the navigation buttons
//------------------------------------------------------------------------------------------------------------------------

if(!Control) var Control = {};
Control.Buttons = Class.create();

Control.Buttons.prototype = {
	
	initialize: function(target, options) {
		
		var buttons = this;
		
		// options
		this.options = options || {};
		
		this.showThumbs = this.options.showThumbs;
		this.showMosaic = this.options.showMosaic;
		this.showCarousel = this.options.showCarousel;
		this.id_buttonWrapper = this.options.idButtons;
		this.id_thumbs = this.options.idThumbs;
		this.id_mosaic = this.options.idMosaic;
		this.id_carousel = this.options.idCarousel;
		
		this.target = $(target);
		
		// create DOM nodes
		if(!$(this.id_buttonWrapper)) {			
			var objButtons = document.createElement('div');
			objButtons.setAttribute('id', this.id_buttonWrapper);
			objButtons.style.display = 'none';
			this.target.appendChild(objButtons);
			
			if (this.showThumbs === true) {
				var objButtonThumbs = document.createElement('div');
				objButtonThumbs.setAttribute('id', this.id_thumbs);
				objButtons.appendChild(objButtonThumbs);
				
				Event.observe($(this.id_thumbs), 'click', this.show_thumbOverview.bindAsEventListener(this));
			}
			
			if (this.showMosaic === true) {
				var objButtonMosaic = document.createElement('div');
				objButtonMosaic.setAttribute('id', this.id_mosaic);
				objButtons.appendChild(objButtonMosaic);
				
				Event.observe($(this.id_mosaic), 'click', this.show_mosaicOverview.bindAsEventListener(this));
				
			}
			
			if (this.showCarousel === true) {
				var objButtonCarousel = document.createElement('div');
				objButtonCarousel.setAttribute('id', this.id_carousel);
				objButtons.appendChild(objButtonCarousel);
				
				Event.observe($(this.id_carousel), 'click', this.show_carouselOverview.bindAsEventListener(this));
			}
		}
		
		this.initialized = true;
		
		this.draw();
	},
	
	show_thumbOverview: function(e) {
		if (Element.getStyle(id_thumbs, 'display') != 'block') {
			window.aniLoader.seekTo(1);
			setTimeout(function() {switchView(id_thumbs);}, 500);
		}
	},
	
	show_mosaicOverview: function(e) {
		alert('switch to mosaic');
	},
	
	show_carouselOverview: function(e) {
		window.aniLoader.seekTo(1);
		setTimeout(function() {switchView(id_carousel);}, 500);
	},
	
	show_overview: function(e) {
		window.aniLoader.seekTo(1);
		setTimeout(function() {switchView(id_overview);}, 500);
	},
	
	draw: function() {
		$(this.id_buttonWrapper).setStyle({
			display: 'block'
		});
	}
	
}

//------------------------------------------------------------------------------------------------------------------------





//------------------------------------------------------------------------------------------------------------------------
// ANIMATIONS
//
// some more basic animations
//------------------------------------------------------------------------------------------------------------------------

// animation of overlay layer

function buildAnimation_loader() {
	if (typeof window.aniLoader == 'undefined') {
		window.aniLoader = new Animator({
			duration: 500
		}).addSubject(new NumericalStyleSubject(
		    $(id_loader), 'opacity', 0, 1)
		).addSubject(updateAnimation_loader);
	}
}

function updateAnimation_loader(value) {
	if(value == 0) {
		$(id_loader).setStyle({
			display: 'none'
		});
	} else {
		$(id_loader).setStyle({
			display: 'block'
		});
	}
}

// switch visibilty of gallery elements

function switchView(element) {
	
	if(element == id_thumbs) {
		
		$(id_overview, id_title).invoke('hide');
		$(id_thumbs, id_slider, id_button_overview, id_buttons).invoke('show');
		
		if ($(id_carousel)) {
			$(id_carousel).setStyle({
				display: 'none'
			});
		}
		
		if($('scroller_track')) {
			myScroller.setContent(id_thumbs);
		}
		
		window.aniLoader.seekTo(0);
		
	} else if(element == id_carousel) {
		
		myGallery.carousel();
		
		$(id_overview, id_thumbs, id_slider, id_title).invoke('hide');
		$(id_carousel, id_button_overview, id_buttons).invoke('show');
		
		if($('scroller_track')) {
			myScroller.setContent(id_carousel);
		}
		
		window.aniLoader.seekTo(0);
		
	} else if(element == id_overview) {
		
		$(id_thumbs, id_slider, id_button_overview, id_buttons).invoke('hide');
		$(id_overview, id_title).invoke('show');
		
		if ($(id_carousel)) {
			$(id_carousel).setStyle({
				display: 'none'
			});
		}
		
		if($('scroller_track')) {
			myScroller.setContent(id_overview);
		}
		
		window.aniLoader.seekTo(0);
		
	}
	
}

//------------------------------------------------------------------------------------------------------------------------

