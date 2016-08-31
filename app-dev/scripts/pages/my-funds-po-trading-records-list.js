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
	var recordRoot, expansionContainer, recordStatusCaption;

	for (i = 0; i < $records.length; i++) {
		recordRoot = $records[i];
		recordStatus = possibleStatuses[Math.floor(Math.random() * possibleStatusCount)];
		recordStatusCaption = recordStatus.replace(/^(买入|卖出)/g, '');
		// C.l(recordStatus, recordStatusCaption);

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

		$(abstract).on('click', toggleRecordExpasion.bind(recordRoot, recordRoot, expansionContainer));
	}


	function toggleRecordExpasion(recordRoot, expansionContainer) {
		var $container = $(expansionContainer);
		var wasCollapsed = recordRoot.status.expansionContainerIsCollapsed;

		if (wasCollapsed) {
			for (var j = 0; j < $records.length; j++) {
				var _r = $records[j];
				if (_r === recordRoot) continue;
				$(_r.elements.expansionContainer).slideUp(300);
				_r.status.expansionContainerIsCollapsed = true;
			}

			$container.slideDown(500, function () {
				var headerH = 48;
				var marginTopAfterExpansion = 27;
				var marginBottomAfterExpansion = 27;

				var winT = window.scrollY;
				var winH = window.innerHeight;
				var H = $(recordRoot).outerHeight();
				var T = $(recordRoot).offset().top;
				var winTMin = Math.max(0, T + H - winH + marginBottomAfterExpansion);
				var winTMax = Math.max(0, T - headerH - marginTopAfterExpansion);
				var winNewT = Math.min(winTMax, Math.max(winTMin, winT));
				// C.l(
				// 	'current top:', winT,
				// 	'\n\tnew top:', winNewT,
				// 	'\tbetween (', winTMin, ',', winTMax, ')',
				// 	'\n\twin innerHeight:', winH,
				// 	'\tblock top:', T,
				// 	'\tblock total height:', H,
				// 	'\tdifference:', T + H - winH
				// );
				if (winNewT !== winT) {
					window.scrollTo(null, winNewT);
				}
			});
		} else {
			$container.slideUp();
		}

		recordRoot.status.expansionContainerIsCollapsed = !wasCollapsed;
	}



	var $coveringLayer = $('#cl-funds-trading-records-filters');
	var $headerButtonNavBack           = $('.page-header #header-nav-back');
	var $headerButtonHideCoveringLayer = $('.page-header #hide-covering-layer');
	var $headerButtonShowCoveringLayer = $('.page-header #show-covering-layer');

	$headerButtonShowCoveringLayer.on('click', function () {
		showOrHideCoveryingLayer($coveringLayer, true,
			$headerButtonNavBack.add($headerButtonShowCoveringLayer),
			$headerButtonHideCoveringLayer
		);
	});

	$headerButtonHideCoveringLayer.on('click', function () {
		showOrHideCoveryingLayer($coveringLayer, false, 
			$headerButtonNavBack.add($headerButtonShowCoveringLayer),
			$headerButtonHideCoveringLayer
		);
	});

	function showOrHideCoveryingLayer($cl, isToShow, $buttonToShowWithoutCl, $buttonToShowWithCl) {
		if (!!isToShow) {
			$cl.show();
			$buttonToShowWithCl.show();
			$buttonToShowWithoutCl.hide();
		} else {
			$cl.hide();
			$buttonToShowWithCl.hide();
			$buttonToShowWithoutCl.show();
		}
	}
});
