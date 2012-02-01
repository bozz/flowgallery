$(function() {

  var FlowUtils = {
    /**
     * Very basic tabbing functionality. Expects list with links
     * that contain anchors (i.e. #demo) that correspond to an ID
     * in the form: #demo-tab.
     * @param {string} selector expected <UL> list element
     */
    initTabs: function(selector) {
      var $tabLinks = $(selector + " li a");
      $tabLinks.each(function(i) {
        var tabName = this.href.split('#').pop();
        var $tab = $('#' + tabName + "-tab");
        if(!$(this).hasClass('active')) {
          $tab.hide();
        }
        $(this).click(function() {
          $(selector).find('.active').removeClass('active');
          $(this).addClass('active');
          $tab.show().siblings().hide();
        });
      });
    }
  };

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
