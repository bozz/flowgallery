
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
