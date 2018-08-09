/******************************************************************************
Name:    Resize Control
Version: 1.0 (March 19 2008)
Author:  Sebastian Brink
Contact: http://www.quadrifolia.de

Licence:
Resize Control is licensed under a Creative Commons Attribution-Noncommercial 
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

var floorSize = 				0.25;
var ceilingSize = 				1.00;
var startSize =					0.25;

// --- class

Resize = Class.create();

Resize.prototype = {

	initialize: function(wrapper, options) {
		
		var resizer = this;
		
		// options
		this.options = options || {};
		this.listItem = this.options.listItem;
		this.images = this.options.images;
		this.reflections = this.options.reflections;
		this.titles = this.options.titles;
		this.startValues = this.options.startValues;
		
		this.wrapper = wrapper;
		
		// call this functions on slider change
		mySlider.options.onSlide = function(value) {
			myResize.draw(value);
		}
		
		this.initialized = true;
		
		this.draw(startSize);
		
	},
	
	draw: function(value) {
		
		// set start size
		startSize = value;
		
		// ratio
		this.ratio = floorSize + (value * (ceilingSize - floorSize));
		
		// area width
		this.thumbsAreaWidth = parseInt(Element.getStyle(this.wrapper, 'width'));
		
		// calculate new list item size
		this.newThumbsItemWidth = Math.round(this.ratio * thumbsMaxWidth);
		this.newThumbsItemHeight = Math.round(this.ratio * totalMaxHeight);
		
		if (reflection === true) {
			this.newThumbsItemHeight = this.newThumbsItemHeight + Math.round(this.ratio * reflectionHeight) + reflectionTopMargin;
		}
		
		// calculate new item margins
		this.itemsInLine = Math.floor(this.thumbsAreaWidth / (this.newThumbsItemWidth + thumbsMinMargin));
		if (this.itemsInLine > this.images.length) {
			this.itemsInLine = this.images.length;
		}
		this.itemsInLineWidth = this.itemsInLine * (this.newThumbsItemWidth + thumbsMinMargin);
		this.newThumbsItemMargin = Math.floor((this.thumbsAreaWidth - this.itemsInLineWidth) / (this.itemsInLine * 2)) + (thumbsMinMargin / 2);
		
		// calculate and set new thumbs area height
		this.linesInArea = Math.ceil(this.images.length / this.itemsInLine);
		this.newThumbsAreaHeight = Math.ceil(this.linesInArea * (this.newThumbsItemHeight + thumbsMarginTop));
		$(this.wrapper).style.height = this.newThumbsAreaHeight + 'px';

		// resize content
		for (var i=0, j=this.images.length; i<j; i+=1) {
		
			// calculate new image size
			this.newImageWidth = Math.floor(this.ratio * this.startValues[i][0]);
			this.newImageHeight = Math.floor(this.ratio * this.startValues[i][1]);
			
			// calculate new reflection size
			if (reflection === true) {
				this.newReflectionWidth = this.newImageWidth;
				this.newReflectionHeight = Math.floor(this.ratio * reflectionHeight);
			}
			
			// calculate new left margin
			this.newMarginLeft = Math.floor((this.newThumbsItemWidth - this.newImageWidth) / 2);
			
			// scale the images
			this.images[i].style.width = this.newImageWidth + 'px';
		    this.images[i].style.height = this.newImageHeight + 'px';
			this.images[i].style.marginLeft = this.newMarginLeft + 'px';
		
			// scale the reflection
			if (reflection === true) {
				this.reflections[i].style.width = this.newReflectionWidth + 'px';
		    	this.reflections[i].style.height = this.newReflectionHeight + 'px';
				this.reflections[i].style.marginTop = reflectionTopMargin + 'px';
				this.reflections[i].style.marginLeft = this.newMarginLeft + 'px';
			}
			
			// scale the title
			if (this.newThumbsItemWidth >= 150) {
				this.titles[i].style.marginTop = '-' + this.newReflectionHeight + 'px';
				this.titles[i].style.marginLeft = this.newMarginLeft + 'px';
				this.titles[i].style.width = this.newReflectionWidth + 'px';
				this.titles[i].style.display = 'block';
				if (this.newThumbsItemWidth >= 250) {
					this.titles[i].style.fontSize = '12px';
				} else if (this.newThumbsItemWidth >= 200) {
					this.titles[i].style.fontSize = '11px';
				} else {
					this.titles[i].style.fontSize = '10px';
				}
			} else {
				this.titles[i].style.display = 'none';
			}
			
			// scale the items
			this.listItem[i].style.width = this.newThumbsItemWidth + 'px';
		    this.listItem[i].style.height = this.newThumbsItemHeight + 'px';
		
			// set the new items margin
			this.listItem[i].style.marginLeft = this.newThumbsItemMargin + 'px';
			this.listItem[i].style.marginRight = this.newThumbsItemMargin + 'px';
			this.listItem[i].style.marginTop = thumbsMarginTop + 'px';
			
			// arrange the item to the frame bottom
			if (reflection === true) {
				this.images[i].style.marginTop = this.newThumbsItemHeight - this.newImageHeight - this.newReflectionHeight - reflectionTopMargin + 'px';
			} else {
				this.images[i].style.marginTop = this.newThumbsItemHeight - this.newImageHeight + 'px';
			}
			
			// resize scroller
			myScroller.resizeHandle();
			
		}
		
	}
	
}

// --- END