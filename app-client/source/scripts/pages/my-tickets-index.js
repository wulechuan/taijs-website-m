$(function () {
	var app = taijs.app;
	var wlc = window.webLogicControls;

	var $page = $('#page-my-tickets-index');


	(function _setupTabPanelSet() {
		var tabPanelSet = new wlc.UI.TabPanelSet($page.find('#chief-panel-set')[0], {
			// doNotShowPanelAtInit: true,
			// initTab: app.data.URIParameters.tabLabel
		});
		if (tabPanelSet.hasBeenDestroied) {
			return;
		}

		var ticketsTabsSwiperRootElement   = $('#chief-panel-set .swiper-container.tab-list-container')[0];
		var ticketsPanelsSwiperRootElement = $('#chief-panel-set .swiper-container.panel-group-container')[0];
		var ticketsTabsSwiper, ticketsPanelsSwiper;

		if (ticketsTabsSwiperRootElement) {
			$(ticketsTabsSwiperRootElement).find('> .tab-list > li').each(function (i, tab) {
				tab.dataset.tabIndex = i;
				$(tab).on('click', function (event) {
					ticketsTabsSwiper.slideTo(i);
					ticketsPanelsSwiper.slideTo(i);
				});
			});

			ticketsTabsSwiper = new window.Swiper(ticketsTabsSwiperRootElement, {
				slidesPerView: 'auto',
			});
		}

		if (ticketsPanelsSwiperRootElement) {
			$(ticketsPanelsSwiperRootElement).find('> .panel-group > .panel').each(function (i, tab) {
				tab.dataset.panelIndex = i;
			});

			ticketsPanelsSwiper = new window.Swiper(ticketsPanelsSwiperRootElement, {
				freeMode: false,
				onSlideChangeStart: function (swiper) {
					var panelToShow = swiper.slides[swiper.activeIndex];
					var indexOfPanelToShow = panelToShow.dataset.panelIndex;
					ticketsTabsSwiper.slideTo(indexOfPanelToShow);
					tabPanelSet.showPanel(indexOfPanelToShow);
				}
			});
		}

		// tabPanelSet.showPanelViaTab(app.data.URIParameters.tabLabel || 0);
	})();
});
