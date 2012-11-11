var SpecHelper = {

  // replace images in fixture with fake images, this
  // avoids need to wait for asynchronous loading of images.
  loadFakeImages: function($el, imageWidth, imageHeight) {
    $el.find('img').each(function(index) {
      var $img = $(new Image());
      $img.height(imageHeight).width(imageWidth).attr('title', 'image '+index);
      $(this).replaceWith($img);
    });
  }

}
