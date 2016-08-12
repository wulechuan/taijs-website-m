$(function () {
	var wlc = window.webLogicControls;
	var UI = wlc.UI;


	// var buttonConfirm = $('[button-action="submit"]')[0];
	var $passwordPane1 = $('.password-pass-1');
	var $passwordPane2 = $('.password-pass-2');

	var FCCI1 = new UI.FixedCharsCountInput($('.password-pass-1 .fixed-count-chars-input-block')[0], {
		onValid: function () {
			// switchToPane(2);
		}
	});

	var FCCI2 = new UI.FixedCharsCountInput($('.password-pass-2 .fixed-count-chars-input-block')[0], {
		onValid: function () {
			onBothPasswordsFilled();
		}
	});

	switchToPane(1);




	function switchToPane(index) {
		var $paneToShow = (index===1) ? $passwordPane1 : $passwordPane2;
		var $paneToHide = (index===1) ? $passwordPane2 : $passwordPane1;
		var FCCIToFocus = (index===1) ? FCCI1 : FCCI2;

		if (index===1) {
			FCCI1.clear();
			FCCI2.clear();
		} else {
			showOrHideMismatchMessage(false);
		}

		$paneToShow.show();
		$paneToHide.hide();

		setTimeout(function () {
			FCCIToFocus.focus();
		}, 0);
	}

	function onBothPasswordsFilled() {
		if ((FCCI1.getValue() === FCCI2.getValue()) && FCCI1.getValue().length > 0) {
			// if (buttonConfirm) buttonConfirm.disabled = false;
			location.assign('account-trading-account-register-succeeded.html');
		} else {
			// if (buttonConfirm) buttonConfirm.disabled = true;
			showOrHideMismatchMessage(true);
			switchToPane(1);
		}
	}

	function showOrHideMismatchMessage(isToShow) {
		var plpm1 = '#plpm-trading-account-register-passwords-mismatch';
		if (isToShow) {
			// $('.row.error-tip').show();
			UI.popupLayersManager.show(plpm1);
		} else {
			// $('.row.error-tip').hide();
			UI.popupLayersManager.hide(plpm1);
		}
	}
});
