$(function () {
	$('[button-action="sign-in"]').on('click', function(event) {
		console.log('sign-in');
	});

	$('[button-action="sign-up"]').on('click', function(event) {
		console.log('sign-up');
	});


	var pl1 = $('#pl-info-too-many-vcodes-today')[0];
	var pl2 = $('#pl-input-image-vcode')[0];

	$('[button-action="fetch-sms-vcode"]').on('click', function(event) {
		console.error('fake logic triggered.');
		window.popupLayersManager.show(pl1, event);
	});
});