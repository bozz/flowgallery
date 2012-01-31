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
}
