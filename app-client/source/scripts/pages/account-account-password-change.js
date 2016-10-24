$(function () {
	var wlc = window.webLogicControls;
	var UI = wlc.UI;

	var plpm1 = '#plpm-modification-succeeded';

	$('[button-action="submit"]').on('click', function(event) {
		event.preventDefault();
		UI.popupLayersManager.show(plpm1, event);
	});
});