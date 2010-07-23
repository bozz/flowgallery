/*!
 * jQuery bFlow plugin: Simple Cover Flow Plugin
 * Examples and documentation at: http://github.com/bozz/jquery-bflow
 * version 0.2.1 (16-JUL-2010)
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
	
	$(_listElem).children().each(function(i){
		if($(this).hasClass('active')) {
			leftOffset = _centerX - _imgData[i].w * 0.5;
			topOffset = 0;
			elWidth = _imgData[i].w;
			elHeight = _imgData[i].h;
			padding = _options.imagePadding;
			isBefore = false;
			completeFn = function(){
				_showCaption(_activeElem);
			}
		} else {
			leftOffset = isBefore ? (_centerX - _imgData[_activeIndex].w*0.5 + (i-_activeIndex)*_imgData[i].tw + (i-_activeIndex)*10) : (_centerX+ _imgData[_activeIndex].w*0.5 + (i-_activeIndex-1)*_imgData[i].tw + (i+1-_activeIndex)*10);
			topOffset = _options.thumbTopOffset==='auto' ? _centerY - _imgData[i].th*0.5 : _options.thumbTopOffset;
			elWidth = _imgData[i].tw;
			elHeight = _imgData[i].th;
			padding = 3;
			completeFn = null;
		}
		
		// TODO: only animate visible images...
		if(animate) {
			$(this).animate({
				left: leftOffset+'px',
				top: topOffset+'px',
				width: elWidth+'px',
				height: elHeight+'px',
				padding: padding+'px'
			},{ duration: _options.duration, easing: _options.easing, complete: completeFn });
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


var _showCaption = function(elem) {
	var caption = $(elem).parent().parent().find('p.bf-caption');
	var captionText = $(elem).find('img').attr('title');
	caption.text(captionText);
	
	caption.css({
		left: _centerX - _imgData[_activeIndex].w * 0.5,
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
	
	_listWidth = $(document.body).width();
	_centerX = _listWidth*0.5;
	
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
	});
	
	_listHeight += _options.imagePadding*2;
	_centerY = _listHeight * 0.5;
	$(_listElem).height(_listHeight);

	// ...second pass to initialize list items
	listItems.each(function(index) {
		_initListItem(this, index);
	});
	
}


var _initListItem = function(elem, index) {
	
	$(elem).css({
		backgroundColor: _options.backgroundColor,
		position: 'absolute',
		textAlign: 'center',
		width: _elCounter==0 ? _imgData[index].w : _imgData[index].tw,
		height: _elCounter==0 ? _imgData[index].h : _imgData[index].th
	}).find('img').css({
		cursor: 'pointer',
		height: '100%',
		imageRendering: 'optimizeQuality', // firefox property
		//-ms-interpolation-mode: 'bicubic',  // IE property
		width: '100%'
	});
	
	var leftOffset, topOffset, padding  = 0;
	if(!_activeElem) {
		$(elem).addClass('active');
		leftOffset = _centerX - _imgData[index].w*0.5;
		padding = _options.imagePadding + 'px';
		_activeElem = elem;
		_showCaption(elem);
	} else {
		leftOffset = _centerX + _imgData[_activeIndex].w*0.5 + (_elCounter-1)*_imgData[index].tw + (_elCounter+1)*10;
		topOffset  = _options.thumbTopOffset==='auto' ? _centerY - _imgData[index].th*0.5 : _options.thumbTopOffset;
		padding = 3 + 'px';
	}
	
	$(elem).css({
		left: leftOffset,
		top: topOffset,
		padding: padding
	});
	
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
			_updateFlow(true);
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
