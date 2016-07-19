$(function () {
	var $pL1 = $('#pl-password-input-panel-trading');

	var $thePL = $pL1;
	$('.progress-stops').on('click', function(event) {
		console.error('fake logic triggered.');
		$thePL[0].elements.$popupLayersBackPlate.show();
		$thePL.show();
	});
});