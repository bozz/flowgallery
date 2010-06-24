/*!
 * jQuery bFlow plugin: Simple Cover Flow Plugin
 * Examples and documentation at: http://lucidgardens.com/bflow
 * version 0.1 (22-JUN-2010)
 * Requires jQuery v1.3.2 or later
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 * Authors: Boris Searles
 */

(function($) { 

var _elCounter = 0;
var _activeIndex = 0;

var _containerWidth = 0;
var _init = false;
var _options = {};

var updateFlow = function(container, animate) {
	var isBefore = true;
	var leftOffset, topOffset, elWidth, elHeight, padding = 0;
	container.children().each(function(i){
		if($(this).hasClass('active')) {
			leftOffset = _containerWidth*0.5-_options.activeWidth*0.5;
			topOffset = 0;
			elWidth = _options.activeWidth;
			elHeight = _options.activeHeight;
			padding = _options.imagePadding;
			isBefore = false;
			displayCaption(this);
		} else {
			leftOffset = isBefore ? (_containerWidth*0.5-_options.activeWidth*0.5 + (i-_activeIndex)*_options.thumbWidth + (i-_activeIndex)*10) : (_containerWidth*0.5+_options.activeWidth*0.5 + (i-_activeIndex-1)*_options.thumbWidth + (i+1-_activeIndex)*10);
			topOffset = _options.activeHeight*0.5 - _options.thumbHeight*0.5;
			elWidth = _options.thumbWidth;
			elHeight = _options.thumbHeight;
			padding = 3;
		}
		
		if(animate) {
			$(this).animate({
				left: leftOffset+'px',
				top: topOffset+'px',
				width: elWidth+'px',
				height: elHeight+'px',
				padding: padding+'px'
			},{ duration: "slow", easing: _options.easing });
		} else {
			$(this).css({
				left: leftOffset+'px',
				top: topOffset+'px',
				width: elWidth+'px',
				height: elHeight+'px',
				padding: padding+'px'
			});
		}
		
	});
}


var displayCaption = function(elem) {
	if($(elem).find('p.caption').length>0) {
		$(elem).find('p.caption').show();
	} else {
		var captionText = $(elem).find('img').attr('title');
		var caption = document.createElement('p');
		$(caption).addClass('caption').css({
			background: 'black',
			left: 0,
			padding: '8px ' + (_options.imagePadding+10) + 'px 15px',
			position: 'absolute',
			//textAlign: 'center',
			top: (_options.activeHeight + 6) + 'px',
			width: (_options.activeWidth-20) + 'px',
		}).append(captionText);
		$(elem).append(caption);
	}
}


$.fn.bflow = function(options) {
	
	_options = $.extend($.fn.bflow.defaults, options);

    return this.each(function(index){
	
		var container = $(this).css({'height':'100%', 'width': '100%'}).parent();
		
		if(!_init) {
			_containerWidth = container.width();
			$(window).resize(function(){
				_containerWidth = $(document.body).width(); //container.width();
				updateFlow(container);
			});
			_init = true;
		}
		
		var elem = document.createElement('div');
		$(elem).addClass('bf-'+_elCounter).css({
			background: 'black',
			cursor: 'pointer',
			position: 'absolute',
			textAlign: 'center',
			width: _elCounter==0 ? _options.activeWidth : _options.thumbWidth,
			height: _elCounter==0 ? _options.activeHeight: _options.thumbHeight
		}).append(this);
		
		var leftOffset, topOffset, padding  = 0;
		if(_elCounter==0) {
			$(elem).addClass('active');
			leftOffset = _containerWidth*0.5-_options.activeWidth*0.5;
			padding = _options.imagePadding + 'px';
			displayCaption(elem);
		} else {
			leftOffset = _containerWidth*0.5+_options.activeWidth*0.5 + (_elCounter-1)*_options.thumbWidth + (_elCounter+1)*10;
			topOffset  = _options.activeHeight*0.5 - _options.thumbHeight*0.5;
			padding = 3 + 'px';
		}
		
		$(elem).css({
			left: leftOffset,
			top: topOffset,
			padding: padding
		});
		
		container.append(elem);
		_elCounter++;
		
		$(elem).click(function(){
			_activeIndex = 0;
			var selectedElem = this;
			$(this).parent().children().each(function(i){
				if(selectedElem==this) {
					_activeIndex = i;
				}
			});
			$(this).parent().find('.active').removeClass('active');
			$(this).addClass('active');
			updateFlow($(this).parent(), true);
		});
		
    });

};

// expose options
$.fn.bflow.defaults = {
	activeWidth: 660,
	activeHeight: 400,
	thumbWidth: 100,
	thumbHeight: 60,
	imagePadding: 4,
	easing: 'linear'
};

    
})(jQuery);
