$(function () { // fake logics
	var wlc = window.webLogicControls;
	var UI = wlc.UI;


	var $pl1 = $('#pl-password-input-panel-trading');
	var $pl2 = $('#pl-choose-bank-card');



	var FCCI = new UI.FixedCharsCountInput($pl1.find('.fixed-count-chars-input-block')[0], {
		onValid: function () {
			this.disable();
			UI.popupLayersManager.show('plpm-trading-password-verified');
			setTimeout(function () {
				location.assign('fund-buying-succeeded.html');
			}, 1500);
		}
	});




	var pl1 = $pl1[0];

	$('[button-action="submit"]').on('click', function(event) {
		if (event && typeof event.preventDefault === 'function') event.preventDefault();
		FCCI.clear();
		FCCI.enable();
		UI.popupLayersManager.show(pl1, event, {
			shouldNotAutoFocusAnything: true
		});
		FCCI.focus();
	});

	$pl1.on('click', function (event) {
		var el = event.target;
		if (el === pl1 || $(el).hasClass('button-x')) {
			UI.popupLayersManager.hide(pl1);
		}
	});


	var pl2 = $pl2[0];

	var $chosenValuePresentor = $('#fund-po-trading-sale-confirm-choose-bank-card');
	$('.popup-panel-body .menu-item').on('click', function () {
		$chosenValuePresentor.html(this.innerHTML);
		UI.popupLayersManager.hide(pl2);
	});

	$('#fund-po-trading-sale-confirm-choose-bank-card').on('click', function(event) {
		UI.popupLayersManager.show(pl2, event);
	});

	$pl2.on('click', function (event) {
		var el = event.target;
		if (el === pl2 || $(el).hasClass('nav-back')) {
			UI.popupLayersManager.hide(pl2);
		}
	});
});