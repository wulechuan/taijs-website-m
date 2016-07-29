$(function () {
	(function () {
		new window.Swiper('.swiper-container', {
			pagination: '.carousel-nav',
			paginationElement: 'button',
			paginationClickable: true
		});
	})();

	$('.page').each(function () {
		function getScrollingOffsetFor(content) {
			if (!content || content === document) {
				return {
					top:  -window.scrollY,
					left: -window.scrollX
				};
			}

			return $(content).offset();
		}
		function updatePageHeaderModeBasedOnScrolling() {
			var shouldSwitchPageHeaderMode = false;
			var currentTopOffset = getScrollingOffsetFor(scrollingElement).top;

			if (pageHeaderIsInCompactMode) {
				shouldSwitchPageHeaderMode = currentTopOffset >= currentTopOffsetThresholdForExpansion;
				if (shouldSwitchPageHeaderMode) {
					$page.removeClass('page-header-in-compact-mode');
					pageHeaderIsInCompactMode = false;
				}
			} else {
				shouldSwitchPageHeaderMode = currentTopOffset <= currentTopOffsetThresholdForCollapse;
				if (shouldSwitchPageHeaderMode) {
					$page.addClass('page-header-in-compact-mode');
					pageHeaderIsInCompactMode = true;
				}
			}
		}


		var scrollingElement = document;
		var $page = $(this);


		var triggerRatioForCallapse = 1.2;
		var triggerRatioForExpansion = 0.8;
		var pageHeaderNormalHeight = 128;
		var pageHeaderCompactHeight = 50;



		var pageHeaderHeightDelta = pageHeaderNormalHeight - pageHeaderCompactHeight;
		var currentTopOffsetThresholdForCollapse  = Math.abs(pageHeaderHeightDelta) * -Math.abs(triggerRatioForCallapse);
		var currentTopOffsetThresholdForExpansion = Math.abs(pageHeaderHeightDelta) * -Math.abs(triggerRatioForExpansion);
		var pageHeaderIsInCompactMode = $page.hasClass('page-header-in-compact-mode');


		updatePageHeaderModeBasedOnScrolling();
		$(scrollingElement).on('scroll', updatePageHeaderModeBasedOnScrolling);
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