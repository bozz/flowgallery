

var FlowItem = function(elem, index, flowGallery, loadCompleteCallback) {

  this.listItem = elem;
  this.$listItem = $(elem);

  this.index = index;
  this.flowGallery = flowGallery;
  this.options = flowGallery.options;
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
    this.h = this.options.loadingHeight;
    this.th = this.options.loadingHeight;
    this.w = this.options.loadingWidth;
    this.tw = this.options.loadingWidth;
    this.$img = this.$listItem.find('img');

    // TODO: if no image found, remove <li> item from list

    this.captionText = this.$img.attr('title');

    if(this.options.forceWidth) {
      this.$img.width(this.options.forceWidth);
    }

    // remove image and add 'loading' class
    this.$img.hide().parent().addClass(this.options.loadingClass).css({
      height: this.th,
      width: this.tw
    });

    this.addLoadHandler();

    this.$listItem.css({
      backgroundColor: this.options.backgroundColor,
      padding: this.options.thumbPadding,
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

    if(!this.flowGallery.activeItem && this.options.activeIndex===this.index) {
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
        self.$img.css('visibility', 'visible').parent().removeClass(self.options.loadingClass);
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
    this.$img.css('visibility', 'visible').parent().removeClass(this.options.loadingClass);
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
      this.w  = this.options.forceWidth || img_raw.naturalWidth || img_raw.width;
      this.h = this.options.forceHeight || img_raw.naturalHeight || img_raw.height;
    } else {
      var tmpImg = new Image();
      tmpImg.src = this.$img.attr('src');
      this.w = tmpImg.width;
      this.h = tmpImg.height;
    }

    // update thumbnail dimensions
    if(this.options.thumbWidth === 'auto' && this.options.thumbHeight === 'auto') {
      this.tw = this.options.loadingWidth;
      this.th = Math.round(this.h * this.options.loadingWidth / this.w);
    } else if (this.options.thumbHeight === 'auto') {
      this.tw = this.options.thumbWidth;
      this.th = Math.round(this.h * Number(this.options.thumbWidth) / this.w);
    } else if (this.options.thumbWidth === 'auto') {
      this.tw = Math.round(this.w * Number(this.options.thumbHeight) / this.h);
      this.th = this.options.thumbHeight;
    } else {
      this.tw = this.options.thumbWidth;
      this.th = this.options.thumbHeight;
    }
  },


  // click handler on listItem <li>
  clickHandler: function() {
    if(this.listItem !== this.flowGallery.activeItem) {
      var oldIndex = this.flowGallery.activeIndex;
      this.flowGallery.flowInDir(this.index-oldIndex);
    } else if(this.options.forwardOnActiveClick===true) {
      this.flowGallery.flowInDir(1);
    }
  },

};
