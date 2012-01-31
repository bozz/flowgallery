/*!
 * jQuery flowgallery plugin: Cover Flow Image Gallery
 * Examples and documentation at: http://github.com/bozz/flowgallery
 * Version: 1.0.0pre (01-FEB-2012)
 * Author: Boris Searles (boris@lucidgardens.com)
 * Requires jQuery v1.3.2 or later
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */
(function($) {



var FlowGallery = function(element, options) {

  // private variables
  var $list = $(element);     // reference to list as jquery object
  var $container = $list.parent(); // parent element of list
  var listWidth = 0;          // list width (default: screen width)
  var listHeight = 0;         // list height (height of highest image)
  var $caption = false;       // caption element
  var elCounter = 0;          // number of list items
  var flowItems = [];         // array of FlowItems
  var activeLoaded = false;   // has active image been loaded?
  var centerX = 0;            // horizontal center within list
  var centerY = 0;            // vertical center within list
  var self = this;

  // public variables

  // clone defaults and then merge custom options
  this.options = $.extend({}, $.fn.flowgallery.defaults, options);
  this.length = $list.children().length;

  this.activeIndex = 0;      // activeIndex
  this.activeElem = false;   // reference to active FlowItem

  this.next = function() {
    self.flowInDir(1);
  };

  this.prev = function() {
    self.flowInDir(-1);
  };

  this.goto = function(index) {
    self.flowInDir(index - self.activeIndex);
  };


  // initialize gallery
  var init = function() {
    initDom();
    initFlowItems();

    $list.css('visibility', 'visible');

    $(window).resize(windowResizeHandler);

    if(self.options.enableKeyNavigation===true) {
      $(document).unbind('keydown', handleKeyEvents).keydown(handleKeyEvents);
    }

    updateFlow(false);
  };


  // initialize dom setup and styling
  var initDom = function() {
    // set required styling on list element
    $list.css({
      listStyle: 'none',
      overflow: 'hidden',
      marginLeft: '0',
      paddingLeft: '0',
      position: 'relative',
      width: '100%'
    });

    initCaption();
    initWrapper();
  };


  // initialize caption - a single instance is shared by all images
  var initCaption = function() {
    var captionElem = document.createElement('p');
    $caption = $(captionElem).addClass('bf-caption').css({
      backgroundColor: self.options.backgroundColor,
      display: 'none',
      marginTop: '0',
      padding: '8px ' + (self.options.imagePadding+10) + 'px 15px',
      position: 'absolute'
    });
  };


  // initialize wrapper around gallery - used for positioning caption
  var initWrapper = function() {
    var wrapperElem = document.createElement('div');
    $(wrapperElem)
    .addClass('bf-wrapper').css({
      position: 'relative'
    })
    .append( $list.get(0) )
    .append( $caption.get(0) );
    $container.append(wrapperElem);
  };


  var initFlowItems = function() {
    // loop through list items to extract image data and determine list height
    $list.children().each(function(index) {
      flowItems.push( new FlowItem(this, index, self, itemLoadedHandler) );
    });

    listWidth = $container.width();
    centerX = listWidth*0.5;

    var activeImageHeight = false;
    if(self.activeElem.isLoaded) {
      activeImageHeight = self.activeElem.h;
    }

    if(activeImageHeight) {
      centerY = self.options.thumbTopOffset==='auto' ? activeImageHeight*0.5 : self.options.thumbTopOffset;
    } else {
      centerY = self.options.thumbTopOffset==='auto' ? listHeight*0.5 : self.options.thumbTopOffset + self.options.thumbHeight*0.5;
    }
  };


  var itemLoadedHandler = function(item) {
    if(item.index===self.options.activeIndex) {
      activeLoaded = true;
      centerY = self.options.thumbTopOffset==='auto' ? item.h*0.5 : self.options.thumbTopOffset;
    } else {
      var animateParams = { height: item.th, width: item.tw };
      if(activeLoaded) {
        animateParams.top = (centerY - item.th*0.5) + 'px';
      }
      item.getListItem().animate(animateParams);
    }

    updateListHeight(item.h);

    // redraw in order to update thumbnail positions
    updateFlow();
  }


  // only applied after animation of 'active' element
  var afterFlowHandler = function(){
    showCaption();

    // adjust if width changed (i.e. if scrollbars get displayed)
    if($container.width() !== listWidth) {
      listWidth = $container.width();
      centerX = listWidth*0.5;
      updateFlow();
      showCaption();
    }
  };


  // special afterFlow handler for previously active item
  var getOldActiveAfterFlowHandler = function(itemIndex) {
    return function() {
      var item = flowItems[itemIndex];
      item.oldActive = false;
    }
  };


  var updateFlow = function(animate) {
    var config = {};
    var isBefore = true;   // in loop, are we before 'active' item
    var completeFn = null; // callback method to call after animation (for 'active' item)
    var currentItem = false;
    var $listItem = false;
    var itemsLength = flowItems.length;

    for(var i=0; i<itemsLength; i++) {
      currentItem = flowItems[i];
      $listItem = currentItem.getListItem();

      if( $listItem.hasClass('active') ) {
        config = {
          left: (centerX - self.options.imagePadding - currentItem.w * 0.5) + 'px',
          top: '0',
          width: currentItem.w+'px',
          height: currentItem.h+'px',
          padding: self.options.imagePadding+'px'
        };
        isBefore = false;
        completeFn = afterFlowHandler;
      } else {
        config = {
          left: calculateLeftPosition(i, isBefore),
          top: (centerY - currentItem.th*0.5) + 'px'
        };

        completeFn = null;

        // only animate width/height for old active item
        if(currentItem.oldActive) {
          config.width = currentItem.tw+'px';
          config.height = currentItem.th+'px';
          config.padding = self.options.thumbPadding+'px';
          completeFn = getOldActiveAfterFlowHandler(i);
        }
      }

      if(animate) {
        $listItem.stop().animate(config, { duration: self.options.duration, easing: self.options.easing, complete: completeFn });
      } else {
        $listItem.css(config);
        if(completeFn) { completeFn(); }
      }
    }
  };


  // trigger flow in direction from current active element;
  // positive value flows to the right, negative values to the left;
  this.flowInDir = function(dir) {
    var newIndex = self.activeIndex + dir;
    if(newIndex > flowItems.length-1 || newIndex < 0) {
      return false;
    }

    self.activeElem.oldActive = true; // mark old active item
    if(dir<0 && self.activeIndex > 0) {
      flowItems[self.activeIndex].oldActive = true;
      self.activeIndex += dir;
    } else if(dir>0 && self.activeIndex < flowItems.length-1) {
      self.activeIndex += dir;
    } else {
      return false;
    }
    self.activeElem = flowItems[self.activeIndex];
    prepareFlow();
    updateFlow(self.options.animate);
  };


  var prepareFlow = function() {
    //if (_options.circular) {
    //  _circularFlow(currentIndex);
    //}

    $caption.hide();
    $list.find('.active').removeClass('active');
    $(self.activeElem.getListItem()).addClass('active');

    // update width (changes if scrollbars disappear)
    listWidth = $container.width();
    centerX = listWidth*0.5;
  };


  var calculateLeftPosition = function(current, isBefore) {
    var left = centerX;
    var i = 0;

    if (isBefore) {
      left -= flowItems[self.activeIndex].w*0.5;
      left -= self.options.imagePadding;
      left -= (self.activeIndex - current) * 10;
      left -= (self.activeIndex - current) * 2 * self.options.thumbPadding;
      for (i = current; i < self.activeIndex; i++) {
        left -= flowItems[i].tw;
      }
    } else {
      left += flowItems[self.activeIndex].w*0.5;
      left += self.options.imagePadding;
      left += (current - self.activeIndex) * 10;
      left += (current - self.activeIndex) * 2 * self.options.thumbPadding;
      for (i = self.activeIndex + 1; i < current; i++) {
        left += flowItems[i].tw;
      }
    }
    return left + 'px';
  };


  // window resize handler - update gallery when window is resized
  var windowResizeHandler = function() {
    listWidth = $container.width();
    centerX = listWidth*0.5;
    updateFlow();
    showCaption();
  };


  // show caption under active image
  var showCaption = function() {
    var activeItem = self.activeElem;
    if(!activeItem.isLoaded) { return false; }

    var captionText = activeItem.captionText;
    if(captionText && captionText.length > 0){
      $caption.text(captionText);

      $caption.css({
        left: centerX - self.options.imagePadding - activeItem.w * 0.5,
        top: activeItem.h + self.options.imagePadding*2,
        width: activeItem.w - 20
      });

      // set height of caption as bottom margin for list
      var fullHeight = activeItem.h + $caption.height() + 40;
      $list.height(fullHeight);

      $caption.fadeIn('fast');
    }
  };


  // set list height to height of tallest image (needed for overflow:hidden)
  var updateListHeight = function(height) {
    if(height > listHeight) {
      listHeight = height;
      listHeight += self.options.imagePadding*2;
      $list.height(listHeight);
    }
  };


  // handle key events
  var handleKeyEvents = function(e) {
    if(e.keyCode===37) { // right arrow key
      self.flowInDir(-1);
    } else if(e.keyCode===39) { // left arrow key
      self.flowInDir(1);
    }
  };

  init();
};




var FlowItem = function(listItem, index, flowGallery, loadCompleteCallback) {
  this.h, this.th = flowGallery.options.loadingHeight;  // initialize heights
  this.w, this.tw = flowGallery.options.loadingWidth;   // initialize widths
  this.index = index; // index within the list
  this.active = false; // is active image?
  this.isLoaded = false; // is image fully loaded?
  this.captionText = false; // text specified within 'title' attribute of img
  this.oldActive = false; // is this image being animated away from active position?

  var self = this,
  $listItem = $(listItem),
  $img = false;


  this.getListItem = function() {
    return $listItem;
  };

  // custom 'bind' for hooking up custom events
  // to underlying $listItem
  this.bind = function(eventType, callback) {
    $listItem.bind(eventType, callback);
  };

  var init = function() {
    $img = $listItem.find('img');

    // TODO: if no image found, remove <li> item from list

    self.captionText = $img.attr('title');

    if(flowGallery.options.forceWidth) {
      $img.width(flowGallery.options.forceWidth);
    }

    // remove image and add 'loading' class
    $img.hide().parent().addClass(flowGallery.options.loadingClass).css({
      height: self.th,
      width: self.tw
    });

    addLoadHandler();

    $listItem.css({
      backgroundColor: flowGallery.options.backgroundColor,
      padding: flowGallery.options.thumbPadding,
      position: 'absolute',
      textAlign: 'center'
    });

    $img.css({
      cursor: 'pointer',
      height: '100%',
      imageRendering: 'optimizeQuality', // firefox property
      //-ms-interpolation-mode: 'bicubic',  // IE property
      width: '100%'
    });

    if(!flowGallery.activeElem && flowGallery.options.activeIndex===index) {
      $listItem.addClass('active');
      flowGallery.activeElem = self;
      flowGallery.activeIndex = index;
    }
  };


  // add handler to images to call after finished loading
  var addLoadHandler = function() {
    var raw_img = $img.get(0);
    if(raw_img.complete) {
      loadCompleteHandler.call(raw_img);
    } else {
      $img.bind('load readystatechange', loadCompleteHandler)
      .bind('error', function () {
        $(this).css('visibility', 'visible').parent().removeClass(flowGallery.options.loadingClass);
      });
    }

  };


  // load handler for images
  var loadCompleteHandler = function(e){
    if (this.complete || (this.readyState === 'complete' && e.type ==='readystatechange')) {
      $img.css('visibility', 'visible').parent().removeClass(flowGallery.options.loadingClass);
      $img.fadeIn();

      self.isLoaded = true;
      initImageDimensions();

      $listItem.click( clickHandler );

      if(loadCompleteHandler) {
        loadCompleteCallback(self);
      }
    }
    // TODO: else case ?
  };


  // determine image dimensions
  var initImageDimensions = function() {
    var options = flowGallery.options;
    var img_raw = $img.get(0);

    // update full image dimensions
    if(typeof img_raw.naturalWidth !== 'undefined') {
      self.w  = options.forceWidth || img_raw.naturalWidth || img_raw.width;
      self.h = options.forceHeight || img_raw.naturalHeight || img_raw.height;
    } else {
      var tmpImg = new Image();
      tmpImg.src = $img.attr('src');
      self.w = tmpImg.width;
      self.h = tmpImg.height;
    }

    // update thumbnail dimensions
    if(options.thumbWidth === 'auto' && options.thumbHeight == 'auto') {
      self.tw = options.loadingWidth;
      self.th = Math.round(self.h * options.loadingWidth / self.w);
    } else if (options.thumbHeight === 'auto') {
      self.tw = flowGallery.options.thumbWidth;
      self.th = Math.round(self.h * Number(options.thumbWidth) / self.w);
    } else if (options.thumbWidth === 'auto') {
      self.tw = Math.round(self.w * Number(options.thumbHeight) / self.h);
      self.th = options.thumbHeight;
    } else {

      self.tw = options.thumbWidth;
      self.th = options.thumbHeight;
      console.log("h/w::: ", self.th, self.tw);
    }
  };


  var clickHandler = function() {
    if(self !== flowGallery.activeElem) {
      var oldIndex = flowGallery.activeIndex;
      flowGallery.flowInDir(index-oldIndex);
    } else if(flowGallery.options.forwardOnActiveClick===true) {
      flowGallery.flowInDir(1);
    }
  };


  // check if image size can be determined yet
  // TODO: deprecated --> remove!
  var isSizeReady = function() {
    if(self.isLoaded) { return true; }

    var img = $img.get(0);
    if((flowGallery.options.forceWidth && flowGallery.options.forceHeight) ||
       (img.width > flowGallery.options.thumbWidth && img.height > 20)) {
      return true;
    }

    if(!img.complete) { return false; }
    if(typeof img.naturalWidth !== "undefined" && img.naturalWidth===0) {
      return false;
    }

    return true;
  };

  init();
};



/** Basic jQuery plugin setup */
$.fn.flowgallery = function(options) {

  return this.each(function() {
    var element = $(this);

    // Return early if this element already has a plugin instance
    if (element.data('flowgallery')) { return; }

    // pass options to plugin constructor
    var flowgallery = new FlowGallery(this, options);

    // Store plugin object in this element's data
    element.data('flowgallery', flowgallery);
  });

};

// default options
$.fn.flowgallery.defaults = {
  activeIndex: 0,          // index of image that is initially active
  animate: true,
  circular: false,
  enableKeyNavigation: true,   // enables forward/backward arrow keys for next/previous navigation
  forwardOnActiveClick: false, // should clicking on active image, show next image?
  forceWidth: false,
  forceHeight: false,
  backgroundColor: 'black',
  loadingWidth: 100,       // loading width to use if cannot be determined
  loadingHeight: 60,       // loading height to use if cannot be determined
  thumbWidth: 'auto',
  thumbHeight: 'auto',
  thumbTopOffset: 'auto',  // top offset in pixels or 'auto' for centering images within list height
  imagePadding: 0,         // border of active image
  thumbPadding: 0,         // border of thumbnails
  loadingClass: "loading", // css class applied to <li> elements of loading images
  easing: 'linear',
  duration: 900            // animation duration (higher value = slower speed)
};


})(jQuery);
