$(function () { // fake logics
	var wlc = window.webLogicControls;


	var $pL1 = $('#pl-password-input-panel-trading');

	new wlc.UI.SingleCharacterInputsSet($pL1.find('.single-char-inputs-set')[0], {
		onAllInputsValid: function (aggregatedValue, status, isCheckingOnLoad) {
			console.log('AWESOME! final value:', aggregatedValue);
			if (isCheckingOnLoad) console.log('What\'s better, we did nothing to get this!');
		}
	});

	var $thePL = $pL1;
	$('[button-action="buy"]').on('click', function() {
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