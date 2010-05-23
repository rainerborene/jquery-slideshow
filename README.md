jQuery Slideshow Plugin
=======================

This is a plugin for jQuery that enables you to create a flickr-like slideshow on your website. Tested under IE6+, Firefox, Safari and Google Chrome.

Installation
------------

Include the appropriate scripts in the **head** of your HTML document.

	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js"></script>
	<script type="text/javascript" src="jquery.slideshow.js"></script>

Usage
-----

It's easy as pie. Just call the `slideshow` function, and be sure you're calling it from a *DOM ready* callback scope.

	$(document).ready(function(){
		$("a.slideshow").slideshow();
	});

**Attention:** The usage of the `rel` attribute on links is **obrigatory** when using different groups of images.

License
-------

Copyright (c) 2010 Rainer Borene, João Otávio and Movida Comunicação

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.