$(function() {

  FlowUtils.initTabs('#tab-bar');

  $('#demo-selector').change(function() {
    var link = $(this).find('option:selected').val();

    // reset gallery
    $('#gallery').data('flowgallery', null)
      .find('li').removeClass('active');

    switch(link) {
      case '#demo_default':
        initDemoDefault();
        break;
      case '#demo_equal_size':
        initDemoEqualSize();
        break;
      case '#demo_multiple_galleries':
        initDemoMultipleGalleries();
        break;
      case '#demo_scripting':
        initDemoScripting();
        break;
    }
  });


  var initDemoDefault = function() {
    $('#gallery').flowgallery({
      easing: 'easeOutCubic'
    });
  };

  var initDemoEqualSize = function() {
    $('#gallery').flowgallery({
      easing: 'easeOutCubic',
      imagePadding: 0,
      thumbPadding: 0,
      thumbHeight: 400,
      thumbWidth: 640
    });
  };

  var initDemoMultipleGalleries = function() {
    $('#gallery').flowgallery({
      easing: 'easeOutCubic'
    });
  };

  var initDemoScripting = function() {
    $('#gallery').flowgallery({
      easing: 'easeOutCubic'
    });
    console.log("check: ", $('#gallery').data('flowgallery'));
  };

  // init default
  initDemoDefault();

});
