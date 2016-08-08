$(function () {
	var app = window.taijs.app;
	var URIP = app.data.URIParameters;
	C.l(URIP);

	// var wlc = window.webLogicControls;
	// var UI = wlc.UI;

	var URIProductCaption = URIP.productCaption;
	if (typeof URIProductCaption === 'string') {
		URIProductCaption = URIProductCaption.replace(/^\s*['"']\s*/, '').replace(/\s*['"']\s*$/, '');
	}
	var URITradingStatus = URIP.tradingStatus;
	var URITradingStatusMsg = URIP.tradingStatusMsg;
	// C.l(URIProductCaption, URITradingStatus);

	var progressStopsBlocksId = [
		'#assest-progress-dai-que-ren',
		'#assest-progress-que-ren-shi-bai',
		'#assest-progress-que-ren-cheng-gong',
		'#assest-progress-ji-xi-zhong',
		'#assest-progress-hui-kuang-zhong',
		'#assest-progress-yi-chong-di',
		'#assest-progress-yi-tui-kuan',
		'#assest-progress-yi-dui-fu',
		'#'
	];

	var stateStrings = {
		'#assest-progress-dai-que-ren': '待确认',
		'#assest-progress-que-ren-shi-bai': '确认失败',
		'#assest-progress-que-ren-cheng-gong': '确认成功',
		'#assest-progress-ji-xi-zhong': '计息中',
		'#assest-progress-hui-kuang-zhong': '回款中',
		'#assest-progress-yi-chong-di': '已冲抵',
		'#assest-progress-yi-tui-kuan': '已退款',
		'#assest-progress-yi-dui-fu': '已兑付',
	};

	var progressStopsBlocksIdString = progressStopsBlocksId.join();

	var blockIdToShow;
	if (URITradingStatus) blockIdToShow = '#assest-progress-'+URITradingStatus;

	var matched = progressStopsBlocksIdString.match(new RegExp(blockIdToShow+','), 'i');
	if (!matched) {
		blockIdToShow = progressStopsBlocksId[0];
	}

	C.l(URITradingStatusMsg);
	if (blockIdToShow === '#assest-progress-ji-xi-zhong' && URITradingStatusMsg) {
		stateStrings[blockIdToShow] = URITradingStatusMsg;
	}

	progressStopsBlocksIdString = progressStopsBlocksIdString.slice(0, -2);
	$(progressStopsBlocksIdString).each(function () {
		// index is NOT reliable, in case some dom is missing, or the id incorrect
		if ('#'+this.id === blockIdToShow) {
			$('.record-detail-asset-abstract .right .value').html(stateStrings[blockIdToShow]);
			$(this).show();
		} else {
			$(this).hide();
		}
	});




	if (URIProductCaption) {
		$('.record-detail-asset-abstract .left h4').html(URIProductCaption);
		$('a.nav-back').each(function () {
			var href = this.href;
			if (href) {
				this.href += '?productCaption='+URIProductCaption;
			}
		});
	}
});