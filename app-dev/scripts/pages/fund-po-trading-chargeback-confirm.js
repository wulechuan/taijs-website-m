$(function () { // fake logics
	var wlc = window.webLogicControls;
	var UI = wlc.UI;


	var $pl1 = $('#pl-password-input-panel-trading');
	var pl1 = $pl1[0];


	var FCCI = new UI.FixedCharsCountInput($pl1.find('.fixed-count-chars-input-block')[0], {
		onValid: function () {
			this.disable();
			UI.popupLayersManager.show('plpm-trading-password-verified');
			setTimeout(function () {
				location.assign('fund-chargeback-succeeded.html');
			}, 1500);
		}
	});


	$('#footer-button-call-to-action').on('click', function(event) {
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
});