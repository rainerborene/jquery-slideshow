/*
 * jQuery Slideshow Plugin
 *
 * Authors: Rainer Borene, João Otávio
 * Copyright 2010, Movida Comunicação, Ltda.
 * Licensed under the MIT License
 *
 * Date: 2010-05-23
 */
(function($){

	var $logo = $("<a/>", {"class": "slideshowLogo"});

	/* Containers */
	var $slideshowContainer = $("<div/>", {id: "slideshowContainer"});
	var $slideshowOverlay = $("<div/>", {id: "slideshowOverlay"});

	/* Thumbnails */
	var $thumbnailsContainer = $("<div/>", {id: "thumbnailsContainer"});
	var $thumbnails = $("<div/>", {id: "thumbnails"});
	var $items = $("<div/>", {id: "items"});

	/* Image */
	var $mediaContainer = $("<div/>", {id: "mediaContainer"});
	var $image = $("<img/>");

	/* Buttons */
	var $closeButton = $("<a/>", {"class": "closeButton"});
	var $previousButton = $("<a/>", {"class": "previousButton"});
	var $nextButton = $("<a/>", {"class": "nextButton"});

	var settings = {
		closeDuration: "fast",
		helpers: {
			src: [/_t\.jpg$/, "_s.jpg"]
		}
	};

	$.slideshow = {
		version: "0.5.1",

		_initialize: function(){
			$slideshowContainer.prependTo(document.body);
			$slideshowOverlay.prependTo($slideshowContainer);

			$thumbnailsContainer.prependTo($slideshowContainer);
			$thumbnails.appendTo($thumbnailsContainer);
			$items.appendTo($thumbnails);

			$mediaContainer.insertBefore($thumbnailsContainer);
			$image.appendTo($mediaContainer);

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
				var self = $(this), video = $.slideshow._getVideoParams(self.data('original'));

				$("div#items img.selected").removeClass("selected");
				self.addClass("selected");

				$mediaContainer.find("object").remove();

				if (video){
					var $video = $.slideshow._createEmbed(video.url, video.vars);

					$image.css("display", "none");
					$video.appendTo($mediaContainer);
					$.slideshow._resize();
				} else {
					$mediaContainer.addClass("loading");
					$image.fadeOut("slow", function(){
						var resource = new Image();
						resource.onload = function(){
							$image.data("meta", {width: this.width, height: this.height});
							$image.attr("src", this.src);
							$.slideshow._resize();
							$mediaContainer.removeClass("loading");
							$image.fadeIn("slow");
						};
	
						resource.src = self.data('original');
					});
				}
			});

			$items.bind("fit", function(event){
				this.selected = $(this).find(".selected");
				this.selectedOffset = (this.selected.length) ? this.selected.offset().left - this.selected.outerWidth() : 0;
				this.width = $(this).find(":visible").length * (75 + 13) - 7;

				$(this).css("width", this.width + "px");
				$(this).find(":visible:last").css("margin-right", "0px");
				$(this).parent().scrollLeft(this.selectedOffset);

				return this;
			});

			$items.bind("selecting", function(event, media, thumb){
				$(this).find("img.selected").removeClass("selected");
				$(this).find("img").filter(function(){
					if ($(this).data("original") == media || $(this).attr("src") == thumb){
						return this;
					}
				}).addClass("selected");

				return this;
			});

			$(window).resize($.slideshow._resize);
		},

		_createEmbed: function(url, vars){
			return $('<object width="640" height="385" type="application/x-shockwave-flash" data="' + url + '">' + 
						(vars !== null ? '<param name="flashvars" value="' + vars + '"/>' : null) +
						'<param name="movie" value="' + url + '"/>' +
						'<param name="allowFullScreen" value="true"/>' +
						'<param name="allowscriptaccess" value="always"/>' +
						'<param name="bgcolor" value="000000"/>' + 
						'<param name="wmode" value="transparent"/>' + 
						'<embed src="' + url + '" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" ' +
						'flashvars="' + vars + '" wmode="transparent" bgcolor="000000" width="640" height="385"/>' +
					'</object>');
		},

		_load: function(element){
			var original = $(element).attr("href"), img = $(element).find("img").clone(), src = img.attr("src");

			if (settings.helpers.src){
				src = src.replace(settings.helpers.src[0], settings.helpers.src[1]);
			}

			img.data("original", original).attr({rel: element.rel, src: src}).appendTo($items);
		},

		_getVideoParams: function(url){
			var newUrl, newVars;

			if (url.match("video=yes")){
				newUrl = url.match(/url=([^&]+)/);
				newVars = url.replace(/url=[^&]+/g, "").replace("video=yes", "");

				return {
					url: newUrl[1],
					vars: newVars
				}				
			}
		},

		open: function(media, thumb){
			var video = this._getVideoParams(media);

			$("html").css("overflow", "hidden");
			$(window).scrollTop(0);

			$mediaContainer.find("object").remove();

			if (video){
				var $video = this._createEmbed(video.url, video.vars);

				$items.trigger("selecting", [media, thumb]);
				$image.css("display", "none");
				$video.appendTo($mediaContainer);

				// must undefine media variable, because we won't use it anymore.
				media = null;
			}

			// Unfortunately, we need to call this function twice :(
			$.slideshow._resize();

			if (typeof media !== "undefined" && media !== null){
				$mediaContainer.addClass("loading");
				$items.trigger("selecting", [media, thumb]);

				var resource = new Image();
				resource.onload = function(){
					$image.data("meta", {width: this.width, height: this.height});
					$image.attr("src", this.src);
					$image.css({display: "inline-block", visibility: "visible"});
					$mediaContainer.removeClass("loading");
					$.slideshow._resize();
				};

				resource.src = media;
			}

			$slideshowContainer.css("display", "block");

			$items.trigger("fit");
		},

		close: function(){
			$slideshowContainer.fadeOut(settings.closeDuration, function(){
				$image.css("visibility", "hidden");
				$("html").css("overflow", "auto");
			});
		},

		prev: function(){
			var selected = $("div#items img.selected");

			if (selected.prev(":visible").length){
				$thumbnails.stop().animate({scrollLeft: "-=87"});
				selected.removeClass("selected").prev(":visible").addClass("selected").trigger("click");
			}
		},

		next: function(){
			var selected = $("div#items img.selected");

			if (selected.next(":visible").length){
				$thumbnails.stop().animate({scrollLeft: "+=87"});
				selected.removeClass("selected").next(":visible").addClass("selected").trigger("click");
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
			var meta = $image.data("meta"), $video = $mediaContainer.find("object");

			// window size object
			var windowSize = {
				width: $(window).width(),
				height: $(window).height()
			};

			var distance = $thumbnailsContainer.outerHeight() + parseInt($thumbnailsContainer.css("bottom"));

			// positioning for images
			if (meta !== null && !$video.length){
				var size = $.slideshow._scaleSize(windowSize.width, (windowSize.height - distance), meta.width, meta.height);
				var position = (windowSize.height - size.height - distance) / 2;

				$image.css({
					width: size.width,
					height: size.height,
					top: Math.max(position, 0)
				});
			}

			// positioning for videos
			if ($video.length){
				var position = (windowSize.height - parseInt($video.css("height")) - distance) / 2;

				$video.css("top", Math.max(position, 0));
			}

			$thumbnails.css("width", windowSize.width - 60 - 95);
		}
	};

	$.fn.slideshow = function(options){
		$.extend(settings, options);

		this.each(function(){
			// prevents element from being added two times..
			if ($(this).data('slideshow.included') == null){
				$.slideshow._load(this);

				$(this).click(function(){
					var thumb = $(this).find("img").attr("src");

					$items.find("img").hide();
					$items.find("img[rel=" + this.rel + "]").show();
					$.slideshow.open(this.href, thumb);

					return false;
				});

				$(this).data('slideshow.included', true);
			}
		});

		return this;
	};

	jQuery($.slideshow._initialize);

})(jQuery);