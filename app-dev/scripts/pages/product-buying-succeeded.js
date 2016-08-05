$(function () { // fake logics
	var wlc = window.webLogicControls;


	$('.icon-check-mark-circled-s60-stroke4').on('click', function (event) {
		window.popupLayersManager.show('pl-message-income-received', event);
	});
});