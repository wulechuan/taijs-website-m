$(function () { // fake logics
	var wlc = window.webLogicControls;


	var $pl1 = $('#pl-password-input-panel-trading');
	var $pl2 = $('#pl-choose-bank-card');


	window.popupLayersManager.show('pl-available-tickets-list', event);

	$('.choose-tickets').on('click', function (event) {
		window.popupLayersManager.show('pl-available-tickets-list', event);
	});


	new wlc.UI.SingleCharacterInputsSet($pl1.find('.single-char-inputs-set')[0], {
		onAllInputsValid: function (aggregatedValue, status, isCheckingOnLoad) {
			console.log('AWESOME! final value:', aggregatedValue);
			if (isCheckingOnLoad) console.log('What\'s better, we did nothing to get this!');
		}
	});



	$('[button-action="buy"]').on('click', function(event) {
		console.error('fake logic triggered.');
		var pl1 = $pl1[0];
		window.popupLayersManager.show(pl1, event);

		$pl1.on('click', function (event) {
			var el = event.target;
			if (el === pl1 || $(el).hasClass('button-x')) {
				window.popupLayersManager.hide(pl1);
			}
		});
	});



	$('#newbie-buying-confirm-choose-bank-card').on('click', function(event) {
		console.error('fake logic triggered.');
		var pl2 = $pl2[0];
		window.popupLayersManager.show(pl2, event);

		$pl2.on('click', function (event) {
			var el = event.target;
			if (el === pl2 || $(el).hasClass('nav-back')) {
				window.popupLayersManager.hide(pl2);
			}
		});
	});
});