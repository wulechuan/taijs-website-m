$(function () {
	var wlc = window.webLogicControls;
	var UI = wlc.UI;

	var pl1 = '#pl-input-image-vcode';
	var pl2 = '#pl-info-too-many-vcodes-today';

	var vcodeCountThresholdForImageVCode = 0;
	var vcodeCountLimit = 4;

	var usedVcodeCount = 0;
	$('[button-action="fetch-sms-vcode"]').on('click', function(event) {
		usedVcodeCount++;
		if (usedVcodeCount > vcodeCountLimit) {
			UI.popupLayersManager.show(pl2, event);
		} else if (usedVcodeCount > vcodeCountThresholdForImageVCode) {
			UI.popupLayersManager.show(pl1, event);
		}
	});


	var $coveringLayer = $('#cl-choosing-bank-name');
	var $headerButtonNavBack            = $('.page-header #header-nav-back');
	var $headerButtonHideCoveringLayer = $('.page-header #hide-covering-layer');
	var fakeInputBankName = $('.fake-input-field .fake-input')[0];

	$('.fake-input-field').on('click', function () {
		showOrHideCoveryingLayer($coveringLayer, true, $headerButtonNavBack, $headerButtonHideCoveringLayer);
	});

	$headerButtonHideCoveringLayer.on('click', function () {
		showOrHideCoveryingLayer($coveringLayer, false, $headerButtonNavBack, $headerButtonHideCoveringLayer);
	});

	$coveringLayer.find('.row').on('click', function () {
		var bankName = $(this).find('.left')[0];
		if (bankName) {
			bankName = bankName.dataset.value;
			var vf = fakeInputBankName.virtualField;
			if (vf) {
				vf.setValue(bankName);
			} else {
				// $fakeInputBankName.val(bankName).addClass('non-empty-field'); 
			}

		}

		showOrHideCoveryingLayer($coveringLayer, false, $headerButtonNavBack, $headerButtonHideCoveringLayer);
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