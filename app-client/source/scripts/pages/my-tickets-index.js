$(function () {
	var app = taijs.app;
	var wlc = window.webLogicControls;

	var $page = $('#page-my-tickets-index');


	(function _setupTabPanelSet() {
		var tabPanelSet = new wlc.UI.TabPanelSet($page.find('.tab-panel-set')[0], {
			doNotShowPanelAtInit: true,
			// initTab: app.data.URIParameters.tabLabel
		});
		if (tabPanelSet.hasBeenDestroied) {
			return;
		}


		var ticketsTabsSwiper = new window.Swiper('.swiper-container.tab-list-container', {
			slidesPerView: 'auto',
			freeMode: true,
			freeModeSticky: true,
			spaceBetween: 0,
		});

		var ticketsPanelsSwiper = new window.Swiper('.swiper-container.panels-container', {
			slidesPerView: 'auto',
			freeMode: false,
		});

		// ticketsTabsSwiper  .params.control = ticketsPanelsSwiper;
		// ticketsPanelsSwiper.params.control = ticketsTabsSwiper;



		// if (ticketsTabsSwiper) {
		// 	var $pageFooter = $page.find('.page-footer');

		// 	ticketsTabsSwiper.on('slideChangeStart', function (swiper) {
		// 		var panelIndexToShow = swiper.activeIndex;
		// 		tabPanelSet.syncStatusToPanel(panelIndexToShow);
		// 	});

		// 	tabPanelSet.onPanelShow = function (panel) {
		// 		var itemsCount = $(panel).find('.product-abstract').length;
		// 		var shouldShowPageFooter = panel.panelIndex === 1 && itemsCount < 1;
		// 		if (shouldShowPageFooter) {
		// 			$pageFooter.show();
		// 		} else {
		// 			$pageFooter.hide();
		// 		}
		// 		// tabPanelSet.showNextPanel();
		// 		ticketsTabsSwiper.slideTo(panel.panelIndex);
		// 	};
		// }

		tabPanelSet.showPanelViaTab(app.data.URIParameters.tabLabel || 0);




		// var tabPanelSetTabList = tabPanelSet.elements.tabList;
		// var $tabPanelSetTabList = $(tabPanelSetTabList);
		// var tabPanelSetTabListContainer = tabPanelSetTabList.parentNode;

		// var heightOfPageHeader = $page.find('.page-header').outerHeight();
		// var heightAboveTabPanelSet = $('.content-above-tab-panel-set').outerHeight();
		// var heightOfTabPanelSetTabList = $tabPanelSetTabList.outerHeight();
		// 	tabPanelSetTabListContainer.style.height = heightOfTabPanelSetTabList + 'px';

		// setupScrollingTriggerForTabPanelSetTabList(
		// 	heightOfPageHeader,
		// 	heightAboveTabPanelSet,
		// 	switchToFixedMode,
		// 	switchToFreeMode
		// );

		// function switchToFixedMode() {
		// 	$tabPanelSetTabList.addClass('fixed');
		// 	tabPanelSetTabList.style.top = heightOfPageHeader + 'px';
		// }

		// function switchToFreeMode() {
		// 	$tabPanelSetTabList.removeClass('fixed');
		// 	tabPanelSetTabList.style.top = '';
		// }

		// function setupScrollingTriggerForTabPanelSetTabList(fixedY, aboveHeight, switchToFixedMode, switchToFreeMode) {
		// 	function getScrollingOffsetFor(content) {
		// 		if (!content || content === document) {
		// 			return {
		// 				top:  -window.scrollY,
		// 				left: -window.scrollX
		// 			};
		// 		}

		// 		return $(content).offset();
		// 	}
		// 	function actionsOnScroll() {
		// 		var shouldSwitch = false;
		// 		var currentTopOffset = getScrollingOffsetFor(scrollingElement).top; // a negative value
		// 		currentTopOffset = -currentTopOffset;  // a positive value
		// 		// C.l(
		// 		// 	'already fixed', positionIsFixed, 
		// 		// 	'\t currentTopOffset', currentTopOffset, 
		// 		// 	'\t expasion', scrollYOffsetThresholdForExpansion,
		// 		// 	'\t collapse', scrollYOffsetThresholdForCollapse
		// 		// );

		// 		if (positionIsFixed) {
		// 			shouldSwitch = currentTopOffset <= scrollYOffsetThresholdForExpansion;
		// 			if (shouldSwitch) {
		// 				switchToFreeMode();
		// 				positionIsFixed = false;
		// 			}
		// 		} else {
		// 			shouldSwitch = currentTopOffset >= scrollYOffsetThresholdForCollapse;
		// 			if (shouldSwitch) {
		// 				switchToFixedMode();
		// 				$(scrollingElement).scrollTop(currentTopOffset);
		// 				positionIsFixed = true;
		// 			}
		// 		}
		// 	}

		// 	var scrollingElement = document;

		// 	var triggerRatioForCallapse = 1;
		// 	var triggerRatioForExpansion = 1;

		// 	var pageOrPageBodyTopSpace = 48; // known
		// 	var aboveHeightInTotal = heightAboveTabPanelSet + pageOrPageBodyTopSpace;

		// 	if (fixedY >= aboveHeightInTotal) {
		// 		return false;
		// 	}

		// 	var freeModeTargetScrollY = aboveHeightInTotal - fixedY; // a positive value

		// 	var scrollYOffsetThresholdForCollapse  = Math.abs(freeModeTargetScrollY) * Math.abs(triggerRatioForCallapse);
		// 	var scrollYOffsetThresholdForExpansion = Math.abs(freeModeTargetScrollY) * Math.abs(triggerRatioForExpansion);

		// 	// C.l(
		// 	// 	'\n freeModeTargetScrollY', freeModeTargetScrollY,
		// 	// 	'\n aboveHeight', aboveHeight,
		// 	// 	'\n aboveHeightInTotal', aboveHeightInTotal,
		// 	// 	'\n scrollYOffsetThresholdForCollapse', scrollYOffsetThresholdForCollapse,
		// 	// 	'\n scrollYOffsetThresholdForExpansion', scrollYOffsetThresholdForExpansion
		// 	// );

		// 	var positionIsFixed = false;
		// 	actionsOnScroll();
		// 	$(scrollingElement).on('scroll', actionsOnScroll);
		// }
	})();
});
