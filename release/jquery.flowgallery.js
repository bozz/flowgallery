/*!
 * jQuery flowgallery plugin: Cover Flow Image Gallery
 * Examples and documentation at: http://github.com/bozz/flowgallery
 * Version: 0.7.0pre (21-FEB-2012)
 * Author: Boris Searles (boris@lucidgardens.com)
 * Requires jQuery v1.3.2 or later
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */
;(function( $, window, document, undefined ){


/**
 * helper function to get current plugin version
 * @return {string}
 */
var getVersion = function () {
  return '1.0.0pre';
};


/**
 * Method takes an object (config.src) and copies references
 * of all specified attributes and functions, these are then
 * returned in a new object. This new object can then be used
 * to extend another object.
 * @param {Object} config.src
 * @param {array}  config.getters
 * @param {array}  config.setters
 * @param {array}  config.methods
 * @return {array}
 */
var ApiGenerator = (function() {

  var src, i, length;

  /**
   * helper function to capitalize first letter of string
   * @return {string}
   */
  function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // create closure for correct scope
  function createGetter(g, scope) {
    if(src[g]) {
      scope['get' + capitalize(g)] = function () {
        return src[g];
      };
    }
  }


  // create closure for correct scope
  function createSetter(s, scope) {
    if(src[s]) {
      scope['set' + capitalize(s)] = function (val) {
        src[s] = val;
      };
    }
  }


  function initApi(scope, config) {
    // special accessor to get full source object
    scope._getSource = function () {
      return src;
    };
    if (config.getters) {
      length = config.getters.length;
      for (i = 0; i < length; i++) {
        createGetter(config.getters[i], scope);
      }
    }
    if (config.setters) {
      length = config.setters.length;
      for (i = 0; i < length; i++) {
        createSetter(config.setters[i], scope);
      }
    }
    if (config.methods) {
      length = config.methods.length;
      for (i = 0; i < length; i++) {
        method = config.methods[i];
        if(src[method]) {
          scope[method] = $.proxy(src[method], src);
        }
      }
    }
    if (config.version) {
      scope._version = config.version;
    }
  }

  return {
    init: function(SrcConstructor, config) {
      return function api() {
        if(typeof SrcConstructor === 'function') {
          // workaround to pass 'arguments' to Constructor
          // see: http://stackoverflow.com/a/3362623
          var args = Array.prototype.slice.call(arguments);
          var inst, ret;
          var Temp = function(){};
          Temp.prototype = SrcConstructor.prototype;
          inst = new Temp();
          ret = SrcConstructor.apply(inst, args);
          src = typeof ret === 'object' ? ret : inst;

          initApi(this, config);
          return this;
        }
      };
    }
  };

})();




var FlowGallery = function(elem, options) {

  this.list = elem;                 // reference to list as jquery object
  this.$list = $(elem);

  this.options = options;

  // This next line takes advantage of HTML5 data attributes
  // to support customization of the plugin on a per-element
  // basis. For example,
  // <div class=item' data-plugin-options='{"message":"Goodbye World!"}'></div>
  this.metadata = this.$list.data( 'plugin-options' );

  // private variables
  this.listWidth= 0;          // list width (default: screen width)
  this.listHeight= 0;         // list height (height of highest image)
  this.elCounter= 0;          // number of list items
  this.flowItems= [];         // array of FlowItems
  this.activeLoaded= false;   // has active image been loaded?
  this.centerX= 0;            // horizontal center within list
  this.centerY= 0;            // vertical center within list
  this.$container= false;     // parent element of list
  this.$caption= false;       // caption element

  // public variables
  this.config= {};            // merged options
  this.length= 0;             // number of images in gallery
  this.activeIndex= 0;        // activeIndex
  this.activeItem= false;     // reference to active FlowItem
  this.enabled= true;         // is gallery currently enabled

  this.init();
};


// default option values
FlowGallery.defaults = {
  activeIndex: 0,          // index of image that is initially active
  animate: true,
  backgroundColor: 'black',
  circular: false,
  duration: 900,            // animation duration (higher value = slower speed)
  easing: 'linear',
  enableKeyNavigation: true,   // enables forward/backward arrow keys for next/previous navigation
  forceHeight: false,
  forceWidth: false,
  forwardOnActiveClick: false, // should clicking on active image, show next image?
  imagePadding: 0,         // border of active image
  loadingClass: "loading", // css class applied to <li> elements of loading images
  loadingHeight: 60,       // loading height to use if cannot be determined
  loadingWidth: 100,       // loading width to use if cannot be determined
  thumbHeight: 'auto',
  thumbPadding: 0,         // border of thumbnails
  thumbTopOffset: 'auto',  // top offset in pixels or 'auto' for centering images within list height
  thumbWidth: 'auto'
};


FlowGallery.prototype = {

  constructor: FlowGallery,

  //// private variables
  //listWidth: 0,          // list width (default: screen width)
  //listHeight: 0,         // list height (height of highest image)
  //elCounter: 0,          // number of list items
  //flowItems: [],         // array of FlowItems
  //activeLoaded: false,   // has active image been loaded?
  //centerX: 0,            // horizontal center within list
  //centerY: 0,            // vertical center within list
  //$container: false,     // parent element of list
  //$caption: false,       // caption element

  //// public variables
  //config: {},            // merged options
  //length: 0,             // number of images in gallery
  //activeIndex: 0,        // activeIndex
  //activeItem: false,     // reference to active FlowItem

  // initialize gallery
  init: function() {
    this.config = $.extend({}, FlowGallery.defaults, this.options, this.metadata);
    this.$container = this.$list.parent();
    this.length = this.$list.children().length;

    this.initDom();
    this.initFlowItems();

    this.$list.css('visibility', 'visible');

    $(window).resize( $.proxy(this.windowResizeHandler, this) );

    if(this.config.enableKeyNavigation===true) {
      var proxyKeyHandler = $.proxy(this.handleKeyEvents, this);
      $(document).keydown(proxyKeyHandler);
    }

    this.updateFlow(false);
  },

  next: function() {
    this.flowInDir(1);
    return this;
  },

  prev: function() {
    this.flowInDir(-1);
    return this;
  },

  goto: function(index) {
    this.flowInDir(index - this.activeIndex);
    return this;
  },

  disable: function() {
    this.enabled = false;
    return this;
  },

  enable: function() {
    this.enabled = true;
    return this;
  },

  // initialize dom setup and styling
  initDom: function() {
    // set required styling on list element
    this.$list.css({
      listStyle: 'none',
      overflow: 'hidden',
      marginLeft: '0',
      paddingLeft: '0',
      position: 'relative',
      width: '100%'
    });

    this.initCaption();
    this.initWrapper();
  },


  // initialize caption - a single instance is shared by all images
  initCaption: function() {
    var captionElem = document.createElement('p');
    this.$caption = $(captionElem).addClass('fg-caption').css({
      backgroundColor: this.config.backgroundColor,
      display: 'none',
      marginTop: '0',
      padding: '8px ' + (this.config.imagePadding+10) + 'px 15px',
      position: 'absolute'
    });
  },


  // initialize wrapper around gallery - used for positioning caption
  initWrapper: function() {
    var wrapperElem = document.createElement('div');
    $(wrapperElem)
    .addClass('fg-wrapper').css({
      position: 'relative'
    })
    .append( this.$list.get(0) )
    .append( this.$caption.get(0) );
    this.$container.append(wrapperElem);
  },


  initFlowItems: function() {
    // loop through list items to extract image data and determine list height
    var self = this;
    this.$list.children().each(function(index) {
      var flowItem = new FlowItem(this, index, self, $.proxy(self.itemLoadedHandler, self));
      self.flowItems.push(flowItem);
      flowItem.init();
    });

    this.listWidth = this.$container.width();
    this.centerX = this.listWidth*0.5;

    var activeImageHeight = false;
    if(this.activeItem.isLoaded) {
      activeImageHeight = this.activeItem.h;
    }

    if(activeImageHeight) {
      centerY = this.config.thumbTopOffset==='auto' ? activeImageHeight*0.5 : this.config.thumbTopOffset;
    } else {
      centerY = this.config.thumbTopOffset==='auto' ? this.listHeight*0.5 : this.config.thumbTopOffset + this.config.thumbHeight*0.5;
    }
  },


  itemLoadedHandler: function(item) {
    if(item.index===this.config.activeIndex) {
      this.activeLoaded = true;
      this.centerY = this.config.thumbTopOffset==='auto' ? item.h*0.5 : this.config.thumbTopOffset;
    } else {
      var animateParams = { height: item.th, width: item.tw };
      if(this.activeLoaded) {
        animateParams.top = (this.centerY - item.th*0.5) + 'px';
      }
      item.getListItem().animate(animateParams);
    }

    this.updateListHeight(item.h);

    // redraw in order to update thumbnail positions
    this.updateFlow();
  },


  // only applied after animation of 'active' element
  afterFlowHandler: function(){
    this.showCaption();

    // adjust if width changed (i.e. if scrollbars get displayed)
    if(this.$container.width() !== this.listWidth) {
      this.listWidth = this.$container.width();
      this.centerX = this.listWidth*0.5;
      this.updateFlow();
      this.showCaption();
    }
  },


  // special afterFlow handler for previously active item
  getOldActiveAfterFlowHandler: function(itemIndex) {
    var self = this;
    return function() {
      var item = self.flowItems[itemIndex];
      item.oldActive = false;
    };
  },


  updateFlow: function(animate) {
    if(!this.enabled) { return false; }

    var config = {};
    var isBefore = true;   // in loop, are we before 'active' item
    var completeFn = null; // callback method to call after animation (for 'active' item)
    var currentItem = false;
    var $listItem = false;
    var itemsLength = this.flowItems.length;

    var i;
    for(i=0; i<itemsLength; i++) {
      currentItem = this.flowItems[i];
      this.$listItem = currentItem.getListItem();

      if( this.$listItem.hasClass('active') ) {
        config = {
          left: (this.centerX - this.config.imagePadding - currentItem.w * 0.5) + 'px',
          top: '0',
          width: currentItem.w+'px',
          height: currentItem.h+'px',
          padding: this.config.imagePadding+'px'
        };
        isBefore = false;
        completeFn = $.proxy(this.afterFlowHandler, this);
      } else {
        config = {
          left: this.calculateLeftPosition(i, isBefore),
          top: (this.centerY - currentItem.th*0.5) + 'px'
        };

        completeFn = null;

        // only animate width/height for old active item
        if(currentItem.oldActive) {
          config.width = currentItem.tw+'px';
          config.height = currentItem.th+'px';
          config.padding = this.config.thumbPadding+'px';
          completeFn = this.getOldActiveAfterFlowHandler(i);
        }
      }

      if(animate) {
        this.$listItem.stop().animate(config, { duration: this.config.duration, easing: this.config.easing, complete: completeFn });
      } else {
        this.$listItem.css(config);
        if(completeFn) { completeFn(); }
      }
    }
  },


  // trigger flow in direction from current active element;
  // positive value flows to the right, negative values to the left;
  flowInDir: function(dir) {
    if(!this.enabled) { return false; }

    var newIndex = this.activeIndex + dir;
    if(newIndex > this.flowItems.length-1 || newIndex < 0) {
      return false;
    }

    this.activeItem.oldActive = true; // mark old active item
    if(dir<0 && this.activeIndex > 0) {
      this.flowItems[this.activeIndex].oldActive = true;
      this.activeIndex += dir;
    } else if(dir>0 && this.activeIndex < this.flowItems.length-1) {
      this.activeIndex += dir;
    } else {
      return false;
    }
    this.activeItem = this.flowItems[this.activeIndex];
    this.prepareFlow();
    this.updateFlow(this.config.animate);
  },


  prepareFlow: function() {
    //if (_options.circular) {
    //  _circularFlow(currentIndex);
    //}

    this.$caption.hide();
    this.$list.find('.active').removeClass('active');
    $(this.activeItem.getListItem()).addClass('active');

    // update width (changes if scrollbars disappear)
    this.listWidth = this.$container.width();
    this.centerX = this.listWidth*0.5;
  },


  calculateLeftPosition: function(current, isBefore) {
    var left = this.centerX;
    var i = 0;

    if (isBefore) {
      left -= this.flowItems[this.activeIndex].w*0.5;
      left -= this.config.imagePadding;
      left -= (this.activeIndex - current) * 10;
      left -= (this.activeIndex - current) * 2 * this.config.thumbPadding;
      for (i = current; i < this.activeIndex; i++) {
        left -= this.flowItems[i].tw;
      }
    } else {
      left += this.flowItems[this.activeIndex].w*0.5;
      left += this.config.imagePadding;
      left += (current - this.activeIndex) * 10;
      left += (current - this.activeIndex) * 2 * this.config.thumbPadding;
      for (i = this.activeIndex + 1; i < current; i++) {
        left += this.flowItems[i].tw;
      }
    }
    return left + 'px';
  },


  // window resize handler - update gallery when window is resized
  windowResizeHandler: function() {
    this.listWidth = this.$container.width();
    this.centerX = this.listWidth*0.5;
    this.updateFlow();
    this.showCaption();
  },


  // show caption under active image
  showCaption: function() {
    if(!this.activeItem.isLoaded) { return false; }

    var captionText = this.activeItem.captionText;
    if(captionText && captionText.length > 0){
      this.$caption.text(captionText);

      this.$caption.css({
        left: this.centerX - this.config.imagePadding - this.activeItem.w * 0.5,
        top: this.activeItem.h + this.config.imagePadding*2,
        width: this.activeItem.w - 20
      });

      // set height of caption as bottom margin for list
      var fullHeight = this.activeItem.h + this.$caption.height() + 40;
      this.$list.height(fullHeight);

      this.$caption.fadeIn('fast');
    }
  },


  // set list height to height of tallest image (needed for overflow:hidden)
  updateListHeight: function(height) {
    if(height > this.listHeight) {
      this.listHeight = height;
      this.listHeight += this.config.imagePadding*2;
      this.$list.height(this.listHeight);
    }
  },


  // handle key events
  handleKeyEvents: function(e) {
    if(!this.enabled) { return false; }

    if(e.keyCode===37) { // right arrow key
      this.flowInDir(-1);
    } else if(e.keyCode===39) { // left arrow key
      this.flowInDir(1);
    }
  }
};


var FlowGalleryApi = ApiGenerator.init(FlowGallery, {
  getters: ['options', 'length'],
  methods: ['next', 'prev', 'goto', 'enable', 'disable'],
  version: getVersion()
});




var FlowItem = function(elem, index, flowGallery, loadCompleteCallback) {

  this.listItem = elem;
  this.$listItem = $(elem);

  this.index = index;
  this.flowGallery = flowGallery;
  this.config = flowGallery.config;
  this.loadCompleteCallback = loadCompleteCallback;

  this.h = 0;               // image height
  this.th= 0;              // thumb height
  this.w= 0;               // image width
  this.tw= 0;              // thumb width
  this.active= false;      // is active image?
  this.isLoaded= false;    // is image fully loaded?
  this.captionText= false; // text specified within 'title' attribute of img
  this.oldActive= false;   // is this image being animated away from active position?
  this.$img= false;
};


FlowItem.prototype = {
  //h: 0,               // image height
  //th: 0,              // thumb height
  //w: 0,               // image width
  //tw: 0,              // thumb width
  //active: false,      // is active image?
  //isLoaded: false,    // is image fully loaded?
  //captionText: false, // text specified within 'title' attribute of img
  //oldActive: false,   // is this image being animated away from active position?
  //$img: false,


  getListItem: function() {
    return this.$listItem;
  },


  init: function() {
    this.h = this.config.loadingHeight;
    this.th = this.config.loadingHeight;
    this.w = this.config.loadingWidth;
    this.tw = this.config.loadingWidth;
    this.$img = this.$listItem.find('img');

    // TODO: if no image found, remove <li> item from list

    this.captionText = this.$img.attr('title');

    if(this.config.forceWidth) {
      this.$img.width(this.config.forceWidth);
    }

    // remove image and add 'loading' class
    this.$img.hide().parent().addClass(this.config.loadingClass).css({
      height: this.th,
      width: this.tw
    });

    this.addLoadHandler();

    this.$listItem.css({
      backgroundColor: this.config.backgroundColor,
      padding: this.config.thumbPadding,
      position: 'absolute',
      textAlign: 'center'
    });

    this.$img.css({
      cursor: 'pointer',
      height: '100%',
      imageRendering: 'optimizeQuality', // firefox property
      //-ms-interpolation-mode: 'bicubic',  // IE property
      width: '100%'
    });

    if(!this.flowGallery.activeItem && this.config.activeIndex===this.index) {
      this.$listItem.addClass('active');
      this.flowGallery.activeItem = this;
      this.flowGallery.activeIndex = this.index;
    }
  },


  // add handler to images to call after finished loading
  addLoadHandler: function() {
    var img = this.$img.get(0);
    if(img.complete) {
      this.initListItem();
    } else {
      var self = this;
      this.$img.bind('load readystatechange', $.proxy(this.imageLoadHandler, this))
      .bind('error', function () {
        self.$img.css('visibility', 'visible').parent().removeClass(self.config.loadingClass);
      });
    }

  },


  // event handler for image loading
  imageLoadHandler: function(e) {
    var img = this.$img.get(0);
    if (img.complete || (img.readyState === 'complete' && e.type === 'readystatechange')) {
      this.initListItem();
    }
  },


  // load handler for images
  initListItem: function(){
    this.$img.css('visibility', 'visible').parent().removeClass(this.config.loadingClass);
    this.$img.fadeIn();

    this.isLoaded = true;
    this.initImageDimensions();

    this.$listItem.click( $.proxy(this.clickHandler, this) );

    if(typeof this.loadCompleteCallback === 'function') {
      this.loadCompleteCallback(this);
    }
  },


  // determine image dimensions
  initImageDimensions: function() {
    var img_raw = this.$img.get(0);

    // update full image dimensions
    if(typeof img_raw.naturalWidth !== 'undefined') {
      this.w  = this.config.forceWidth || img_raw.naturalWidth || img_raw.width;
      this.h = this.config.forceHeight || img_raw.naturalHeight || img_raw.height;
    } else {
      var tmpImg = new Image();
      tmpImg.src = this.$img.attr('src');
      this.w = tmpImg.width;
      this.h = tmpImg.height;
    }

    // update thumbnail dimensions
    if(this.config.thumbWidth === 'auto' && this.config.thumbHeight === 'auto') {
      this.tw = this.config.loadingWidth;
      this.th = Math.round(this.h * this.config.loadingWidth / this.w);
    } else if (this.config.thumbHeight === 'auto') {
      this.tw = this.config.thumbWidth;
      this.th = Math.round(this.h * Number(this.config.thumbWidth) / this.w);
    } else if (this.config.thumbWidth === 'auto') {
      this.tw = Math.round(this.w * Number(this.config.thumbHeight) / this.h);
      this.th = this.config.thumbHeight;
    } else {
      this.tw = this.config.thumbWidth;
      this.th = this.config.thumbHeight;
    }
  },


  // click handler on listItem <li>
  clickHandler: function() {
    if(this.listItem !== this.flowGallery.activeItem) {
      var oldIndex = this.flowGallery.activeIndex;
      this.flowGallery.flowInDir(this.index-oldIndex);
    } else if(this.config.forwardOnActiveClick===true) {
      this.flowGallery.flowInDir(1);
    }
  },


  // check if image size can be determined yet
  // TODO: deprecated --> remove!
  isSizeReady: function() {
    if(this.isLoaded) { return true; }

    var img = $img.get(0);
    if((flowGallery.config.forceWidth && flowGallery.config.forceHeight) ||
       (img.width > flowGallery.config.thumbWidth && img.height > 20)) {
      return true;
    }

    if(!img.complete) { return false; }
    if(typeof img.naturalWidth !== "undefined" && img.naturalWidth===0) {
      return false;
    }

    return true;
  }

};



/** Basic jQuery plugin setup */
$.fn.flowgallery = function(options) {

  return this.each(function() {
    var element = $(this);

    // Return early if this element already has a plugin instance
    if (element.data('flowgallery')) { return; }

    // pass options to plugin constructor
    var flowgallery = new FlowGalleryApi(this, options);

    // Store plugin object in this element's data
    element.data('flowgallery', flowgallery);
  });

};

// default options
$.fn.flowgallery.defaults = FlowGallery.defaults;


})( jQuery, window , document );
