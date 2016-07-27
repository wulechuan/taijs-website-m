$(function () {
	var wlc = window.webLogicControls;

	var $plpm1 = $('#plpm-trading-account-register-passwords-mismatch');
	function showPoliteMessagePasswordsMismatch() {
		$plpm1.show();
		if ($plpm1.length > 0) {
			setTimeout(function () {
				$plpm1.hide();
			}, 6000);
		}
	}

	var $passwordPass1Container = $('.password-pass-1');
	var $passwordPass2Container = $('.password-pass-2');
	var passwordInput1 = $('.password-pass-1 .single-char-inputs-set .single-char-inputs-aggregator')[0];
	var passwordInput2 = $('.password-pass-2 .single-char-inputs-set .single-char-inputs-aggregator')[0];
	// var buttonConfirm = $('[button-action="submit"]')[0];

	var singleCharInputsSet1 = new wlc.UI.SingleCharacterInputsSet($('.password-pass-1 .single-char-inputs-set')[0], {
		onAllInputsValid: function (aggregatedValue, isCheckingOnLoad) {
			$passwordPass1Container.hide();
			$passwordPass2Container.show();
			setTimeout(function () {
				singleCharInputsSet2.focus();
			}, 0);
			$plpm1.hide();
		}
	});

	var singleCharInputsSet2 = new wlc.UI.SingleCharacterInputsSet($('.password-pass-2 .single-char-inputs-set')[0], {
		onAllInputsValid: function (aggregatedValue, isCheckingOnLoad) {
			if ((passwordInput1.value === passwordInput2.value) && passwordInput1.value.length) {
				// if (buttonConfirm) buttonConfirm.disabled = false;
				location.assign('account-trading-account-register-succeeded.html');
			} else {
				// if (buttonConfirm) buttonConfirm.disabled = true;
				singleCharInputsSet1.clear();
				singleCharInputsSet2.clear();
				$passwordPass1Container.show();
				$passwordPass2Container.hide();
				setTimeout(function () {
					singleCharInputsSet1.focus();
				}, 0);
				// $('.row.error-tip').show();
				showPoliteMessagePasswordsMismatch();
			}
		}
	});


});
