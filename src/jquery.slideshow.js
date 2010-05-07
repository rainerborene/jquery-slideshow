/*
 * jQuery Slideshow Plugin
 *
 * Copyright 2010, Rainer Borene, João Otávio
 * Licensed under the MIT License
 *
 * Date: 2010-05-07
 */
(function($){

	var $logo = $("<a/>").attr("class", "slideshowLogo");

	/* Containers */
	var $slideshowContainer = $("<div/>").attr("id", "slideshowContainer");
	var $slideshowOverlay = $("<div/>").attr("id", "slideshowOverlay");

	/* Thumbnails */
	var $thumbnailsContainer = $("<div/>").attr("id", "thumbnailsContainer");
	var $thumbnails = $("<div/>").attr("id", "thumbnails");
	var $items = $("<div/>").attr("id", "items");

	/* Image */
	var $imageContainer = $("<div/>").attr("id", "imageContainer");
	var $image = $("<img/>");

	/* Buttons */
	var $closeButton = $("<a/>").addClass("closeButton");
	var $previousButton = $("<a/>").addClass("previousButton");
	var $nextButton = $("<a/>").addClass("nextButton");

	var settings = {
		closeDuration: "fast",
		expressions: {
			src: [/_t\.jpg$/, "_s.jpg"],
			selected: [/_[A-Za-z]+\./, '.']
		}
	};

	$.slideshow = {
		version: "0.2.1",

		initialize: function(){
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

			$.slideshow.initializeEvents();
		},

		initializeEvents: function(){
			$closeButton.click($.slideshow.close);

			$(document).keydown(function(event){
				var selected = $("div#items img.selected");

				if (event.keyCode == '27'){
					$.slideshow.close();
				} else if (event.keyCode == '37'){
					$thumbnails.stop().animate({scrollLeft: "-=87"});

					if (selected.prev("img").length){
						selected.removeClass("selected").prev("img").addClass("selected").trigger("click");
					}
				} else if (event.keyCode == '39'){
					$thumbnails.stop().animate({scrollLeft: "+=87"});

					if (selected.next("img").length){
						selected.removeClass("selected").next("img").addClass("selected").trigger("click");
					}
				}
			});

			$("div#items").delegate("img", "click", function(){
				var self = $(this);

				$("#items img.selected").removeClass("selected");
				self.addClass("selected");

				$imageContainer.addClass("loading");

				$image.fadeOut("slow", function(){
					var resource = new Image();
					resource.onload = function(){
						$image.data("meta", {width: this.width, height: this.height});
						$image.attr("src", this.src);

						$.slideshow.resize();
						$imageContainer.removeClass("loading");
						$image.fadeIn("slow");
					};

					resource.src = self.data('original');
				});
			});

			$(window).resize($.slideshow.resize);
		},

		load: function(element){
			var original = $(element).attr("href"), img = $(element).find("img").clone(), src = img.attr("src");

			img.data('original', original);

			if (settings.expressions.src){
				src = src.replace(settings.expressions.src[0], settings.expressions.src[1]);
			}

			img.attr("src", src).appendTo($items);
		},

		adjust: function(){
			var width = ($items.find("img").length * (75 + 13)) - 7;
			$items.css("width", width + "px");
			$items.find("img:last").css("margin-right", "0px");
		},

		open: function(image){
			$("html").css("overflow", "hidden");

			// Unfortunately, we need to call this function twice :(
			$.slideshow.resize();

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
					$.slideshow.resize();
				};

				resource.src = image;
			}

			$slideshowContainer.css("display", "block");
		},

		close: function(){
			return $slideshowContainer.fadeOut(settings.closeDuration, function(){
				$image.css("visibility", "hidden");
				$("html").css("overflow", "auto");
			});
		},

		// Thanks to http://www.ajaxblender.com/howto-resize-image-proportionally-using-javascript.html
		scaleSize: function(maxW, maxH, currW, currH){
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

		resize: function(){
			// image meta information
			var meta = $image.data("meta");

			// window size object
			var windowSize = {
				width: $(window).width(),
				height: $(window).height()
			};

			if (meta !== null){
				var distance = $thumbnailsContainer.outerHeight() + parseInt($thumbnailsContainer.css("bottom"));
				var size = $.slideshow.scaleSize(windowSize.width, (windowSize.height - distance), meta.width, meta.height);
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
			$.slideshow.load(this);

			$(this).click(function(){
				$.slideshow.open(this.href);
				return false;
			});
		});

		$.slideshow.adjust();

		return this;
	};

	jQuery($.slideshow.initialize);

})(jQuery);