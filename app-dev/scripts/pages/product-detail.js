$(function () {
	var app = taijs.app;
	var wlc = window.webLogicControls;
	var UI = wlc.UI;

	var productStatus = app.data.URIParameters.productStatus;

	var buttonIds = [
		'#product-detail-footer-button-count-down',
		'#product-detail-footer-button-sold-out',
		'#product-detail-footer-button-call-to-action'
	];
	var buttonIdToShow;

	switch (productStatus) {
		case 'comingSoon':
			buttonIdToShow = buttonIds[0];
			break;

		case 'soldOut':
			buttonIdToShow = buttonIds[1];
			break;

		case 'available':
		default:
			buttonIdToShow = buttonIds[2];
			break;
	}

	$(buttonIds.join()).each(function () {
		// index is NOT reliable, in case some dom is missing, or the id incorrect
		if ('#'+this.id === buttonIdToShow) {
			$(this).show();
		} else {
			$(this).hide();
		}
	});
});