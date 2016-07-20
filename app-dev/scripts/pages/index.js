$(function () {
	(function () {
		new window.Swiper('.swiper-container', {
			pagination: '.carousel-nav',
			paginationElement: 'button',
			paginationClickable: true
		});
	})();

	function processParametersPassedIn() {
		var qString = location.href.match(/\?[^#]*/);
		if (qString) qString = qString[0].slice(1);

		var qKVPairs = [];
		if (qString) {
			qKVPairs = qString.split('&');
		}

		var login = false;

		for (var i in qKVPairs){
			var kvpString = qKVPairs[i];
			var kvp = kvpString.split('=');

			if (kvp[0] === 'login') login = kvp[1].toLowerCase() === 'true';
		}

		return {
			login: login
		};
	}

	var urlParameters = processParametersPassedIn();
	if (urlParameters.login) {
		$('body').addClass('user-has-logged-in');
	} else {
		$('body').removeClass('user-has-logged-in');
	}


	$('.page').each(function () {
		var page = this;
		var $page = $(page);
		var pageBody = $page.find('.page-body').get(0); // in case there are accidentally multiple page-body elements;
		var $pageBody = $(pageBody);

		var pageHeaderNormalHeight = 128;
		var pageHeaderCompactHeight = 50;
		var pageHeaderHeightDelta = pageHeaderNormalHeight - pageHeaderCompactHeight;
		var pageHeaderScrollYThreshold = pageHeaderHeightDelta * 0.75;

		var pagePaddingTop = 0;

		var pagePaddingTopIsCorrect = false;
		var currentModeIsCompact = false;

		$page.on('scroll', function () {
			if (!pagePaddingTopIsCorrect) {
				var computedStyle = window.getComputedStyle(page, null);
				if (computedStyle) {
					pagePaddingTop = parseFloat(computedStyle.paddingTop);
				} else {
					pagePaddingTop = 0;
				}

				pagePaddingTopIsCorrect = true;
			}

		    var offset = $pageBody.offset();

		    var scrollY = pagePaddingTop - offset.top;

		    if (scrollY >= pageHeaderScrollYThreshold) {
		    	if (!currentModeIsCompact) {
			    	$page.addClass('page-header-in-compact-mode fixed-page-header');
			    	currentModeIsCompact = true;
		    	}
		    } else {
		    	if (currentModeIsCompact) {
			    	$page.removeClass('page-header-in-compact-mode fixed-page-header');
			    	currentModeIsCompact = false;
		    	}
		    }
		});
	});
});