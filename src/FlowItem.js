

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
