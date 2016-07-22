$(function () {
	(function () {
		new window.Swiper('.swiper-container', {
			pagination: '.carousel-nav',
			paginationElement: 'button',
			paginationClickable: true
		});
	})();

	$('.page').each(function () {
		var page = this;
		var $page = $(page);
		var pageBody = $page.find('.page-body').get(0); // in case there are accidentally multiple page-body elements;
		var $pageBody = $(pageBody);

		var pageHeaderNormalHeight = 128;
		var pageHeaderCompactHeight = 50;
		var pageHeaderHeightDelta = pageHeaderNormalHeight - pageHeaderCompactHeight;

		var pageBodyTopOffsetBaseInExpandedMode = NaN;

		var pageBodyCurrentTopOffsetThreshold = pageHeaderHeightDelta * -0.75;
		var pageBodyCurrentTopOffsetBase = 0;
		var pageBodyCurrentTopOffsetBaseShouldBeCorrect = false;

		var currentModeIsCompact = $page.hasClass('page-header-in-compact-mode');

		$page.on('scroll', function () {
			if (!pageBodyCurrentTopOffsetBaseShouldBeCorrect) {
				if (!currentModeIsCompact && !pageBodyTopOffsetBaseInExpandedMode) {
					var computedStyle = window.getComputedStyle(page, null);
					if (computedStyle) {
						pageBodyTopOffsetBaseInExpandedMode = parseFloat(computedStyle.paddingTop);
					} else {
						pageBodyTopOffsetBaseInExpandedMode = 0;
					}

					pageBodyCurrentTopOffsetBase = pageBodyTopOffsetBaseInExpandedMode;
				} else {
					pageBodyCurrentTopOffsetBase = pageHeaderCompactHeight;
				}

				pageBodyCurrentTopOffsetBaseShouldBeCorrect = true;
			}

		    var pageBodyOffset = $pageBody.offset();

		    var pageBodyCurrentTopOffset = pageBodyCurrentTopOffsetBase - pageBodyOffset.top;


		    var shouldSwitchIntoCompactMode = false;
		    var shouldSwitchIntoExpandedMode = false;

		    if (currentModeIsCompact) {
		    	// so the pageBodyCurrentTopOffset will be NEGATIVE
		    	shouldSwitchIntoCompactMode = false;
		    	shouldSwitchIntoExpandedMode = pageBodyCurrentTopOffset <= pageBodyCurrentTopOffsetThreshold
		    } else {
		    	shouldSwitchIntoExpandedMode = false
		    	shouldSwitchIntoCompactMode = pageBodyCurrentTopOffset >= pageBodyCurrentTopOffsetThreshold;
		    }

		    if (!currentModeIsCompact && shouldSwitchIntoCompactMode) {
		    	$page.addClass('page-header-in-compact-mode fixed-page-header');
		    	currentModeIsCompact = true;
				pageBodyCurrentTopOffsetThreshold = pageHeaderCompactHeight * 0.75;
		    	pageBodyCurrentTopOffsetBaseShouldBeCorrect = false;
		    }

	    	if (currentModeIsCompact && shouldSwitchIntoExpandedMode) {
		    	$page.removeClass('page-header-in-compact-mode fixed-page-header');
		    	currentModeIsCompact = false;
				pageBodyCurrentTopOffsetThreshold = pageHeaderHeightDelta * -0.75;
		    	pageBodyCurrentTopOffsetBaseShouldBeCorrect = false;
	    	}
		});
	});
});

$(function () { // fake logic
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

			if (kvp[0] === 'login') login = (typeof kvp[1] === 'string') && (kvp[1].toLowerCase() === 'true');
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
});