$(function () { // fake logics
	var wlc = window.webLogicControls;


	var $pl1 = $('#pl-password-input-panel-trading');
	var $pl2 = $('#pl-choose-bank-card');



	new wlc.UI.SingleCharacterInputsSet($pl1.find('.single-char-inputs-set')[0], {
		onAllInputsValid: function (aggregatedValue, status, isCheckingOnLoad) {
			console.log('AWESOME! final value:', aggregatedValue);
			if (isCheckingOnLoad) console.log('What\'s better, we did nothing to get this!');
			location.assign('newbie-buying-succeeded.html');
		}
	});



	$('[button-action="buy"]').on('click', function(event) {
		var pl1 = $pl1[0];
		window.popupLayersManager.show(pl1, event);

		$pl1.on('click', function (event) {
			var el = event.target;
			if (el === pl1 || $(el).hasClass('button-x')) {
				window.popupLayersManager.hide(pl1);
			}
		});
	});



	var pl2 = $pl2[0];

	var $chosenValuePresentor = $('#newbie-buying-confirm-choose-bank-card');
	$('.popup-panel-body .menu-item').on('click', function () {
		$chosenValuePresentor.html(this.innerHTML);
		window.popupLayersManager.hide(pl2);
	});


	$('#newbie-buying-confirm-choose-bank-card').on('click', function(event) {
		console.error('fake logic triggered.');
		window.popupLayersManager.show(pl2, event);

		$pl2.on('click', function (event) {
			var el = event.target;
			if (el === pl2 || $(el).hasClass('nav-back')) {
				window.popupLayersManager.hide(pl2);
			}
		});
	});
});