$(function () {
	var wlc = window.webLogicControls;
	var UI = wlc.UI;


	var FixedCountCharsInput = function (rootElement, initOptions) {
		// '\u25fc' 实心圆圈
		// '\u2022' 加重号

		rootElement = wlc.DOM.validateRootElement(rootElement, this);

		var inputElement;
		var decoGrids = [];

		this.config = function (options) {
			config.call(this, options);
		};
		this.getValue = function () {
			return inputElement.value;
		};
		this.setValue = function (newValue) {
			inputElement.value = newValue;
		};
		this.clear = function () {
			inputElement.value = '';
			WCU.invoke(status, 'onClear');
		};
		this.enable = function() {
			inputElement.disabled = false;
			WCU.invoke(status, 'onEnable');
		};
		this.disable = function() {
			inputElement.disabled = true;
			WCU.invoke(status, 'onDisable');
		};
		this.focus = function() {
			inputElement.focus();
		};
		this.blur = function() {
			inputElement.blur();
		};


		var status = {
			charsCount: NaN,
			isDisabled: false,
			isPassword: false,

			onInput: [],
			onClear: [],
			onFill: [], // on full length filled
			onValid: [],
			onInvalid: [],
			onEnable: [],
			onDisable: []
		};

		function inputOnInput(event, inputWasValid) {
			// console.log('inputOnInput');

			var value = inputElement.value;
			var inputIsFilled = false;
			if (inputElement.value.length < 1) {
				WCU.invoke(status, 'onClear');
			}

			if (status.charsCount && value.length >= status.charsCount) {
				inputIsFilled = true;
				if (value.length > status.charsCount) {
					inputElement.value = value.slice(0, charsCount);
				}
			}


			if (inputIsFilled) {
				WCU.invoke(status, 'onFill');
			}


			var inputIsValid = inputIsFilled && virtualField.validate();

			if (!inputWasValid && inputIsValid) {
				WCU.invoke(status, 'onValid');
			}

			if (inputWasValid && !inputIsValid) {
				WCU.invoke(status, 'onInvalid');
			}
		}

		function config(options) {
			options = options || {};
			if (typeof options.onInput   === 'function') status.onInput  .push(options.onInput);
			if (typeof options.onClear   === 'function') status.onClear  .push(options.onClear);
			if (typeof options.onFill    === 'function') status.onFill   .push(options.onFill);
			if (typeof options.onValid   === 'function') status.onValid  .push(options.onValid);
			if (typeof options.onInvalid === 'function') status.onInvalid.push(options.onInvalid);
			if (typeof options.onEnable  === 'function') status.onEnable .push(options.onEnable);
			if (typeof options.onDisable === 'function') status.onDisable.push(options.onDisable);
		}

		function init () {
			status.isInitializing = true;

			if (!rootElement) return false;


			inputElement = $(rootElement).find('input.fixed-count-chars-input').filter(function (index, input) {
				var type = input.type.toLowerCase();
				return type !== 'checkbox' && type !== 'radio';
			});

			inputElement = $(rootElement).find('input.fixed-count-chars-input').filter(function (index, input) {
				var type = input.type.toLowerCase();
				return type !== 'checkbox' && type !== 'radio';
			});

			if (inputElement.length < 1) {
				C.e('Too few input fields for constructing a '+this.constructor.name+'.');
				return false;
			}


			var thisController = this;
			var $_r = $(rootElement);

			status.inputsTypeIsNumber   = $_r.hasClass('input-only-digits');
			status.isPassword = $_r.hasClass('input-password');

			var inputForAggregation = $_r.find('input.single-char-inputs-aggregator')[0];
			if (inputForAggregation) this.config({
				inputForAggregation: inputForAggregation // might be overrided by initOptions
			});

			this.config(initOptions);

			inputElement.each(function (index) {
				this.autocomplete = 'off';
				this.dataset.inputIndex = index;
				if (status.isPassword) {
					this.type = 'password';
				}
				status.inputValue[index] = this.value;
				status.allInputsFilling[index] = this.value.length > 0;
				validateOneInput.call(thisController, this);
			});

			aggregateAllInputsStatus.call(this, true);
			dispatchEventsThatObservingAllInputs.call(this, true);

			// make sure basic setup executed BEFORE binding event listeners
			inputElement
				.on('focus',    inputOnFocus   .bind(thisController))
				.on('blur',     inputOnBlur    .bind(thisController))
				.on('keydown',  inputOnKeyDown .bind(thisController))
				.on('input',    inputOnInput   .bind(thisController))
				.on('keyup',    inputOnKeyUp   .bind(thisController))
			;

			this.enable();

			delete status.isInitializing;
		}

		init.call(this);
		if (status.isInitializing) {
			C.e('Fail to construct <'+this.constructor.name+'>.');
			WCU.objectToolkit.destroyInstanceObject(this);
			return;
		}
	};


	var test = true;
	if (test) {
		var $result = $('.test-block .result');
		$('.test-block .single-char-input').on('input', function () {
			$result.html(this.value);
		});

		detectCorrectCharWidthForPasswordInput(
			document.body || $('.app-bg-layer')[0],
			null,
			5,
			onResultEvaluated,
			true
		);

		var grids = $('.fixed-count-chars-input-block .deco-grid');
		var $grids = [];
		for (var i = 0; i < grids.length; i++) {
			$grids[i] = $(grids[i]);
		}

		var inputElement = $('input.fixed-count-chars-input')[0];
		if (inputElement && typeof inputElement.value === 'string') {
			updateDecoGrids(inputElement.value.length);
		}

		$(inputElement).on('input', function () {
			updateDecoGrids(this.value.length);
		});
	}

	function updateDecoGrids(shownCount) {
		var charCount = Math.min(grids.length, shownCount);

		for (var i = 0; i < grids.length; i++) {
			if (i < charCount) {
				$grids[i].addClass('filled');
			} else {
				$grids[i].removeClass('filled');
			}
		}
	}

	function onResultEvaluated(charWidth) {
		updateInputElement(
			$('.fixed-count-chars-input-block')[0],
			charWidth,
			6
		);
	}

	function updateInputElement(rootElement, charWidth, charCount) {
		charCount = parseInt(charCount);
		if (isNaN(charCount) || charCount < 1) return;

		charWidth = parseFloat(charWidth);
		if (isNaN(charWidth) || charWidth < 2.19) return;

		if (!rootElement) return;

		var inputElement = $(rootElement).find('input.fixed-count-chars-input');
		if (inputElement.length !== 1) return;
		inputElement = inputElement[0];

		var widthElement = $(rootElement).find('.width-wrapper');
		if (widthElement.length !== 1) return;
		widthElement = widthElement[0];

		// inputElement often need to be wider than desired width limitation,
		// otherwise when the caret moves to the end of the input,
		// the content of the input might be shift leftwards

		var moduleWidth = $(widthElement).outerWidth();
		var letterSpacing = (moduleWidth - charWidth * charCount) / charCount;
		var textIndent = letterSpacing / 2;

		C.l("total width:", moduleWidth, '\t charWidth:', charWidth, '\t charCount:', charCount, '\t letterSpacing:', letterSpacing, '\t indent:', textIndent);

		inputElement.style.letterSpacing = letterSpacing + 'px';
		inputElement.style.left = textIndent + 'px';
	}

	function detectCorrectCharWidthForPasswordInput(parentNode, testChar, testSpansCount, onResultEvaluated, shouldTrace) {
		var options = {
			testerCssClassName: 'fixed-count-chars-input-tester'
		};

		var noError = true;
		if (typeof onResultEvaluated !== 'function') {
			C.w('No callback provided. Nothing will happen when char width evaluated.');
		}

		var wrapperNode;
		var spans = [];

		if (!parentNode) {
			noError = false;
		} else {
			_setup();

			setTimeout(function () {
				_callCallback(_evaluate());
			}, 79);
		}

		if (noError) {
		} else {
			C.e('Detecting failed.');
			// _callCallback(0);
		}


		return noError;


		function _setup() {
			if (typeof testChar !== 'string' || testChar.length < 1) {
				testChar = '\u2022';
			} else {
				testChar = testChar.charAt(0);
			}

			testSpansCount = parseInt(testSpansCount);
			if (isNaN(testSpansCount) || testSpansCount < 3) testSpansCount = 3;

			var innerHTML = testChar;
			var i;

			wrapperNode = document.createElement('SPAN');

			for (i = 0; i < testSpansCount; i++) {
				var span = document.createElement('SPAN');
				span.innerHTML = innerHTML;
				span.className = options.testerCssClassName;
				span.style.position = 'absolute';
				wrapperNode.appendChild(span);
				spans.push(span);

				innerHTML += testChar;
			}

			parentNode.appendChild(wrapperNode);
		}

		function _evaluate() {
			var spanWidths = [];
			var charWidths = [];
			var lastSpanWidth = 0;

			var log = [];
			var i;
			for (i = 0; i < spans.length; i++) {
				spanWidths[i] = $(spans[i]).outerWidth();
				charWidths[i] = spanWidths[i] - lastSpanWidth;
				lastSpanWidth = spanWidths[i];
				if (shouldTrace) {
					log.push('width['+i+']: ' + charWidths[i] + ' ' + spanWidths[i]);
				}
			}

			var charWidthBiases = [];
			var maxBias = 0;
			for (i = 1; i < spans.length; i++) {
				charWidthBiases[i] = charWidths[i] - charWidths[i-1];
				maxBias = Math.max(charWidthBiases[i], maxBias);
			}
			log.push('maxBias: ' + maxBias);


			if (shouldTrace) {
				var logC = log.join('\n');
				var logH = log.join('<br>\n');

				C.l(logC);

				var para = document.createElement('P');
				para.innerHTML = logH;
				document.body.appendChild(para);
			}

			var charWidth = charWidths[0];
			if (maxBias > 2) charWidth = NaN;

			parentNode.removeChild(wrapperNode);

			return charWidth;
		}

		function _callCallback(charWidth) {
			if (typeof onResultEvaluated !== 'function') return;
			onResultEvaluated(charWidth);
		}
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
	// 	onValid: function (aggregatedValue, isCheckingOnLoad) {
	// 		$passwordPass1Container.hide();
	// 		$passwordPass2Container.show();
	// 		setTimeout(function () {
	// 			singleCharInputsSet2.focus();
	// 		}, 0);
	// 		$plpm1.hide();
	// 	}
	// });

	// var singleCharInputsSet2 = new wlc.UI.SingleCharacterInputsSet($('.password-pass-2 .single-char-inputs-set')[0], {
	// 	onValid: function (aggregatedValue, isCheckingOnLoad) {
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
