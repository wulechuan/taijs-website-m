$(function () {
	var wlc = window.webLogicControls;
	var UI = wlc.UI;

	var test = true;
	if (test) {
		var $result = $('.test-block .result');
		$('.test-block .single-char-input').on('input', function () {
			$result.html(this.value);
		});

		var charWidth = detectCorrectCharWidthForPasswordInput(
			$('.app-bg-layer')[0],
			null,
			5,
			true
		);

		updateInputElement($('input.single-char-input-password')[0], null, charWidth, 6);
		// $(document).on('resize', updateInputElement);
	}

	function updateInputElement(inputElement, widthElement, charWidth, charCount) {
		charCount = parseInt(charCount);
		if (isNaN(charCount) || charCount < 1) return;

		charWidth = parseFloat(charWidth);
		if (isNaN(charWidth) || charWidth < 2.19) return;

		if (!inputElement) return;
		if (!widthElement) widthElement = inputElement;

		// inputElement often need to be wider than desired width limitation,
		// otherwise when the caret moves to the end of the input,
		// the content of the input might be shift leftwards

		var moduleWidth = $(widthElement).outerWidth();
		var letterSpacing = (moduleWidth - charWidth * charCount) / charCount;
		var textIndent = letterSpacing / 2;

		C.l("total width:", moduleWidth, '\t charWidth:', charWidth, '\t charCount:', charCount, '\t letterSpacing:', letterSpacing, '\t indent:', textIndent);

		inputElement.style.letterSpacing = letterSpacing + 'px';
		inputElement.style.textIndent = textIndent + 'px';
	}

	function detectCorrectCharWidthForPasswordInput(parentNode, testChar, testSpansCount, shouldTrace) {
		// var parentNode = $('.app-bg-layer')[0];
		if (!parentNode) {
			C.e('Detecting failed.');
			return NaN;
		}

		if (typeof testChar !== 'string' || testChar.length < 1) {
			testChar = '\u2022';
		} else {
			testChar = testChar.charAt(0);
		}

		testSpansCount = parseInt(testSpansCount);
		if (isNaN(testSpansCount) || testSpansCount < 3) testSpansCount = 3;

		var spans = [];
		var textContent = testChar;
		var i;

		var wrapperNode = document.createElement('SPAN');

		for (i = 0; i < testSpansCount; i++) {
			var span = document.createElement('SPAN');
			span.innerHTML = textContent;
			span.className = 'single-char-input-password-tester';
			span.style.position = 'absolute';
			wrapperNode.appendChild(span);
			spans.push(span);

			textContent += testChar;
		}

		parentNode.appendChild(wrapperNode);

		var spanWidths = [];
		var charWidths = [];
		var lastSpanWidth = 0;
		for (i = 0; i < spans.length; i++) {
			spanWidths[i] = $(spans[i]).outerWidth();
			charWidths[i] = spanWidths[i] - lastSpanWidth;
			lastSpanWidth = spanWidths[i];
			if (shouldTrace) {
				C.l('width['+i+']:',charWidths[i], spanWidths[i]);
			}
		}

		var charWidthBiases = [];
		var maxBias = 0;
		for (i = 1; i < spans.length; i++) {
			charWidthBiases[i] = charWidths[i] - charWidths[i-1];
			maxBias = Math.max(charWidthBiases[i], maxBias);
		}
		if (shouldTrace) {
			C.l('maxBias:', maxBias);
		}

		var charWidth = charWidths[0];
		if (maxBias > 2) charWidth = NaN;

		parentNode.removeChild(wrapperNode);

		return charWidth;
	}


	// var $plpm1 = $('#plpm-trading-account-register-passwords-mismatch');
	// function showPoliteMessagePasswordsMismatch() {
	// 	var plpm1 = $plpm1[0];
	// 	UI.popupLayersManager.show(plpm1);
	// }

	// var $passwordPass1Container = $('.password-pass-1');
	// var $passwordPass2Container = $('.password-pass-2');
	// var passwordInput1 = $('.password-pass-1 .single-char-inputs-set .single-char-inputs-aggregator')[0];
	// var passwordInput2 = $('.password-pass-2 .single-char-inputs-set .single-char-inputs-aggregator')[0];
	// // var buttonConfirm = $('[button-action="submit"]')[0];

	// var singleCharInputsSet1 = new wlc.UI.SingleCharacterInputsSet($('.password-pass-1 .single-char-inputs-set')[0], {
	// 	onAllInputsValid: function (aggregatedValue, isCheckingOnLoad) {
	// 		$passwordPass1Container.hide();
	// 		$passwordPass2Container.show();
	// 		setTimeout(function () {
	// 			singleCharInputsSet2.focus();
	// 		}, 0);
	// 		$plpm1.hide();
	// 	}
	// });

	// var singleCharInputsSet2 = new wlc.UI.SingleCharacterInputsSet($('.password-pass-2 .single-char-inputs-set')[0], {
	// 	onAllInputsValid: function (aggregatedValue, isCheckingOnLoad) {
	// 		if ((passwordInput1.value === passwordInput2.value) && passwordInput1.value.length) {
	// 			// if (buttonConfirm) buttonConfirm.disabled = false;
	// 			location.assign('account-trading-account-register-succeeded.html');
	// 		} else {
	// 			// if (buttonConfirm) buttonConfirm.disabled = true;
	// 			singleCharInputsSet1.clear();
	// 			singleCharInputsSet2.clear();
	// 			$passwordPass1Container.show();
	// 			$passwordPass2Container.hide();
	// 			setTimeout(function () {
	// 				singleCharInputsSet1.focus();
	// 			}, 0);
	// 			// $('.row.error-tip').show();
	// 			showPoliteMessagePasswordsMismatch();
	// 		}
	// 	}
	// });
});
