/*!
 * jQuery flowgallery plugin: Cover Flow Image Gallery
 * Examples and documentation at: http://github.com/bozz/flowgallery
 * version refactor branch (07-OCT-2011)
 * Author: Boris Searles (boris@lucidgardens.com)
 * Requires jQuery v1.3.2 or later
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */

(function($) {

  var FlowGallery = function(element, options) {

    // private variables
    var
      $list = $(element),      // reference to list as jquery object
      $container = $list.parent(), // parent element of list
      listWidth = 0,          // list width (default: screen width)
      listHeight = 0,         // list height (height of highest image)
      $caption = false,       // caption element
      elCounter = 0,          // number of list items
      flowItems = [],         // array of FlowItems
      self = this;

    // public variable
    this.options = $.extend($.fn.flowgallery.defaults, options);
    this.activeIndex = 0;      // activeIndex
    this.activeElem = false;   // reference to active <li> dom element
    this.activeLoaded = false; // has active image been loaded?
    this.centerX = 0;          // horizontal center within list
    this.centerY = 0;          // vertical center within list

    console.log("creating FlowGallery: ", this.options.name);

    // initialize gallery
    var init = function() {
      initDom();
      initFlowItems();

      $(window).resize(windowResizeHandler);

      if(self.options.enableKeyNavigation===true) {
        //$(document).unbind('keydown', _handleKeyEvents).keydown(_handleKeyEvents);
      }

      self.updateFlow();
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
        flowItems.push( new FlowItem(this, index, self) );
      });

      listWidth = $container.width();
      self.centerX = listWidth*0.5;

      var activeImageHeight = false;
      if(self.activeElem.isLoaded) {
        activeImageHeight = self.activeElem.h;
      }

      if(activeImageHeight) {
        self.centerY = self.options.thumbTopOffset==='auto' ? activeImageHeight*0.5 : self.options.thumbTopOffset;
      } else {
        self.centerY = self.options.thumbTopOffset==='auto' ? listHeight*0.5 : self.options.thumbTopOffset + self.options.thumbHeight*0.5;
      }
    };


    this.updateFlow = function(animate) {
      var isBefore = true;
      //var leftOffset, topOffset, elWidth, elHeight, padding = 0;
      var completeFn = null;

      var afterFlowFn = function(){
        //_showCaption(_activeElem);

        // adjust if width changed (i.e. if scrollbars get displayed)
        if($container.width() !== listWidth) {
          listWidth = $container.width();
          self.centerX = listWidth*0.5;
          self.updateFlow();
          //self.showCaption(_activeElem);
        }
      };

      var config = {};
      var $listItem = false;

      for(var i=0; i<flowItems.length; i++) {
        $listItem = flowItems[i].getListItem();

        if( $listItem.hasClass('active') ) {
          config = {
            left: (self.centerX - self.options.imagePadding - flowItems[i].w * 0.5) + 'px',
            top: '0',
            width: flowItems[i].w+'px',
            height: flowItems[i].h+'px',
            padding: self.options.imagePadding+'px'
          };
          isBefore = false;
          completeFn = afterFlowFn;
        } else {
          config = {
            left: calculateLeftPosition(i, isBefore),
            top: (self.centerY - flowItems[i].th*0.5) + 'px',
            width: flowItems[i].tw+'px',
            height: flowItems[i].th+'px',
            padding: self.options.thumbPadding+'px'
          };
          completeFn = null;
        }

        console.log("config: ", listHeight, config);

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
      _currentIndex = self.activeIndex;
      if(dir<0 && self.activeIndex > 0) {
        self.activeIndex += dir;
      } else if(dir>0 && self.activeIndex < flowItems.length-1) {
        self.activeIndex += dir;
      } else {
        return false;
      }
      self.activeElem = flowItems[self.activeIndex]; //$list.children().get(self.activeIndex);

      prepareFlow(_currentIndex);
      self.updateFlow(self.options.animate);
    };


    var prepareFlow = function(currentIndex) {
      //if (_options.circular) {
      //  _circularFlow(currentIndex);
      //}

      $caption.hide();
      $list.find('.active').removeClass('active');
      $(self.activeElem.getListItem()).addClass('active');

      // update width (changes if scrollbars disappear)
      listWidth = $container.width();
      self.centerX = listWidth*0.5;
    };


    var calculateLeftPosition = function(current, isBefore) {
      var left = self.centerX;
      if (isBefore) {
        left -= flowItems[self.activeIndex].w*0.5;
        left -= self.options.imagePadding;
        left -= (self.activeIndex - current) * 10;
        left -= (self.activeIndex - current) * 2 * self.options.thumbPadding;
        for (i = current; i < self.activeIndex; i++) {
          left -= flowItems[i].tw;
        }
        return left + 'px';
      } else {
        left += flowItems[self.activeIndex].w*0.5;
        left += self.options.imagePadding;
        left += (current - self.activeIndex) * 10;
        left += (current - self.activeIndex) * 2 * self.options.thumbPadding;
        for (i = self.activeIndex + 1; i < current; i++) {
          left += flowItems[i].tw;
        }
        return left + 'px';
      }
    };


    // window resize handler - update gallery when window is resized
    var windowResizeHandler = function() {
      listWidth = $container.width();
      centerX = listWidth*0.5;
      self.updateFlow();
      //showCaption(activeElem);
    };


    // set list height to height of tallest image (needed for overflow:hidden)
    this.updateListHeight = function(height) {
      if(height > listHeight) {
        listHeight = height;
        listHeight += self.options.imagePadding*2;
        $list.height(listHeight);
      }
    };


    init();
  };


  /**********************************************************************************/

  var FlowItem = function(listItem, index, flowGallery) {
    this.h = 0;   // full size image height
    this.w = 0;   // full size image width
    this.th = 0;  // thumb height
    this.tw = 0;  // thumb width
    this.active = false; // is active image?
    this.isLoaded = false; // is image fully loaded?


    var self = this,
      $listItem = $(listItem),
      $img = false;


    this.getListItem = function() {
      return $listItem;
    };


    var init = function() {
      $img = $listItem.find('img');

      // TODO: if no image found, remove <li> item from list

      if(flowGallery.options.forceWidth) {
        $img.width(flowGallery.options.forceWidth);
      }

      initImageDimensions();

      $img.hide().parent().addClass(flowGallery.options.loadingClass).css({
        height: self.th,
        width: self.tw
      });

      addLoadHandler();

      $listItem.css({
        backgroundColor: flowGallery.options.backgroundColor,
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


    // determine image dimensions
    var initImageDimensions = function() {
      var isSizeReady2 = isSizeReady();
      var options = flowGallery.options;

      if(isSizeReady2) {
        var img_raw = $img.get(0);
        if(typeof img_raw.naturalWidth !== 'undefined') {
          self.w  = options.forceWidth || img_raw.naturalWidth || img_raw.width;
          self.h = options.forceHeight || img_raw.naturalHeight || img_raw.height;
        } else {
          var tmpImg = new Image();
          tmpImg.src = $img.attr('src');
          self.w = tmpImg.width;
          self.h = tmpImg.height;
        }
      } else {
        self.w = $img.attr('width');
        self.h = $img.attr('height');
      }

      if(options.thumbWidth === 'auto' && options.thumbHeight == 'auto') {
        self.tw = 100;
        self.th = Math.round(self.h * 100 / self.w);
      } else if (options.thumbHeight === 'auto') {
        self.tw = flowGallery.options.thumbWidth;
        self.th = Math.round(self.h * Number(options.thumbWidth) / self.w);
      } else if (options.thumbWidth === 'auto') {
        self.tw = Math.round(self.w * Number(options.thumbHeight) / self.h);
        self.th = options.thumbHeight;
      } else {
        self.tw = options.thumbWidth;
        self.th = options.thumbHeight;
      }

      flowGallery.updateListHeight(self.h);
    };


    // handle loading of incomplete images
    var addLoadHandler = function() {
      var raw_img = $img.get(0);
      if(raw_img.complete) {
        loadCompleteHandler.call(raw_img);
      } else {
        img.bind('load readystatechange', loadCompleteHandler)
        .bind('error', function () {
          $(this).css('visibility', 'visible').parent().removeClass(flowGallery.options.loadingClass);
        });
      }

    };


    var loadCompleteHandler = function(e){
      if (this.complete || (this.readyState === 'complete' && e.type ==='readystatechange')) {
        $img.css('visibility', 'visible').parent().removeClass(flowGallery.options.loadingClass);
        $img.fadeIn();

        self.isLoaded = true;
        initImageDimensions();

        if(index===flowGallery.options.activeIndex) {
          flowGallery.activeLoaded = true;
          flowGallery.centerY = flowGallery.options.thumbTopOffset==='auto' ? self.h*0.5 : flowGallery.options.thumbTopOffset;
          if(e) { flowGallery.updateFlow(); }
        } else {
          var animateParams = { height: self.th };
          if(flowGallery.activeLoaded) {
            animateParams.top = (flowGallery.centerY - self.th*0.5) + 'px';
          }
          $listItem.animate(animateParams);
        }

        console.log("isLoaded... ", self.h, self.w);

        $listItem.click( clickHandler );
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

  /**********************************************************************************/

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
    thumbWidth: 'auto',
    thumbHeight: 'auto',
    thumbTopOffset: 'auto',  // top offset in pixels or 'auto' for centering images within list height
    imagePadding: 4,         // border of active image
    thumbPadding: 3,         // border of thumbnails
    loadingClass: "loading", // css class applied to <li> elements of loading images
    easing: 'linear',
    duration: 900            // animation duration (higher value = slower speed)
  };

})(jQuery);
