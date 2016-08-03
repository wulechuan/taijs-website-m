$(function () {
	var wlc = window.webLogicControls;

	var tabPanelSet1 = new wlc.UI.TabPanelSet($('.tab-panel-set')[0]);
	var tabPanelSet1Swiper = new window.Swiper('.swiper-container', {
		pagination: '.tab-list',
		paginationType: 'custome',
		paginationElement: 'li',
		paginationClickable: true

	});

	tabPanelSet1Swiper.on('slideChangeStart', function (swiper) {
		tabPanelSet1.syncStatusToPanel(swiper.activeIndex);
	});


	// $('.page').each(function () {
	// 	function getScrollingOffsetFor(content) {
	// 		if (!content || content === document) {
	// 			return {
	// 				top:  -window.scrollY,
	// 				left: -window.scrollX
	// 			};
	// 		}

	// 		return $(content).offset();
	// 	}
	// 	function updatePageHeaderModeBasedOnScrolling() {
	// 		var shouldSwitchPageHeaderMode = false;
	// 		var currentTopOffset = getScrollingOffsetFor(scrollingElement).top;

	// 		if (pageHeaderIsInCompactMode) {
	// 			shouldSwitchPageHeaderMode = currentTopOffset >= currentTopOffsetThresholdForExpansion;
	// 			if (shouldSwitchPageHeaderMode) {
	// 				$page.removeClass('page-header-in-compact-mode');
	// 				pageHeaderIsInCompactMode = false;
	// 			}
	// 		} else {
	// 			shouldSwitchPageHeaderMode = currentTopOffset <= currentTopOffsetThresholdForCollapse;
	// 			if (shouldSwitchPageHeaderMode) {
	// 				$page.addClass('page-header-in-compact-mode');
	// 				pageHeaderIsInCompactMode = true;
	// 			}
	// 		}
	// 	}


	// 	var scrollingElement = document;
	// 	var $page = $(this);


	// 	var triggerRatioForCallapse = 1.2;
	// 	var triggerRatioForExpansion = 0.8;
	// 	var pageHeaderNormalHeight = 128;
	// 	var pageHeaderCompactHeight = 48;



	// 	var pageHeaderHeightDelta = pageHeaderNormalHeight - pageHeaderCompactHeight;
	// 	var currentTopOffsetThresholdForCollapse  = Math.abs(pageHeaderHeightDelta) * -Math.abs(triggerRatioForCallapse);
	// 	var currentTopOffsetThresholdForExpansion = Math.abs(pageHeaderHeightDelta) * -Math.abs(triggerRatioForExpansion);
	// 	var pageHeaderIsInCompactMode = $page.hasClass('page-header-in-compact-mode');


	// 	updatePageHeaderModeBasedOnScrolling();
	// 	$(scrollingElement).on('scroll', updatePageHeaderModeBasedOnScrolling);
	// });
});
