$(function () {
	var wlc = window.webLogicControls;

	var $page = $('#page-my-fixed-income-index');
		// window.popupLayersManager.show('pl-product-terminated');


	var isFirstTimeAccess = true;
	if (isFirstTimeAccess) {
		var userGuide = (function () {
			var userGuide = {
			};
			userGuide.show = showUserGuide.bind(userGuide);
			userGuide.hide = hideUserGuide.bind(userGuide);

			var $plUserGuide = $('#pl-my-fixed-income-index-page-user-guide');
			var plUserGuide = $plUserGuide[0];
			if (!plUserGuide) return false;

			var $stepButton1 = $plUserGuide.find('.user-guide-step.step-1 button');

			if ($stepButton1.length < 1) $stepButton1 = $plUserGuide;

			$stepButton1.on('click', hideUserGuide);

			function showUserGuide() {
				window.popupLayersManager.show(plUserGuide);
			}

			function hideUserGuide() {
				window.popupLayersManager.hide(plUserGuide);
			}

			return userGuide;
		})();

		userGuide.show();
	}



	(function _setupTabPanelSet() {
		var tabPanelSet = new wlc.UI.TabPanelSet($page.find('.tab-panel-set')[0], {
			doNotShowPanelAtInit: true,
			// initTab: window.urlParameters.tabLabel
		});
		if (tabPanelSet.hasBeenDestroied) {
			return;
		}


		var tabPanelSetSwiper = new window.Swiper('.swiper-container', {
			autoHeight: true
		});
		if (tabPanelSetSwiper) {
			var $pageFooter = $page.find('.page-footer');

			tabPanelSetSwiper.on('slideChangeStart', function (swiper) {
				var panelIndexToShow = swiper.activeIndex;
				tabPanelSet.syncStatusToPanel(panelIndexToShow);
			});

			tabPanelSet.onPanelShow = function (panel) {
				if (panel.panelIndex === 1) {
					$pageFooter.show();
				} else {
					$pageFooter.hide();
				}
				// tabPanelSet.showNextPanel();
				tabPanelSetSwiper.slideTo(panel.panelIndex);
			};
		}

		tabPanelSet.showPanelViaTab(window.urlParameters.tabLabel || 0);




		var tabPanelSetTabList = tabPanelSet.elements.tabList;
		var $tabPanelSetTabList = $(tabPanelSetTabList);
		var tabPanelSetTabListContainer = tabPanelSetTabList.parentNode;

		var heightOfPageHeader = $page.find('.page-header').outerHeight();
		var heightAboveTabPanelSet = $('.content-above-tab-panel-set').outerHeight();
		var heightOfTabPanelSetTabList = $tabPanelSetTabList.outerHeight();
			tabPanelSetTabListContainer.style.height = heightOfTabPanelSetTabList + 'px';

		setupScrollingTriggerForTabPanelSetTabList(
			heightOfPageHeader,
			heightAboveTabPanelSet,
			switchToFixedMode,
			switchToFreeMode
		);

		function switchToFixedMode() {
			$tabPanelSetTabList.addClass('fixed');
			tabPanelSetTabList.style.top = heightOfPageHeader + 'px';
		}

		function switchToFreeMode() {
			$tabPanelSetTabList.removeClass('fixed');
			tabPanelSetTabList.style.top = '';
		}

		function setupScrollingTriggerForTabPanelSetTabList(fixedY, aboveHeight, switchToFixedMode, switchToFreeMode) {
			function getScrollingOffsetFor(content) {
				if (!content || content === document) {
					return {
						top:  -window.scrollY,
						left: -window.scrollX
					};
				}

				return $(content).offset();
			}
			function actionsOnScroll() {
				var shouldSwitch = false;
				var currentTopOffset = getScrollingOffsetFor(scrollingElement).top; // a negative value
				currentTopOffset = -currentTopOffset;  // a positive value
				// C.l(
				// 	'already fixed', positionIsFixed, 
				// 	'\t currentTopOffset', currentTopOffset, 
				// 	'\t expasion', scrollYOffsetThresholdForExpansion,
				// 	'\t collapse', scrollYOffsetThresholdForCollapse
				// );

				if (positionIsFixed) {
					shouldSwitch = currentTopOffset <= scrollYOffsetThresholdForExpansion;
					if (shouldSwitch) {
						switchToFreeMode();
						positionIsFixed = false;
					}
				} else {
					shouldSwitch = currentTopOffset >= scrollYOffsetThresholdForCollapse;
					if (shouldSwitch) {
						switchToFixedMode();
						$(scrollingElement).scrollTop(currentTopOffset);
						positionIsFixed = true;
					}
				}
			}

			var scrollingElement = document;

			var triggerRatioForCallapse = 1;
			var triggerRatioForExpansion = 1;

			var pageOrPageBodyTopSpace = 48; // known
			var aboveHeightInTotal = heightAboveTabPanelSet + pageOrPageBodyTopSpace;

			if (fixedY >= aboveHeightInTotal) {
				return false;
			}

			var freeModeTargetScrollY = aboveHeightInTotal - fixedY; // a positive value

			var scrollYOffsetThresholdForCollapse  = Math.abs(freeModeTargetScrollY) * Math.abs(triggerRatioForCallapse);
			var scrollYOffsetThresholdForExpansion = Math.abs(freeModeTargetScrollY) * Math.abs(triggerRatioForExpansion);

			// C.l(
			// 	'\n freeModeTargetScrollY', freeModeTargetScrollY,
			// 	'\n aboveHeight', aboveHeight,
			// 	'\n aboveHeightInTotal', aboveHeightInTotal,
			// 	'\n scrollYOffsetThresholdForCollapse', scrollYOffsetThresholdForCollapse,
			// 	'\n scrollYOffsetThresholdForExpansion', scrollYOffsetThresholdForExpansion
			// );

			var positionIsFixed = false;
			actionsOnScroll();
			$(scrollingElement).on('scroll', actionsOnScroll);
		}
	})();
});
