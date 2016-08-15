$(function () { // fake logics
	var wlc = window.webLogicControls;
	var UI = wlc.UI;


	var $pl1 = $('#pl-password-input-panel-trading');
	var $pl2 = $('#pl-choose-bank-card');


	$('[button-action="buy"]').on('click', function(event) {
		console.error('fake logic triggered.');
		var pl1 = $pl1[0];
		UI.popupLayersManager.show(pl1, event);

		$pl1.on('click', function (event) {
			var el = event.target;
			if (el === pl1 || $(el).hasClass('button-x')) {
				UI.popupLayersManager.hide(pl1);
			}
		});
	});



	var pl2 = $pl2[0];

	var $chosenValuePresentor = $('#fixed-income-buying-confirm-choose-bank-card');
	$('.popup-panel-body .menu-item').on('click', function () {
		$chosenValuePresentor.html(this.innerHTML);
		UI.popupLayersManager.hide(pl2);
	});


	$('#fixed-income-buying-confirm-choose-bank-card').on('click', function(event) {
		console.error('fake logic triggered.');
		UI.popupLayersManager.show(pl2, event);

		$pl2.on('click', function (event) {
			var el = event.target;
			if (el === pl2 || $(el).hasClass('nav-back')) {
				UI.popupLayersManager.hide(pl2);
			}
		});
	});
});