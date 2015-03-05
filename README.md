
# flowgallery.js v0.6.5r: Refactored #

jQuery plugin for image galleries with a cover flow effect, refactored by Robin Tenhagen in order to provide (almost) full method implementation and easier use.

Original page at: http://flowgallery.org

flowgallery.js is a handy library for sliding galleries. It is one of the most useful ones, though it does not seem to be in development anymore. Its website shows an API documentation which applies for the development version 0.7.0 only. This turns out to load quite slowly only and is officially not stable.

Version 0.6.5 is stable, though it does not contain all the API. In addition, it does not provide any class wrapping, so that the gallery could only be used once on a website.

I refactored the stable version 0.6.5 and added almost all of the promised API methods. See the demo/index.html for a full documentation. 

## Usage ##

The required markup for the image gallery is a simple unordered list of images:

	<ul id="gallery">
	  <li><img src="..." title="image caption text" alt="image" /></li>
	  <li><img src="..." title="image caption text" alt="image" /></li>
	  <li><img src="..." title="image caption text" alt="image" /></li>
	  <li><img src="..." title="image caption text" alt="image" /></li>
	  <li><img src="..." title="image caption text" alt="image" /></li>
	  <li><img src="..." title="image caption text" alt="image" /></li>
	</ul>


For basic usage with default settings, select the appropriate list and initialize as follows: 

<pre>
var flowGallery = $('#gallery').flowGallery();
</pre>

If you want to open the next picture, use the following call:

<pre>
flowGallery.next();
</pre>

There are many additional configuration options, see the demo file in demo/index.html for a full documentation of the implemented API.

## Dependencies ##

* jQuery (tested with 1.4+)
* Optional: jQuery Easing (http://gsgd.co.uk/sandbox/jquery/easing/) for additional easing options

## Browser Compatibility ##

Tested under:

* Firefox 3.5+
* Safari 5
* Chrome 4+
* Opera 11
* IE7+

## Licensing ##

Copyright (c) 2012 [Boris Searles](http://lucidgardens.com), released under [MIT](http://www.opensource.org/licenses/mit-license.php) license.
Refactored by Robin Tenhagen (2013)
