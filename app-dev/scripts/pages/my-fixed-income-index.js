$(function () {
	var app = window.taijs.app;

	var wlc = window.webLogicControls;
	var UI = wlc.UI;

	var $page = $('#page-my-fixed-income-index');
		// UI.popupLayersManager.show('pl-product-terminated');



	$page.find('.abstract-title').each(function () {
		var productName = $(this).find('.left h3').html();

		if (!productName) return;

		var anchor1 = $(this).parent()[0];
		if (anchor1 && anchor1.tagName.toLowerCase() === 'a' && anchor1.href.length > 2) {
			anchor1.href += '?productName='+productName;
		}

		var anchor2 = $(this).parents('.f-block-body').find('.abstract-body').parent()[0];
		if (anchor2 && anchor2.tagName.toLowerCase() === 'a' && anchor2.href.length > 2) {
			anchor2.href += '&productName='+productName;
		}
	});



	var isFirstTimeAccess = app.data.URIParameters.firstTime==='true';
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
				UI.popupLayersManager.show(plUserGuide);
			}

			function hideUserGuide() {
				UI.popupLayersManager.hide(plUserGuide);
			}

			return userGuide;
		})();

		userGuide.show();
	}



	(function _setupTabPanelSet() {
		var tabPanelSet = new wlc.UI.TabPanelSet($page.find('.tab-panel-set')[0], {
			doNotShowPanelAtInit: true,
			// initTab: app.data.URIParameters.tabLabel
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
				var itemsCount = $(panel).find('.product-abstract').length;
				var shouldShowPageFooter = panel.panelIndex === 1 && itemsCount < 1;
				if (shouldShowPageFooter) {
					$pageFooter.show();
				} else {
					$pageFooter.hide();
				}
				// tabPanelSet.showNextPanel();
				tabPanelSetSwiper.slideTo(panel.panelIndex);
			};
		}

		tabPanelSet.showPanelViaTab(app.data.URIParameters.tabLabel || 0);




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
