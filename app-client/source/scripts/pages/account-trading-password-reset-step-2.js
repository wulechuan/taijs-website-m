$(function () {
	var wlc = window.webLogicControls;
	var UI = wlc.UI;

	$('[button-action="submit"]').on('click', function(event) {
		event.preventDefault();
		UI.popupLayersManager.show('plpm-modification-succeeded', event);
	});
});