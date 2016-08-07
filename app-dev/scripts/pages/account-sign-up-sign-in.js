$(function () {
	var wlc = window.webLogicControls;
	var UI = wlc.UI;

	$('[button-action="sign-in"]').on('click', function(event) {
		console.log('sign-in');
	});

	$('[button-action="sign-up"]').on('click', function(event) {
		console.log('sign-up');
	});


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
});