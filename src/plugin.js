
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
