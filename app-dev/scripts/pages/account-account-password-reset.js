$(function () {
	var $pL1 = $('#pl-info-too-many-vcodes-today');
	var $pL2 = $('#pl-input-image-vcode');

	var $thePL = $pL1;
	$('[button-action="fetch-sms-vcode"]').on('click', function(event) {
		console.error('fake logic triggered.');
		$thePL[0].elements.$popupLayersBackPlate.show();
		$thePL.show();
	});
});