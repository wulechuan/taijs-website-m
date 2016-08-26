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
	var recordRoot, expansionContainer;

	for (i = 0; i < $records.length; i++) {
		recordRoot = $records[i];
		recordStatus = possibleStatuses[Math.floor(Math.random() * possibleStatusCount)];
		row = progressStopsRows[recordStatus].cloneNode(true);
		row.removeAttribute('id');
		tabular = attachments[recordStatus];
		if (tabular) {
			tabular = tabular.cloneNode(true);
			tabular.removeAttribute('id');
		}

		expansionContainer = $(recordRoot).find('.details-container')[0];
		if (!expansionContainer) continue;

		if (typeof recordRoot.elements !== 'object') recordRoot.elements = {};
		if (typeof recordRoot.status !== 'object') recordRoot.status = {};
		recordRoot.elements.abstract = $(recordRoot).find('.f-block-body.abstract')[0];
		recordRoot.elements.expansionContainer = expansionContainer;
		recordRoot.status.expansionContainerIsCollapsed = true;

		$(expansionContainer).hide();
		$(row).show();
		$(tabular).show();

		var rowContainer = $(expansionContainer).find('.f-block-body')[0];
		var tabularContainer = expansionContainer;

		rowContainer.appendChild(row);
		if (tabular) tabularContainer.appendChild(tabular);
	}

	for (i = 0; i < $records.length; i++) {
		recordRoot = $records[i];
		expansionContainer = recordRoot.elements.expansionContainer;

		var abstract = recordRoot.elements.abstract;

		$(abstract).on('click', (function (expansionContainer) {
			var $container = $(expansionContainer);
			var recordRoot = this;
			var wasCollapsed = recordRoot.status.expansionContainerIsCollapsed;

			if (wasCollapsed) {
				for (var j = 0; j < $records.length; j++) {
					var _r = $records[j];
					if (_r === recordRoot) continue;
					$(_r.elements.expansionContainer).slideUp(300);
				}

				$container.slideDown(500, function () {
					var headerH = 48;
					var margin = 20;

					var winT = window.scrollY;
					var winH = window.innerHeight;
					var H = $container.outerHeight();
					var T = $container.offset().top;
					var winTMin = Math.max(0, T + H - winH + margin);
					var winTMax = T - headerH + margin;
					var winNewT = Math.min(winTMax, Math.max(winTMin, winT));
					C.l(
						'current top:', winT,
						'\tnew top:', winNewT,
						'(', winTMin, ',', winTMax, ')',
						'\twin innerHeight:', winH,
						'\tcontainer:', T, H
					);
					if (winNewT !== winT) {
						window.scrollTo(null, winNewT);
					}
				});
			} else {
				$container.slideUp();
			}

			recordRoot.status.expansionContainerIsCollapsed = !wasCollapsed;
		}).bind(recordRoot, expansionContainer));
	}
});
