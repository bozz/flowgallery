/*!
 * jQuery bLoad plugin: Image Preloader 
 * Examples and documentation at: http://lucidgardens.com/bload
 * version 0.2.0 (23-JUL-2010)
 * Requires jQuery v1.3.2 or later
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 * Authors: Boris Searles
 */

(function($) { 

var _options = {};

$.fn.bload = function(options) {
	
	_options = $.extend($.fn.bload.defaults, options);
	
	return this.each(function(index){
		
		$(this).hide().parent().addClass(_options.loadingClass);
		
		$(this)
			.bind('load readystatechange', function(e){
				if (this.complete || (this.readyState == 'complete' && e.type =='readystatechange')) {
					console.log("show...");
					$(this).css('visibility', 'visible').parent().removeClass(_options.loadingClass);
					$(this).fadeIn();
				}
			})
	        .bind('error', function () {
				$(this).css('visibility', 'visible').parent().removeClass(_options.loadingClass);
			})

		// check: http://groups.google.com/group/jquery-dev/browse_frm/thread/eee6ab7b2da50e1f
	    var src = this.src; 
		this.src = '#';
		this.src = src;
	
	});

};

// expose options
$.fn.bload.defaults = {
	loadingClass: 'loading'
};

    
})(jQuery);
