$(function () {
	$('.entity-type-po-history').each(function () {
		var $record = $(this);
		var $h4s = $record.find('h4');
		var productName = $($h4s[0]).text();
		var productId = $($h4s[1]).text().replace(/[\(\)]/g, '');
		var amount = $($record.find('.content .value')[0]).text();//.replace(/[\+\-\,]/g, '');

		var urlParametersString = '?'+[
			'productName='+productName,
			'productId='+productId,
			'amount='+amount,
			'action=买入'
		].join('&');

		var urlForInspection = 'my-fund-trading-record-detail.html'+urlParametersString;
		var urlForBuying = 'fund-buying-confirm.html'+urlParametersString;
		// C.l(urlForBuying);

		var anchorForInspection = this.parentNode;
		anchorForInspection.href = urlForInspection;

		var $buttonBuyMore = $record.find('button[button-action="call-to-action"]');
		$buttonBuyMore.on('click', function (event) {
			event.preventDefault();
			event.stopPropagation();
			window.location.assign(urlForBuying);
		});
	});
});