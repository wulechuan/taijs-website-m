$(function () { // fake logics
	var wlc = window.webLogicControls;
	var UI = wlc.UI;

	var amountInputHintString = '最低起投额1000.00元';

	var amountInput = $('input[name="amount"]')[0];
	var amountInputPlaceholderPrefix;

	if (amountInput) {
		amountInputPlaceholderPrefix = amountInput.getAttribute('data-placeholder-prefix') || '';
		updateAmountInputPlaceholder(amountInputHintString);

		var amountInputHint = $('.amount-input-hint')[0];

		if (amountInputHint) {
			updateAmountInputHint(true);

			$(amountInput).on('focus', function () {
				updateAmountInputHint();
			});

			$(amountInput).on('blur', function () {
				updateAmountInputHint(true);
			});
		}
	}

	function updateAmountInputPlaceholder(hint) {
		amountInput.placeholder = amountInputPlaceholderPrefix + hint;
	}
	function updateAmountInputHint(isBlur) {
		var isEmpty = !amountInput.value;
		amountInputHint.innerHTML = (!!isBlur && isEmpty) ? '' : ('，'+amountInputHintString);
	}




	var $pl1 = $('#pl-password-input-panel-trading');
	var $pl2 = $('#pl-choose-bank-card');



	new wlc.UI.SingleCharacterInputsSet($pl1.find('.single-char-inputs-set')[0], {
		onAllInputsValid: function (aggregatedValue, status, isCheckingOnLoad) {
			UI.popupLayersManager.show('plpm-trading-password-verified');
			setTimeout(function () {
				location.assign('newbie-buying-succeeded.html');
			}, 1500);
		}
	});




	var pl1 = $pl1[0];

	$('[button-action="submit"]').on('click', function(event) {
		if (event && typeof event.preventDefault === 'function') event.preventDefault();
		UI.popupLayersManager.show(pl1, event);
	});

	$pl1.on('click', function (event) {
		var el = event.target;
		if (el === pl1 || $(el).hasClass('button-x')) {
			UI.popupLayersManager.hide(pl1);
		}
	});


	var pl2 = $pl2[0];

	var $chosenValuePresentor = $('#newbie-buying-confirm-choose-bank-card');
	$('.popup-panel-body .menu-item').on('click', function () {
		$chosenValuePresentor.html(this.innerHTML);
		UI.popupLayersManager.hide(pl2);
	});

	$('#newbie-buying-confirm-choose-bank-card').on('click', function(event) {
		UI.popupLayersManager.show(pl2, event);
	});

	$pl2.on('click', function (event) {
		var el = event.target;
		if (el === pl2 || $(el).hasClass('nav-back')) {
			UI.popupLayersManager.hide(pl2);
		}
	});
});