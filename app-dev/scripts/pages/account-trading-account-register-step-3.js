$(function () {
	var wlc = window.webLogicControls;

	$('.page .single-char-inputs-set').each(function () {
		new wlc.UI.SingleCharacterInputsSet(this, {
			onAllInputsValid: function (isCheckingOnLoad) {
				console.log('AWESOME! final value:', this.getValue());
				if (isCheckingOnLoad) console.log('What\'s better, we did nothing to get this!');
			}
		});
	});


	var $pL1 = $('#pl-password-input-panel-trading');

	var $thePL = $pL1;
	$('.progress-stops').on('click', function(event) {
		console.error('fake logic triggered.');
		$thePL[0].elements.$popupLayersBackPlate.show();
		$thePL.show();
	});
});