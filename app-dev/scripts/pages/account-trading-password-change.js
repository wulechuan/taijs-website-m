$(function () {
	var $plpm1 = $('#plpm-modification-succeeded');

	$('[button-action="submit"]').on('click', function(event) {
		console.error('fake logic triggered.');
		event.preventDefault();
		$plpm1.show();
		setTimeout(function () {
			$plpm1.hide();
		}, 3000);
	});
});