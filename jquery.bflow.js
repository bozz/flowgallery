/*!
 * jQuery bFlow plugin: Simple Cover Flow Plugin
 * Examples and documentation at: http://github.com/bozz/jquery-bflow
 * version 0.3.0 (23-JUL-2010)
 * Author: Boris Searles (boris@lucidgardens.com)
 * Requires jQuery v1.3.2 or later
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */

(function($) { 

var _elCounter 		= 0;
var _activeIndex 	= 0;		// index of active element
var _activeElem		= false;	// reference to active <li> dom element
var _listElem 		= false;	// reference to <ul> list dom element

var _listWidth 		= 0;		// list width (default: screen width)
var _listHeight 	= 0;		// list height (height of highest image)
var _centerX 		= 0; 		// horizontal center within list
var _centerY 		= 0; 		// vertical center within list


// stores initial image data (height, width, thumbHeight, thumbWidth)
// format: [{ 
//     h: 400, 		// full size image height
//     w: 200,		// full size image width
//     th: 100,		// thumb height
//     tw: 50		// thumb width
// }]
var _imgData = []; 

var _options = {};

var _updateFlow = function(animate) {
	var isBefore = true;
	var leftOffset, topOffset, elWidth, elHeight, padding = 0;
	var completeFn = null;
	
	var afterFlowFn = function(){
		_showCaption(_activeElem);

		// adjust if width changed (i.e. if scrollbars get displayed)
		if($(document.body).width() != _listWidth) {
			_listWidth = $(document.body).width();
			_centerX = _listWidth*0.5;
			_updateFlow();
			_showCaption(_activeElem);
		}
	}
	
	var config = {};
	$(_listElem).children().each(function(i){
		if($(this).hasClass('active')) {
			config = {
				left: (_centerX - _options.imagePadding - _imgData[i].w * 0.5) + 'px',
				top: '0',
				width: _imgData[i].w+'px',
				height: _imgData[i].h+'px',
				padding: _options.imagePadding+'px'
			}
			isBefore = false;
			completeFn = afterFlowFn;
		} else {
			config = {
				left: (isBefore ? (_centerX - _options.imagePadding - _imgData[_activeIndex].w*0.5 +  (i-_activeIndex)*_imgData[i].tw + (i-1-_activeIndex)*10) : (_centerX + _options.imagePadding + _imgData[_activeIndex].w*0.5 + (i-_activeIndex-1)*_imgData[i].tw + (i-_activeIndex)*10)) + 'px',
				top: (_options.thumbTopOffset==='auto' ? _centerY - _imgData[i].th*0.5 : _options.thumbTopOffset) + 'px',
				width: _imgData[i].tw+'px',
				height: _imgData[i].th+'px',
				padding: '3px'
			}
			completeFn = null;
		}
		
		// TODO: only animate visible images...
		if(animate) {
			$(this).animate(config, { duration: _options.duration, easing: _options.easing, complete: completeFn });
		} else {
			$(this).css(config);
			afterFlowFn();
		}
		
	});
}


var _showCaption = function(elem) {
	var caption = $(elem).parent().parent().find('p.bf-caption');
	var captionText = $(elem).find('img').attr('title');
	caption.text(captionText);
	
	caption.css({
		left: _centerX - _options.imagePadding - _imgData[_activeIndex].w * 0.5,
		top: _imgData[_activeIndex].h + _options.imagePadding*2,
		width: _imgData[_activeIndex].w - 20
	})
	caption.fadeIn('fast');
}


// initialize:
var _initList = function(elem) {

	_listElem = elem; 
	
	var container = $(_listElem).css({
		listStyle: 'none',
		overflow: 'hidden',
		paddingLeft: '0',
		position: 'relative',
		width: '100%'
	}).parent();
	
	var wrapperElem = document.createElement('div');
	var captionElem = document.createElement('p');
	$(captionElem).addClass('bf-caption').css({
		backgroundColor: _options.backgroundColor,
		display: 'none',
		marginTop: '0',
		padding: '8px ' + (_options.imagePadding+10) + 'px 15px',
		position: 'absolute'
	});
	
	$(wrapperElem).addClass('bf-wrapper').css({
		position: 'relative'
	}).append(_listElem).append(captionElem);
	container.append(wrapperElem);
	
	$(window).resize(function(){
		_listWidth = $(document.body).width();
		_centerX = _listWidth*0.5;
		_updateFlow();
		_showCaption(_activeElem);
	});
	
	
	var listItems = $(_listElem).children();

	// loop through list items to extract image data and determine list height
	listItems.each(function(index) {
		var img = $(this).find('img');
		if(_options.forceWidth) {
			img.width(_options.forceWidth);
		}
		
		var imageHeight = _options.forceHeight || img.height();
		var thumbHeight = _options.thumbHeight === 'auto' ? Math.round(imageHeight*Number(_options.thumbWidth) / img.width()) : _options.thumbHeight;
		
		_imgData.push({ 
			h: imageHeight,	
			w: img.width(),
			th: thumbHeight,
			tw: _options.thumbWidth
		})
		
		// set list height to height of tallest image (needed for overflow:hidden)
		_listHeight = imageHeight > _listHeight ? imageHeight : _listHeight;
		
		_initListItem(this, index);
	});
	
	_listHeight += _options.imagePadding*2;
	_centerY = _listHeight * 0.5;
	$(_listElem).height(_listHeight);
	
	_listWidth = $(document.body).width();
	_centerX = _listWidth*0.5;
	
	_updateFlow();
}


var _initListItem = function(elem, index) {
	
	$(elem).css({
		backgroundColor: _options.backgroundColor,
		position: 'absolute',
		textAlign: 'center'
	}).find('img').css({
		cursor: 'pointer',
		height: '100%',
		imageRendering: 'optimizeQuality', // firefox property
		//-ms-interpolation-mode: 'bicubic',  // IE property
		width: '100%'
	});
	
	if(!_activeElem) {
		$(elem).addClass('active');
		_activeElem = elem;
	} 
	
	_elCounter++;
	
	$(elem).click(function(){
		if(this != _activeElem) {
			$("p.bf-caption").hide();
			_activeIndex = 0;
			_activeElem = this;
			$(this).parent().children().each(function(i){
				if(_activeElem==this) {
					_activeIndex = i;
				}
			});
			$(_listElem).children().stop();
			$(_listElem).find('.active').removeClass('active');
			$(this).addClass('active');

			// update width (changes if scrollbars disappear)
			_listWidth = $(document.body).width();
			_centerX = _listWidth*0.5;
			
			_updateFlow(_options.animate);
		}
	
	});
	
}


$.fn.bflow = function(options) {
	
	_options = $.extend($.fn.bflow.defaults, options);

    return this.each(function(index){
		
		if($.browser.safari) {
			$(this).css('visibility', 'hidden');
			var listElem = this;
			$(window).load(function(){
				_initList(listElem);
				$(listElem).css('visibility', 'visible');
			});
		} else {
			_initList(this);
		}
    });

};

// expose options
$.fn.bflow.defaults = {
	animate: true,
	forceWidth: false,
	forceHeight: false,
	backgroundColor: 'black',
	thumbWidth: 100, 			// required, currently cannot be 'auto'
	thumbHeight: 'auto',
	thumbTopOffset: 'auto',		// top offset in pixels or 'auto' for centering images within list height
	imagePadding: 4,
	easing: 'linear',
	duration: 'slow'
};

    
})(jQuery);
