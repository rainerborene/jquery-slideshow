/*
 * jQuery Slideshow Plugin
 *
 * Copyright 2010, Rainer Borene, João Otávio
 * Licensed under the MIT License
 *
 * Date: 2010-04-23
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
		expressions: {
			src: [/_t\.jpg$/, "_s.jpg"]
		}
	};

	$.slideshow = {
		version: "0.1",
		initialized: false,

		initialize: function(){
			if ($.slideshow.initialized === true) return this;

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

			// Internet Explorer transparency fix
			if (jQuery.browser.msie && parseInt(jQuery.browser.version, 10) < 7 && parseInt(jQuery.browser.version, 10) > 4){
				$(".closeButton, .previousButton, .nextButton").each(function(){
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
			$.slideshow.initialized = true;
		},

		initializeEvents: function(){
			$closeButton.click($.slideshow.close);

			$(document).keydown(function(event){
				if (event.keyCode == '27'){
					$.slideshow.close();
				} else if (event.keyCode == '37'){
					$thumbnails.stop().animate({scrollLeft: "-=87"});
				} else if (event.keyCode == '39'){
					$thumbnails.stop().animate({scrollLeft: "+=87"});
				}
			});

			$("#items img").live("click", function(){
				var self = $(this);

				$("#items img[class='selected']").removeClass("selected");
				self.addClass("selected");

				$imageContainer.addClass("loading");

				$image.fadeOut("slow", function(){
					var image = new Image();
					image.onload = function(){
						$image.attr("src", image.src);

						var distance = $thumbnailsContainer.outerHeight() + parseInt($thumbnailsContainer.css("bottom")),
							top = ($(window).height() - $image.height() - distance) / 2;

						$image.css("top", Math.max(top, 0));
						$imageContainer.removeClass("loading");
						$image.fadeIn("slow");
					};

					image.src = self.data('realsize');
				});
			});

			$(window).resize($.slideshow.resize);
		},

		load: function(element){
			var original = $(element).attr("href"),
				img = $(element).find("img").clone(),
				src = img.attr("src");

			img.data('realsize', original);

			if (settings.expressions.src){
				src = src.replace(settings.expressions.src[0], settings.expressions.src[1]);
			}

			img.attr("src", src).appendTo($items);
		},

		adjust: function(){
			var width = ($("#items img").length * (75 + 13)) - 7;

			$items.css("width", width + "px");
			$items.find("img:last").css("margin-right", "0px");
		},

		open: function(image){
			$(document.body).css("overflow", "hidden");

			// Unfortunately, we had to call this function twice :(
			$.slideshow.resize();

			if (image !== "undefined"){
				$items.find("img[class='selected']").removeClass("selected");
				$items.find("img").filter(function(){
					if (this.src.replace(/_[A-Za-z]+\./, '.') === image){
						return this;
					}
				}).addClass("selected");

				var preload = new Image();
				preload.onload = function(){
					$image.attr("src", preload.src);
					$image.css("visibility", "visible");
					$.slideshow.resize();
				};

				preload.src = image;
			}

			$slideshowContainer.css("display", "block");
		},

		close: function(){
			return $slideshowContainer.fadeOut("slow", function(){
				$image.css("visibility", "hidden");
				$(document.body).css("overflow", "visible");
			});
		},

		resize: function(){
			var width = $(document.body).innerWidth() - 60 - 95,
				distance = $thumbnailsContainer.outerHeight() + parseInt($thumbnailsContainer.css("bottom")),
				topPosition = ($(window).height() - $image.height() - distance) / 2;

			$image.css("top", Math.max(topPosition, 0));
			$thumbnails.css("width", width);
		}
	};

	$.fn.slideshow = function(options){
		$.extend(settings, options);

		$.slideshow.initialize();

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

})(jQuery);

$(document).ready(function(){
	$(".slideshow").slideshow();
});