$(function () {
	var app = window.taijs.app;
	var URIP = app.data.URIParameters;
	C.l(URIP);

	// var wlc = window.webLogicControls;
	// var UI = wlc.UI;

	var URIProductCaption = URIP.productCaption;
	if (typeof URIProductCaption === 'string') {
		URIProductCaption = URIProductCaption.replace(/^\s*['"]\s*/, '').replace(/\s*['"]\s*$/, '');
	}
	var URITradingStatus = URIP.tradingStatus;

	var progressStopsBlocksId = [
		'#assest-progress-mai-ru-shen-qing-yi-shou-li',
		'#assest-progress-mai-ru-kou-kuan-shi-bai',
		'#assest-progress-mai-ru-kou-kuan-cheng-gong',
		'#assest-progress-mai-ru-que-ren-cheng-gong',
		'#assest-progress-mai-ru-que-ren-shi-bai',
		'#assest-progress-mai-ru-yi-che-dan',
		'#assest-progress-mai-chu-shen-qing-cheng-gong',
		'#assest-progress-mai-chu-que-ren-cheng-gong',
		'#assest-progress-mai-chu-que-ren-shi-bai',
		'#assest-progress-mai-chu-yi-che-dan',
		'#'
	];

	// var stateStrings = {
	// 	'#assest-progress-mai-ru-shen-qing-yi-shou-li': '买入申请已受理',
	// 	'#assest-progress-mai-ru-kou-kuan-shi-bai': '买入扣款失败',
	// 	'#assest-progress-mai-ru-kou-kuan-cheng-gong': '买入扣款成功',
	// 	'#assest-progress-mai-ru-que-ren-cheng-gong': '买入确认成功',
	// 	'#assest-progress-mai-ru-que-ren-shi-bai': '买入确认失败',
	// 	'#assest-progress-mai-ru-yi-che-dan': '买入已撤单',
	// 	'#assest-progress-mai-chu-shen-qing-cheng-gong': '卖出申请成功',
	// 	'#assest-progress-mai-chu-que-ren-cheng-gong': '卖出确认成功',
	// 	'#assest-progress-mai-chu-que-ren-shi-bai': '卖出确认失败',
	// 	'#assest-progress-mai-chu-yi-che-dan': '卖出已撤单',
	// };

	var progressStopsBlocksIdString = progressStopsBlocksId.join();

	var blockIdToShow;
	if (URITradingStatus) blockIdToShow = '#assest-progress-'+URITradingStatus;

	var matched = progressStopsBlocksIdString.match(new RegExp(blockIdToShow+','), 'i');
	if (!matched) {
		blockIdToShow = progressStopsBlocksId[0];
	}


	progressStopsBlocksIdString = progressStopsBlocksIdString.slice(0, -2);
	$(progressStopsBlocksIdString).each(function () {
		// index is NOT reliable, in case some dom is missing, or the id incorrect
		if ('#'+this.id === blockIdToShow) {
			var $abstractBlock = $('.record-detail-asset-abstract');

			$abstractBlock.find('.left .value.product-caption').text(URIProductCaption);
			$abstractBlock.find('.left .value.product-id'     ).text(URIP.productId);
			$abstractBlock.find('.right .value.trading-type').text(URIP.action);

			$(this).show();
		} else {
			$(this).hide();
		}
	});
});