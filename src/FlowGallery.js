

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

    self.updateFlow(false);
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


  // only applied after animation of 'active' element
  afterFlowHandler = function(){
    //_showCaption(_activeElem);

    // adjust if width changed (i.e. if scrollbars get displayed)
    if($container.width() !== listWidth) {
      listWidth = $container.width();
      self.centerX = listWidth*0.5;
      self.updateFlow();
      //self.showCaption(_activeElem);
    }
  },


  this.updateFlow = function(animate) {
    //var leftOffset, topOffset, elWidth, elHeight, padding = 0;

    var
    config = {},
    isBefore = true,   // in loop, are we before 'active' item
    completeFn = null, // callback method to call after animation (for 'active' item)
    currentItem = false,
    $listItem = false,
    itemsLength = flowItems.length;

    for(var i=0; i<itemsLength; i++) {
      currentItem = flowItems[i];
      $listItem = currentItem.getListItem();

      if( $listItem.hasClass('active') ) {
        config = {
          left: (self.centerX - self.options.imagePadding - currentItem.w * 0.5) + 'px',
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
          top: (self.centerY - currentItem.th*0.5) + 'px',
          width: currentItem.tw+'px',
          height: currentItem.th+'px',
          padding: self.options.thumbPadding+'px'
        };
        completeFn = null;
      }

      //console.log("config: ", listHeight, config);

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
    var
    left = self.centerX,
    i = 0;

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
