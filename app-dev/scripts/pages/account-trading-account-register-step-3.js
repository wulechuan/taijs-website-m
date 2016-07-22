$(function () {
	var wlc = window.webLogicControls;
	var $passwordPass1Container = $('.password-pass-1');
	var $passwordPass2Container = $('.password-pass-2');
	var passwordInput1 = $('.password-pass-1 .single-char-inputs-set .single-char-inputs-aggregator')[0];
	var passwordInput2 = $('.password-pass-2 .single-char-inputs-set .single-char-inputs-aggregator')[0];
	var buttonConfirm = $('[button-action="submit"]')[0];

	var singleCharInputsSet1 = new wlc.UI.SingleCharacterInputsSet($('.password-pass-1 .single-char-inputs-set')[0], {
		onAllInputsValid: function (aggregatedValue, isCheckingOnLoad) {
			$passwordPass1Container.hide();
			$passwordPass2Container.show();
			setTimeout(function () {
				singleCharInputsSet2.focus();
			}, 0);
		}
	});

	var singleCharInputsSet2 = new wlc.UI.SingleCharacterInputsSet($('.password-pass-2 .single-char-inputs-set')[0], {
		onAllInputsValid: function (aggregatedValue, isCheckingOnLoad) {
			if ((passwordInput1.value === passwordInput2.value) && passwordInput1.value.length) {
				if (buttonConfirm) buttonConfirm.disabled = false;
			} else {
				if (buttonConfirm) buttonConfirm.disabled = true;
				singleCharInputsSet1.clear();
				singleCharInputsSet2.clear();
				$passwordPass1Container.show();
				$passwordPass2Container.hide();
				setTimeout(function () {
					singleCharInputsSet1.focus();
				}, 0);
				$('.row.error-tip').show();
			}
		}
	});


});

$(function () { // fake logics
	var wlc = window.webLogicControls;
	var $pL1 = $('#pl-password-input-panel-trading');

	new wlc.UI.SingleCharacterInputsSet($pL1.find('.single-char-inputs-set')[0], {
		onAllInputsValid: function (aggregatedValue, status, isCheckingOnLoad) {
			console.log('AWESOME! final value:', aggregatedValue);
			if (isCheckingOnLoad) console.log('What\'s better, we did nothing to get this!');
		}
	});

	var $thePL = $pL1;
	$('.progress-stops').on('click', function(event) {
		console.error('fake logic triggered.');
		var $bp = $thePL[0].elements.$popupLayersBackPlate;
		$bp.show();
		$thePL.show();
		$thePL.add($bp).on('click', function (event) {
			if (event.target === $thePL[0]) {
				$bp.hide();
				$thePL.hide();
			}
		});
	});
});