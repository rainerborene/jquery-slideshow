/*
 * jQuery Slideshow Plugin
 *
 * Copyright 2010, Rainer Borene, João Otávio
 * Licensed under the MIT License
 *
 * Date: 2010-05-11
 */
(function($){

	var $logo = $("<a/>", {class: "slideshowLogo"});

	/* Containers */
	var $slideshowContainer = $("<div/>", {id: "slideshowContainer"});
	var $slideshowOverlay = $("<div/>", {id: "slideshowOverlay"});

	/* Thumbnails */
	var $thumbnailsContainer = $("<div/>", {id: "thumbnailsContainer"});
	var $thumbnails = $("<div/>", {id: "thumbnails"});
	var $items = $("<div/>", {id: "items"});

	/* Image */
	var $imageContainer = $("<div/>", {id: "imageContainer"});
	var $image = $("<img/>");

	/* Buttons */
	var $closeButton = $("<a/>", {class: "closeButton"});
	var $previousButton = $("<a/>", {class: "previousButton"});
	var $nextButton = $("<a/>", {class: "nextButton"});

	var settings = {
		closeDuration: "fast",
		expressions: {
			src: [/_t\.jpg$/, "_s.jpg"],
			selected: [/_[A-Za-z]+\./, '.']
		}
	};

	$.slideshow = {
		version: "0.3",

		_initialize: function(){
			$slideshowContainer.prependTo(document.body);
			$slideshowOverlay.prependTo($slideshowContainer);

			$thumbnailsContainer.prependTo($slideshowContainer);
			$thumbnails.appendTo($thumbnailsContainer);
			$items.appendTo($thumbnails);

			$imageContainer.insertBefore($thumbnailsContainer);
			$image.appendTo($imageContainer);

			$closeButton.prependTo($slideshowContainer);
			$previousButton.prependTo($thumbnailsContainer);
			$nextButton.appendTo($thumbnailsContainer);

			$logo.prependTo($slideshowContainer);

			// Internet Explorer 6 transparency fix
			if (jQuery.browser.msie && parseInt(jQuery.browser.version, 10) < 7 && parseInt(jQuery.browser.version, 10) > 4){
				$(".closeButton, .previousButton, .nextButton, .slideshowLogo").each(function(){
					var self = jQuery(this), src = self.css("background-image").match(/^url\("([^'"]+)"\)/i)[1];
					self.css("filter", "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + src + "', sizingMethod='crop')").addClass("png");
				});
			}

			$previousButton.click(function(){
				$thumbnails.stop().animate({scrollLeft: "-=87"});
			});

			$nextButton.click(function(){
				$thumbnails.stop().animate({scrollLeft: "+=87"});
			});

			$.slideshow._initializeEvents();
		},

		_initializeEvents: function(){
			$closeButton.click($.slideshow.close);

			$(document).keydown(function(event){
				if (event.keyCode == '27'){
					$.slideshow.close();
				} else if (event.keyCode == '37'){
					$.slideshow.prev();
				} else if (event.keyCode == '39'){
					$.slideshow.next();
				}
			});

			$items.delegate("img", "click", function(){
				var self = $(this);

				$("div#items img.selected").removeClass("selected");
				self.addClass("selected");

				$imageContainer.addClass("loading");
				$image.fadeOut("slow", function(){
					var resource = new Image();
					resource.onload = function(){
						$image.data("meta", {width: this.width, height: this.height});
						$image.attr("src", this.src);

						$.slideshow._resize();
						$imageContainer.removeClass("loading");
						$image.fadeIn("slow");
					};

					resource.src = self.data('original');
				});
			});

			$items.bind("fit", function(){
				this.width = ($(this).find("img:visible").length * (75 + 13)) - 7;



				$(this).css("width", this.width + "px");
				$(this).find("img:visible:last").css("margin-right", "0px");

				return this;
			});

			$(window).resize($.slideshow._resize);
		},

		_load: function(element){
			var original = $(element).attr("href"), img = $(element).find("img").clone(), src = img.attr("src");

			img.data('original', original);

			//console.log(element.rel);

			if (settings.expressions.src){
				src = src.replace(settings.expressions.src[0], settings.expressions.src[1]);
			}

			img.attr("src", src).appendTo($items);
			img.attr("class", element.rel);
			//console.log(img.parent());

		},

		open: function(image){
			$("html").css("overflow", "hidden");

			// Unfortunately, we need to call this function twice :(
			$.slideshow._resize();

			if (image !== "undefined"){
				$imageContainer.addClass("loading");
				$items.find("img.selected").removeClass("selected");
				$items.find("img").filter(function(){
					if (this.src.replace(settings.expressions.selected[0], settings.expressions.selected[1]) === image){
						return this;
					}
				}).addClass("selected");

				var resource = new Image();
				resource.onload = function(){
					$image.data("meta", {width: this.width, height: this.height});
					$image.attr("src", this.src);
					$image.css("visibility", "visible");
					$imageContainer.removeClass("loading");
					$.slideshow._resize();
				};

				resource.src = image;
			}

			$slideshowContainer.css("display", "block");
		},

		close: function(){
			$slideshowContainer.fadeOut(settings.closeDuration, function(){
				$image.css("visibility", "hidden");
				$("html").css("overflow", "auto");
			});
		},

		prev: function(){
			var selected = $("div#items img.selected");

			if (selected.prev(':visible').length){
				$thumbnails.stop().animate({scrollLeft: "-=87"});
				selected.removeClass("selected").prev(':visible').addClass("selected").trigger("click");
			}
		},

		next: function(){
			var selected = $("div#items img.selected");

			if (selected.next(':visible').length){
				$thumbnails.stop().animate({scrollLeft: "+=87"});
				selected.removeClass("selected").next(':visible').addClass("selected").trigger("click");
			}
		},

		// Thanks to http://www.ajaxblender.com/howto-resize-image-proportionally-using-javascript.html
		_scaleSize: function(maxW, maxH, currW, currH){
			var ratio = currH / currW;

			if (currH >= maxH){
				currH = maxH;
				currW = currH / ratio;
			}

			return {
				width: currW,
				height: currH
			};
		},

		_resize: function(){
			// image meta information
			var meta = $image.data("meta");

			// window size object
			var windowSize = {
				width: $(window).width(),
				height: $(window).height()
			};

			if (meta !== null){
				var distance = $thumbnailsContainer.outerHeight() + parseInt($thumbnailsContainer.css("bottom"));
				var size = $.slideshow._scaleSize(windowSize.width, (windowSize.height - distance), meta.width, meta.height);
				var position = (windowSize.height - size.height - distance) / 2;

				$image.css({
					width: size.width,
					height: size.height,
					top: Math.max(position, 0)
				});
			}

			$thumbnails.css("width", windowSize.width - 60 - 95);
		}
	};

	$.fn.slideshow = function(options){
		$.extend(settings, options);

		this.each(function(){
			$.slideshow._load(this);

			$(this).click(function(){
				$items.find('img').hide();
				$items.find('img.'+this.rel).show();
				$.slideshow.open(this.href);
				$items.trigger("fit");
				return false;
			});
		});

		return this;
	};

	jQuery($.slideshow._initialize);

})(jQuery);