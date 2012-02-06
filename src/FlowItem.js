

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
