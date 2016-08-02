$(function () {
	var plpm1 = $('#plpm-modification-succeeded')[0];

	$('[button-action="submit"]').on('click', function(event) {
		console.error('fake logic triggered.');
		event.preventDefault();
		window.popupLayersManager.show(plpm1, event);
	});
});