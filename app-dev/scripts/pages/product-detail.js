$(function () {
	var app = taijs.app;
	var wlc = window.webLogicControls;
	var UI = wlc.UI;

	var URIProductCaption = app.data.URIParameters.productCaption;
	if (typeof URIProductCaption === 'string') {
		URIProductCaption = URIProductCaption.replace(/^\s*['"']\s*/, '').replace(/\s*['"']\s*$/, '');
	}
	var URIProductStatus = app.data.URIParameters.productStatus;
	// C.l(URIProductCaption, URIProductStatus);

	var buttonIds = [
		'#product-detail-footer-button-count-down',
		'#product-detail-footer-button-sold-out',
		'#product-detail-footer-button-call-to-action'
	];
	var buttonIdToShow;

	switch (URIProductStatus) {
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




	if (URIProductCaption) {
		$('.page-header .header-bar h1').html(URIProductCaption);
		$('a').each(function () {
			var href = this.href;
			if (href.match('fixed-income-buying-confirm.html')) {
				this.href += '?productCaption='+URIProductCaption;
			}
		});
	}
});