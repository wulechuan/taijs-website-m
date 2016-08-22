$(function () {
	var app = window.taijs.app;
	var URIP = app.data.URIParameters;
	// C.l(URIP);

	// var wlc = window.webLogicControls;
	// var UI = wlc.UI;

	var URIProductCaption = URIP.productCaption;
	if (typeof URIProductCaption === 'string') {
		URIProductCaption = URIProductCaption.replace(/^\s*['"]\s*/, '').replace(/\s*['"]\s*$/, '');
	}

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
		'#assest-progress-mai-chu-yi-che-dan'
	];

	var blockIdToShow = progressStopsBlocksId[Math.floor(Math.random() * progressStopsBlocksId.length)];

	$(progressStopsBlocksId.join()).each(function () {
		// index is NOT reliable, in case some dom is missing, or the id incorrect
		if ('#'+this.id === blockIdToShow) {
			var $abstractBlock = $('.fund-record-detail-asset-abstract');

			$abstractBlock.find('.left .value.product-caption').text(URIProductCaption);
			$abstractBlock.find('.left .value.product-id'     ).text(URIP.productId);
			$abstractBlock.find('.right .value.trading-type'  ).text(URIP.action);

			$(this).show();
			$('#'+this.id+'-attachment').show();
		} else {
			$(this).hide();
			$('#'+this.id+'-attachment').hide();
		}
	});
});