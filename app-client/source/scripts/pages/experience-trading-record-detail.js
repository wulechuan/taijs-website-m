$(function () {
	var app = window.taijs.app;
	var URIP = app.data.URIParameters;
	C.l(URIP);

	// var wlc = window.webLogicControls;
	// var UI = wlc.UI;

	var URIProductName = URIP.productName;
	if (typeof URIProductName === 'string') {
		URIProductName = URIProductName.replace(/^\s*['"]\s*/, '').replace(/\s*['"]\s*$/, '');
	}
	var URITradingStatus = URIP.tradingStatus;
	var URITradingStatusMsg = URIP.tradingStatusMsg;
	// C.l(URIProductName, URITradingStatus);

	var progressStopsBlocksId = [
		'#assest-progress-shou-yi-zhong',
		'#'
	];

	var stateStrings = {
		'#assest-progress-shou-yi-zhong': '收益中',
	};

	var progressStopsBlocksIdString = progressStopsBlocksId.join();

	var blockIdToShow;
	if (URITradingStatus) blockIdToShow = '#assest-progress-'+URITradingStatus;

	var matched = progressStopsBlocksIdString.match(new RegExp(blockIdToShow+','), 'i');
	if (!matched) {
		blockIdToShow = progressStopsBlocksId[0];
	}

	C.l(URITradingStatusMsg);
	if (blockIdToShow === '#assest-progress-shou-yi-zhong' && URITradingStatusMsg) {
		stateStrings[blockIdToShow] = URITradingStatusMsg;
	}

	progressStopsBlocksIdString = progressStopsBlocksIdString.slice(0, -2);
	$(progressStopsBlocksIdString).each(function () {
		// index is NOT reliable, in case some dom is missing, or the id incorrect
		if ('#'+this.id === blockIdToShow) {
			$('.fixed-income-record-detail-asset-abstract .right .value').html(stateStrings[blockIdToShow]);
			$(this).show();
		} else {
			$(this).hide();
		}
	});




	if (URIProductName) {
		$('.fixed-income-record-detail-asset-abstract .left h4').html(URIProductName);
		$('a.nav-back').each(function () {
			var href = this.href;
			if (href) {
				this.href += '?productName='+URIProductName;
			}
		});
	}
});