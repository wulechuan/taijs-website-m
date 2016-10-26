$(function () {
	var app = taijs.app;
	var wlc = window.webLogicControls;

	var $page = $('#page-my-tickets-index');


	(function _setupTabPanelSet() {
		// var tabPanelSet = new wlc.UI.TabPanelSet($page.find('.tab-panel-set')[0], {
		// 	doNotShowPanelAtInit: true,
		// 	// initTab: app.data.URIParameters.tabLabel
		// });
		// if (tabPanelSet.hasBeenDestroied) {
		// 	return;
		// }


		var ticketsTabsSwiper = new window.Swiper('.swiper-container.tab-list-container', {
			slidesPerView: 'auto',
			freeMode: true,
			// freeModeSticky: true,
			spaceBetween: 0,
		});

		var ticketsPanelsSwiper = new window.Swiper('.swiper-container.panels-container', {
			slidesPerView: 'auto',
			freeMode: false,
		});

		// ticketsTabsSwiper  .params.control = ticketsPanelsSwiper;
		// ticketsPanelsSwiper.params.control = ticketsTabsSwiper;


		// tabPanelSet.showPanelViaTab(app.data.URIParameters.tabLabel || 0);
	})();
});
