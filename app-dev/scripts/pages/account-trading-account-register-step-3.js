$(function () {
	var wlc = window.webLogicControls;

	$('.single-char-inputs-set').each(function () {
		new wlc.UI.SingleCharacterInputsSet(this, {
			onAllInputsValid: function (aggregatedValue, isCheckingOnLoad) {
				console.log('AWESOME! final value:', aggregatedValue);
				if (isCheckingOnLoad) console.log('What\'s better, we did nothing to get this!');
			}
		});
	});


	var $pL1 = $('#pl-password-input-panel-trading');

	var $thePL = $pL1;
	$('.progress-stops').on('click', function(event) {
		console.error('fake logic triggered.');
		var $bp = $thePL[0].elements.$popupLayersBackPlate;
		$bp.show();
		$thePL.show();
		$thePL.add($bp).on('click', function (event) {
			if (event.target === $thePL[0]) {
				$bp.hide();
				$thePL.hide();
			}
		});
	});
});