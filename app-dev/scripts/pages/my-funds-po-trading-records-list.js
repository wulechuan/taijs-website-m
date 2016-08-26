$(function () {
	var $templates = $('#tplt-asset-progress-blocks');

	var $progressStopsRows = $templates.find('.row[id]');
	var $attachments = $templates.find('.tabular');

	var progressStopsRows = {};
	var attachments = {};
	var possibleStatuses = [];


	var i, row, tabular, recordStatus;
	for (i = 0; i < $progressStopsRows.length; i++) {
		row = $progressStopsRows[i];
		recordStatus = row.dataset.status;
		if (progressStopsRows[recordStatus]) {
			C.w('duplicated recordStatus "'+recordStatus+'"');
		} else {
			possibleStatuses.push(recordStatus);
		}
		progressStopsRows[recordStatus] = row;
	}

	for (i = 0; i < $attachments.length; i++) {
		tabular = $attachments[i];
		recordStatus = tabular.dataset.status;
		if (attachments[recordStatus]) {
			C.w('duplicated recordStatus "'+recordStatus+'"');
		}
		attachments[recordStatus] = tabular;
	}

	// C.l(progressStopsRows);
	// C.l(attachments);


	var $records = $('.fund-trading-record');
	var possibleStatusCount = possibleStatuses.length;
	for (i = 0; i < $records.length; i++) {
		var recordRoot = $records[i];
		recordStatus = possibleStatuses[Math.floor(Math.random() * possibleStatusCount)];
		row = progressStopsRows[recordStatus].cloneNode(true);
		row.removeAttribute('id');
		tabular = attachments[recordStatus];
		if (tabular) {
			tabular = tabular.cloneNode(true);
			tabular.removeAttribute('id');
		}

		var container = $(recordRoot.parentNode).find('.details-container')[0];
		if (!container) continue;

		$(container).hide();
		$(row).show();
		$(tabular).show();

		var rowContainer = $(container).find('.f-block-body')[0];
		var tabularContainer = container;

		rowContainer.appendChild(row);
		if (tabular) tabularContainer.appendChild(tabular);

		$(recordRoot).on('click', (function () {
			var $container = $(this);
			C.l($container);
			$container.slideToggle(function () {
				C.l($container.outerHeight(), $container.offset());
			});
		}).bind(container));

		// var innerHTML = row.innerHTML;
		// if (tabular) innerHTML += container.innerHTML;
		// container.innerHTML = innerHTML;
	}
});
