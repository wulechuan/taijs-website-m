(function () { // permanent logics
	var wlc = window.webLogicControls;
	var WCU = wlc.CoreUtilities;
	var UI = wlc.UI;

	function Application() {
		this.data = {
			URIParameters: wlc.generalTools.URI.evaluateParameters()
		};

		this.input = {
			validator: {
				fixedIncomeInvestmentAmount: function () {
					var value = parseFloat(this.value);
					var valueString = value+'';
					var errorInfoElement;

					// C.w('Getting criteria from HTML is NOT safe!');
					var min = parseFloat(this.getAttribute('data-value-min'));
					var max = parseFloat(this.getAttribute('data-value-max'));
					if (isNaN(value)) return false;

					var isInteger = !valueString.match(/\./);

					var isWhole100 = isInteger && !!valueString.match(/\d+00$/);

					if (!isNaN(min) && !isNaN(max)) {
						var low = Math.min(min, max);
						var high = Math.max(min, max);
						min = low;
						max = high;
					}

					// C.l(value, min, max);

					var isValid = isWhole100;

					if (!isNaN(min)) {
						if (value < min) {
							isValid = false;
						} else {
						}
					}

					if (!isNaN(max)) {
						if (value > max) {
							errorInfoElement = $('.input-tip.error[data-subject="amount-too-high"]')[0];
							isValid = false;
						}
					}

					return {
						isValid: isValid,
						errorInfoElement: errorInfoElement
					};
				}
			}
		};
	}

	var app = new Application();
	if (typeof window.taijs !== 'object') window.taijs = {};
	var taijs = window.taijs;
	taijs.app = app;
	// C.l(taijs.app);




	$('.page').each(function () {
		var page = this;
		commonSetupAciontsForOnePage(page);
		setTimeout(function () {
			commonSetupAciontsForOnePage(page); // twice to ensure everything get initialized
		}, 600);
	});
	function commonSetupAciontsForOnePage(page) {
		if (!(page instanceof Node)) return false;

		var isFirstTime = true;
		if (!!page.status && page.status.commonSetupHasBeenRun === true) {
			isFirstTime = false;
			C.l('Setup page common behaviours a second time.');
		}

		if (typeof page.status !== 'object') page.status = {};

		var $page = $(page);

		setupPageBodyMinHeightForPage($page, isFirstTime);
		setupAllPopupLayers(page);
		setupAllAutoConstructTabPanelSets($page, isFirstTime);
		setupAllNavBackButtons($page, isFirstTime);
		setupAllButtonsWithInlineClickAction($page, isFirstTime);
		setupAllStaticProgressRings($page, isFirstTime);
		setupAllInputFieldsForTheirFillingStatus($page, isFirstTime);
		setupAllClearInputButtons($page, isFirstTime);
		setupAllContentsWithDesiredStringFormat($page, isFirstTime);
		setupAllChineseNumbersPresenters($page, isFirstTime);
		setupAllMenuItemsThatHasSubMenu($page, isFirstTime);
		setupAllSensitiveContentBlocks($page, isFirstTime);

		page.status.commonSetupHasBeenRun = true; // always update this status

		function setupPageBodyMinHeightForPage($page, isFirstTime) {
			var pageBody = $page.find('.page-body')[0];
			if (!page || !pageBody) {
				return;
			}

			if (!isFirstTime) return true;

			var pageBodyOffsetY = $page.offset().top;
			var shouldSetBodyContent = false;
			var pageBodyContentOffsetY = 0;

			var windowInnerHeight = window.innerHeight;
			var pageBodyMinHeight = windowInnerHeight - pageBodyOffsetY;

			var pageHasFixedFooter = $page.hasClass('fixed-page-footer') && !!$page.find('.page-footer')[0];
			if (pageHasFixedFooter) {
				var pageFixedFooterHeight = 66;
				pageBodyMinHeight -= pageFixedFooterHeight;
			}

			var $pageBodyContent = $(pageBody).find('> .content-with-solid-bg');
			var pageBodyContent = $pageBodyContent[0];
			if (pageBodyContent) {
				shouldSetBodyContent = true;
				pageBodyContentOffsetY = $pageBodyContent.offset().top;
			}

			var pageBodyContentMinHeight = pageBodyMinHeight - pageBodyContentOffsetY + pageBodyOffsetY;
			// C.l(
			// 	'fixed-page-footer?', pageHasFixedFooter,
			//  	'\t pageBodyMinHeight', pageBodyMinHeight,
			//  	'\t pageBodyContentMinHeight', pageBodyContentMinHeight
			//  );

			if (shouldSetBodyContent) {
				$(pageBody).addClass('use-content-as-main-container');
				pageBodyContent.style.minHeight = pageBodyContentMinHeight + 'px';
			} else {
				$(pageBody).removeClass('use-content-as-main-container');
				pageBody.style.minHeight = pageBodyMinHeight + 'px';
			}
		}

		function setupAllPopupLayers(page/*, isFirstTime*/) {
			UI.popupLayersManager.processAllUnder(page);
		}

		function setupAllAutoConstructTabPanelSets($page, isFirstTime) {
			if (!isFirstTime) return true;

			$page.find('.tab-panel-set').each(function () {
				if (this.dataset.doNotAutoConstruct) {
					// C.l('Skipping auto constructing TabPanelSet from:', this);
					return true;
				}
				new wlc.UI.TabPanelSet(this, {
					initTab: app.data.URIParameters.tabLabel
				});
			});
		}

		function setupAllNavBackButtons($page, isFirstTime) {
			if (!isFirstTime) return true;

			$page.find('.nav-back[data-back-target="history"]').on('click', function (event) {
				event.preventDefault();
				event.stopPropagation();
				history.back();
			});
		}

		function setupAllButtonsWithInlineClickAction($page, isFirstTime) {
			if (!isFirstTime) return true;

			$page.find('[data-click-action]').each(function () {
				var button = this;
				var inlineActionString = this.getAttribute('data-click-action');
				var hasValidAction = !!inlineActionString;

				var actionName;
				var actionTarget;
				if (hasValidAction) {
					var prefix = inlineActionString.match(/^\s*([^\:\s]+)\s*\:(.*)/);
					if (prefix) {
						actionName   = prefix[1];
						actionTarget = prefix[2];
					}
				}

				hasValidAction = false;
				var action;
				switch (actionName) {
					default:
						break;
					case 'show-popup':
						hasValidAction = !!actionTarget;
						action = hasValidAction && function (event) {
							UI.popupLayersManager.show(actionTarget, event);
						};
						break;
				}

				hasValidAction = hasValidAction && typeof action === 'function';

				if (!hasValidAction) {
					C.w('Inline action is invalid:', this);
					return false;
				}

				$(button).on('click', action);
			});
			// data-click-action="show-popup:pl-message-credit-limitation-introduction"
		}

		function setupAllStaticProgressRings($page) {
			if (!isFirstTime) return true;

			$page.find('.progress-rings').each(function () {
				if (this.getAttribute('data-dynamic')) return;
				new wlc.UI.ProgressRings(this);
			});
		}

		function setupAllInputFieldsForTheirFillingStatus($page, isFirstTime) {
			if (!isFirstTime) return true;

			$page.find('input, textarea, select').each(function () {
				function _updateInputValueStatus(field) {
					if (!field) {
						return false;
					}

					var tnlc = field.tagName.toLowerCase();
					if (tnlc !== 'input' && tnlc !== 'textarea' && tnlc !== 'select') {
						return false;
					}

					var isEmpty = true;
					var type = '';

					if (tnlc==='select') {
						isEmpty = field.selectedIndex === -1;
					} else if (tnlc === 'input') {
						type = field.type.toLowerCase();
						if (type === 'checkbox') {
							isEmpty = !field.checked;
						} else if (type === 'radio') {
							C.e('Not implemented yet!');
							isEmpty = !field.checked;
						} else {
							isEmpty = !field.value;
						}
					}

					if (isEmpty) {
						$(field).removeClass('non-empty-field');
						$(field).addClass('empty-field');
					} else {
						$(field).removeClass('empty-field');
						$(field).addClass('non-empty-field');
					}

					field.valueStatus.isEmpty = isEmpty;
					field.valueStatus.isValid = !isEmpty; // not implemented yet

					if (Array.isArray(field.onValueChange)) {
						for (var i = 0; i < field.onValueChange.length; i++) {
							var callback = field.onValueChange[i];
							if (typeof callback === 'function') callback.call(field, field.valueStatus);
						}
					}
				}

				this.onValueChange = [];
				this.valueStatus = {
					isEmpty: true,
					isValid: false
				};

				_updateInputValueStatus(this);

				$(this).on('input', function () {
					_updateInputValueStatus(this);
				});
			});
		}

		function setupAllClearInputButtons($page, isFirstTime) {
			if (!isFirstTime) return true;

			$page.find('button[button-action="clear-input-field"][for-input]').each(function () {
				function updateClearButtonStatusForInputField($clearButton, valueStatus) {
					valueStatus = valueStatus || { isValid: true };
					if (valueStatus.isEmpty) {
						$clearButton.hide();
					} else {
						$clearButton.show();
					}
				}

				var $clearButton = $(this);
				this.setAttribute('type', 'button'); // prevent this from submitting <form>

				var controlledInputId = this.getAttribute('for-input');
				if (controlledInputId) controlledInputId = '#'+controlledInputId;

				var controlledInput = $(controlledInputId)[0];

				var inputIsValid = false;
				if (controlledInput) {
					var tnlc = controlledInput.tagName.toLowerCase();
					if (tnlc === 'input') {
						var inputType = controlledInput.type.toLowerCase();
						inputIsValid = (inputType !== 'checkbox') && (inputType !== 'radio');
					} else if (tnlc === 'textarea') {
						inputIsValid = true;
					} else {
						inputIsValid = true;
					}
				}

				if (inputIsValid) {
					setTimeout(function () {
						updateClearButtonStatusForInputField($clearButton, controlledInput.valueStatus);
					}, 100);

					controlledInput.onValueChange.push(function (valueStatus) {
						updateClearButtonStatusForInputField($clearButton, valueStatus);
					});

					$clearButton.on('click', function (event) {
						if (event) {
							event.preventDefault();
							event.stopPropagation();
						}

						controlledInput.value = '';
						$(controlledInput).removeClass('non-empty-field');
						$(controlledInput).removeClass('Invalid');
						this.style.display = 'none';
						if (typeof controlledInput.elements === 'object') {
							var el = controlledInput.elements;
							if (el.coupledChineseNumbers) {
								el.coupledChineseNumbers.innerHTML = '';
							}
						}

						setTimeout(function () {
							controlledInput.focus();
						}, 0);
					});
				}
			});
		}

		function setupAllContentsWithDesiredStringFormat($page, isFirstTime) {
			if (!isFirstTime) return true;

			$page.find('[data-text-format]').each(function () {
				var tnlc = this.tagName.toLowerCase();
				var contentIsFromUserInput = false;
				var propertyToFormat = 'textContent';
				var elementIsValid = true;

				if (tnlc === 'input') {
					if (this.type === 'checkbox' || this.type === 'radio') {
						elementIsValid = false;
					} else {
						contentIsFromUserInput = true;
						propertyToFormat = 'value';
					}
				} else if (tnlc === 'textarea') {
					contentIsFromUserInput = true;
					propertyToFormat = 'value';
				} else if (this.getAttribute('contentEditable') && this.getAttribute('contentEditable').toLowerCase() === 'true') {
					contentIsFromUserInput = true;
				}

				if (!elementIsValid) return;

				_formatText(this);

				if (contentIsFromUserInput) {
					$(this).on('input', function () {
						_formatText(this);
					});
				}



				function _formatText(el, textFormat) {
					if (!textFormat) {
						textFormat = el.dataset.textFormat;
					}
					// console.log(textFormat);

					var text = el[propertyToFormat];
					// console.log('old text:', text);

					switch (textFormat) {
						case 'mobile':
							if (contentIsFromUserInput) {
								text = _formatMobileInput(text);
							} else {
								text = _formatMobile(text);
							}
							break;

						case 'bank-card':
							if (contentIsFromUserInput) {
								text = _formatBankCardInput(text);
							} else {
								text = _formatBankCard(text);
							}
							break;

						case 'chinese-id-card':
							if (contentIsFromUserInput) {
								text = _formatChineseIdCardInput(text);
							} else {
								text = _formatChineseIdCard(text);
							}
							break;

						default:
							break;
					}

					// console.log('new text:', text);
					el[propertyToFormat] = text;
				}

				function _formatMobile(text) {
					var divider = ' ';
					return text
						.replace(/^\-/, '')
						.replace(/[^\-\+\*\d]/g, '')
						.replace(/(\s|.)\+/g, '$1')
						.replace(/([\d\*]{3})[\s\-]*(.*)/, '$1'+divider+'$2')
						.replace(/([\d\*]{3}[\s\-][\d\*]{4})[\s\-]*(.*)/, '$1'+divider+'$2')
						.replace(/([\d\*]{3}[\s\-][\d\*]{4}[\s\-][\d\*]{4})[\s\-]*(.*)/, '$1'+divider+'$2')
						.replace(/[\s\-]+$/, '')
						.replace(/([\d\*\s\-]{23})(.*)/, '$1')
					;
				}
				function _formatMobileInput(text) {
					var divider = ' ';
					return text
						.replace(/^\-/, '')
						.replace(/[^\-\+\d]/g, '')
						.replace(/(\s|.)\+/g, '$1')
						.replace(/(\d{3})[\s\-]*(.*)/, '$1'+divider+'$2')
						.replace(/(\d{3}[\s\-]\d{4})[\s\-]*(.*)/, '$1'+divider+'$2')
						.replace(/(\d{3}[\s\-]\d{4}[\s\-]\d{4})[\s\-]*(.*)/, '$1'+divider+'$2')
						.replace(/[\s\-]+$/, '')
						.replace(/([\d\s\-]{23})(.*)/, '$1')
					;
				}
				function _formatBankCard(text) {
					var divider = ' ';
					return text
						.replace(/[^\d\*]/g, '')
						.replace(/([\d\*]{4})[\s\-]*(.*)/, '$1'+divider+'$2')
						.replace(/([\d\*]{4}[\s\-][\d\*]{4})[\s\-]*(.*)/, '$1'+divider+'$2')
						.replace(/([\d\*]{4}[\s\-][\d\*]{4}[\s\-][\d\*]{4})[\s\-]*(.*)/, '$1'+divider+'$2')
						.replace(/([\d\*]{4}[\s\-][\d\*]{4}[\s\-][\d\*]{4}[\s\-][\d\*]{4})[\s\-]*(.*)/, '$1'+divider+'$2')
						.replace(/([\d\*]{4}[\s\-][\d\*]{4}[\s\-][\d\*]{4}[\s\-][\d\*]{4}[\s\-][\d\*]{3})[\s\-]*(.*)/, '$1'+divider+'$2')
						.replace(/[\s\-]+$/, '')
						.replace(/([\d\*\s\-]{35})(.*)/, '$1')
					;
				}
				function _formatBankCardInput(text) {
					var divider = ' ';
					return text
						.replace(/[^0-9]/g, '')
						.replace(/(\d{4})[\s\-]*(.*)/, '$1'+divider+'$2')
						.replace(/(\d{4}[\s\-]\d{4})[\s\-]*(.*)/, '$1'+divider+'$2')
						.replace(/(\d{4}[\s\-]\d{4}[\s\-]\d{4})[\s\-]*(.*)/, '$1'+divider+'$2')
						.replace(/(\d{4}[\s\-]\d{4}[\s\-]\d{4}[\s\-]\d{4})[\s\-]*(.*)/, '$1'+divider+'$2')
						.replace(/(\d{4}[\s\-]\d{4}[\s\-]\d{4}[\s\-]\d{4}[\s\-]\d{3})[\s\-]*(.*)/, '$1'+divider+'$2')
						.replace(/[\s\-]+$/, '')
						.replace(/([\d\s\-]{35})(.*)/, '$1')
					;
				}
				function _formatChineseIdCard(text) {
					var divider = ' ';
					return text
						.replace(/[^xX\s0-9\*]/g, '')
						.replace(/([\d\*]{6})[\s\-]*(.*)/, '$1'+divider+'$2')
						.replace(/([\d\*]{6}[\s\-][\d\*]{4})[\s\-]*(.*)/, '$1'+divider+'$2')
						.replace(/([\d\*]{6}[\s\-][\d\*]{4}[\s\-][\d\*]{4})[\s\-]*(.*)/, '$1'+divider+'$2')
						.replace(/([\d\*]{6}[\s\-][\d\*]{4}[\s\-][\d\*]{4}[\s\-][\d\*]{3}.)(.*)/, '$1')
						.replace(/([\d\*]{6}[\s\-][\d\*]{4}[\s\-][\d\*]{4}[\s\-][\d\*]{3})([xX0-9\*])?(.*)/, '$1$2')
						.replace(/[\s\-]+$/, '')
						.replace(/([\dxX\*\s\-]{21})(.*)/, '$1')
						.toUpperCase()
					;
				}
				function _formatChineseIdCardInput(text) {
					var divider = ' ';
					return text
						.replace(/[^xX\s0-9]/g, '')
						.replace(/(\d{6})[\s\-]*(.*)/, '$1'+divider+'$2')
						.replace(/(\d{6}[\s\-]\d{4})[\s\-]*(.*)/, '$1'+divider+'$2')
						.replace(/(\d{6}[\s\-]\d{4}[\s\-]\d{4})[\s\-]*(.*)/, '$1'+divider+'$2')
						.replace(/(\d{6}[\s\-]\d{4}[\s\-]\d{4}[\s\-]\d{3}.)(.*)/, '$1')
						.replace(/(\d{6}[\s\-]\d{4}[\s\-]\d{4}[\s\-]\d{3})([xX0-9])?(.*)/, '$1$2')
						.replace(/[\s\-]+$/, '')
						.replace(/([\dxX\s\-]{21})(.*)/, '$1')
						.toUpperCase()
					;
				}
			});
		}

		function setupAllChineseNumbersPresenters($page, isFirstTime) {
			if (!isFirstTime) return true;

			$page.find('.chinese-number[for-element]').each(function () {
				var servedElementId = this.getAttribute('for-element');
				if (!servedElementId) return false;

				var servedElement = $(document).find('#'+servedElementId)[0];
				if (!servedElement) return false;


				var thisFormatElement = this;


				var tnlc = servedElement.tagName.toLowerCase();
				var contentIsFromUserInput = false;
				var contentIsFromSelect = false;
				var propertyToFormat = 'textContent';
				var elementIsValid = true;

				if (tnlc === 'input') {
					if (servedElement.type === 'checkbox' || servedElement.type === 'radio') {
						elementIsValid = false;
					} else {
						contentIsFromUserInput = true;
						propertyToFormat = 'value';
					}
				} else if (tnlc === 'textarea') {
					contentIsFromUserInput = true;
					propertyToFormat = 'value';
				} else if (tnlc === 'select') {
					contentIsFromUserInput = true;
					contentIsFromSelect = true;
					propertyToFormat = 'value';
				} else if (servedElement.getAttribute('contentEditable') && servedElement.getAttribute('contentEditable').toLowerCase() === 'true') {
					contentIsFromUserInput = true;
				}

				if (!elementIsValid) return;


				_updateChineseNumbers();


				if (contentIsFromUserInput) {
					if (typeof servedElement.elements !== 'object') servedElement.elements = {};
					servedElement.elements.coupledChineseNumbers = thisFormatElement;
					$(servedElement).on(contentIsFromSelect ? 'change' : 'input', function () {
						_updateChineseNumbers();
					});
				}


				function _updateChineseNumbers() {
					var decimal = servedElement[propertyToFormat];
					var formatter = WCU.stringFormatters.decimalToChineseMoney;

					thisFormatElement.innerHTML = formatter.format(decimal);
					if (!contentIsFromSelect) {
						servedElement[propertyToFormat] = formatter.data.lastGroomedInput;
					}
				}
			});
		}

		function setupAllMenuItemsThatHasSubMenu($page, isFirstTime) {
			if (!isFirstTime) return true;

			$page.find('.menu-item.has-sub-menu').each(function () {
				var menuItem = this;
				var $menuItem = $(this);
				var $subMenu = $menuItem.find('> .menu-wrap, > .menu');
				if ($subMenu.length !== 1) {
					return false;
				}

				$menuItem.on('click', function () {
					showHideSubMenuUnderMenuItem(menuItem, 'toggle');
				});

				function showHideSubMenuUnderMenuItem(menuItem, action) {
					var subMenuWasExpanded = $(menuItem).hasClass('coupled-shown');
					var shouldTakeAction =
						(!subMenuWasExpanded && action==='expand') ||
						(subMenuWasExpanded && action==='collapse') ||
						(action==='toggle')
					;
					if (!shouldTakeAction) {
						return 0;
					}

					if (subMenuWasExpanded) {
						$(menuItem).removeClass('coupled-shown');
					} else {
						$(menuItem).addClass('coupled-shown');
					}
				}
			});
		}

		function setupAllSensitiveContentBlocks($page, isFirstTime) {
			$page.find('.sensitive-content').each(function () {
				var $sensitiveContentBlock = $(this);

				var $toggleIcon = $sensitiveContentBlock.find('.sensitive-content-status-icon');
				if ($toggleIcon.length < 1) {
					C.e('No toggle icon found under a ".sensitive-content" block.');
					return false;
				}

				$sensitiveContentBlock.addClass('sensitive-content-shown');
				if (isFirstTime === true) {
					$toggleIcon.on('click', function () {
						$sensitiveContentBlock.toggleClass('sensitive-content-shown');
					});
				}
			});
		}
	}
})();



(function () { // logics which are not robust or completed
	var app = window.taijs.app;

	$('form').filter(function (index, form) {
		return !form.hasAttribute('novalidate');
	}).each(function () {
		var $allRequiredInputs = $(this.elements).filter(function (index, el) {
			// input[required], textarea[required], [contentEditable="true"][required];
			var tnlc = el.tagName.toLowerCase();
			if (tnlc === 'input' || tnlc === 'textarea') {
				return el.hasAttribute('required');
			}

			var ce = el.getAttribute('contentEditable');
			if (ce) ce = ce.toLowerCase();

			return (ce === 'true') && el.hasAttribute('required');
		});

		var $submitButtons =$(this.elements).filter(function (index, el) {
			var attr =  el.getAttribute('button-action');
			if (attr) attr = attr.toLowerCase();
			return attr==='submit';
		});
		// C.l($submitButtons);


		var allInputsAreValid = false;

		var allInputsValidation = [];
		for (var i = 0; i < $allRequiredInputs.length; i++) {
			var field = $allRequiredInputs[i];
			allInputsValidation[i] = !!field.valueStatus && !!field.valueStatus.isValid;
		}


		_validateAllRequiredInputs();


		$allRequiredInputs.each(function (index) {
			function evaluateValidatorFunctionFromHTMLAttribute(element) {
				if (!(element instanceof Node)) return;

				var setup = element.getAttribute('data-validator');
				if (typeof setup !== 'string' || setup.length < 3) return;

				var validPathSoFar = '';
				var failedToFound = false;

				var keys = setup.split('.');

				var validator = {};
				validator[keys[0]] = keys[0];

				if (keys[0] === 'app') {
					validator[keys[0]] = app;
				}

				var key;
				for (var i = 0; i < keys.length; i++) {
					key = keys[i];
					validator = validator[key];
					// C.l('['+i+'] "'+validPathSoFar+'"', typeof validator);
					if ((i < (keys.length - 1)) && typeof validator !== 'object') {
						failedToFound = true;
						break;
					}
					validPathSoFar += (i===0 ? '' : '.') + key;
				}

				failedToFound = failedToFound || (typeof validator !== 'function');
				if (failedToFound) {
					C.e('Fail to found function "'+setup+'" ('+validPathSoFar+' has no property named "'+key+'")');
					return;
				}

				// C.l('Evaluated validator function:', validator);
				return validator;
			}

			function textInputFieldDefaultValidator() {
				return this.value.replace(/^\s+/, '').replace(/\s+$/, '').length > 0;
			}

			function validateInputOfIndex(index, input, validator) {
				var validateState = {
					isValid: true,
					errorInfoElement: null
				};

				if (typeof validator === 'function') {
					var result = validator.call(input);
					if (typeof result === 'boolean') {
						validateState.isValid = result;
					} else if (typeof result !== 'object' || !result || typeof result.isValid !== 'boolean') {
						C.e('Invalid return value of a input value validator. The return MUST be either a boolean or an object which contains a boolean property with property name "isValid".');
					} else {
						validateState.isValid = result.isValid;
						if (result.errorInfoElement instanceof Node) validateState.errorInfoElement = result.errorInfoElement;
					}
				}

				allInputsValidation[index] = validateState.isValid;
				if (!validateState.isValid) {
					$(input).addClass('value-invalid');
				} else {
					$(input).removeClass('value-invalid');
				}

				// C.l(validateState);

				var $defaultInputTip = $(input.parentNode).find('.input-tip.default[for="'+input.id+'"]');
				if (!validateState.isValid && validateState.errorInfoElement) {
					showOrHideInputTip($defaultInputTip, true, false);
					showOrHideInputTip(validateState.errorInfoElement, false, true);
				} else {
					showOrHideInputTip($defaultInputTip, true, true);
					showOrHideInputTip($(input.parentNode).find('.input-tip.error[for="'+input.id+'"]'), false, false);
				}

				_validateAllRequiredInputs();

				function showOrHideInputTip(inputTip, isDefaultTip, isToShow) {
					if (!!isToShow) {
						if (!!isDefaultTip) {
							$(inputTip).removeClass('hidden');
						} else {
							$(inputTip).addClass('shown');
						}
					} else {
						if (!!isDefaultTip) {
							$(inputTip).addClass('hidden');
						} else {
							$(inputTip).removeClass('shown');
						}
					}
				}
			}

			function textInputFieldOnValueChange(index/*, event*/) {
				validateInputOfIndex(index, this, specifiedValidator);
			}




			var specifiedValidator = evaluateValidatorFunctionFromHTMLAttribute(this);

			var tnlc = this.tagName.toLowerCase();
			var isTextInputField = true;
			if (tnlc === 'input') {
				var type = this.type.toLowerCase();
				if (type === 'checkbox') {
					isTextInputField = false;
					$(this).on('change', function () {
						allInputsValidation[index] = this.checked;
						_validateAllRequiredInputs();
					});
				} else if (type === 'radio') {
					isTextInputField = false;
					C.e('Radio validation NOT handled!');
					allInputsValidation[index] = true;
					_validateAllRequiredInputs();
				} else {
				}
			} else if (tnlc === 'textarea') {
			} else { // contentEditable
				// $(this).on('input', validatorForContentEditableElement.bind(this));
				// this.onUpdateAtHiddenState = function () {
				// }
			}

			if (isTextInputField) {
				if (typeof specifiedValidator !== 'function') specifiedValidator = textInputFieldDefaultValidator;

				$(this).on('input', textInputFieldOnValueChange.bind(this, index));
				this.onUpdateAtHiddenState = textInputFieldOnValueChange.bind(this, index);
			}
		});


		function _validateAllRequiredInputs(shouldSkipDisabledInputs, shouldSkipReadOnlyInputs) {
			shouldSkipDisabledInputs = !!shouldSkipDisabledInputs; // not implemented yet
			shouldSkipReadOnlyInputs = !!shouldSkipReadOnlyInputs; // not implemented yet
			allInputsAreValid = true;
			for (var i = 0; i < allInputsValidation.length; i++) {
				allInputsAreValid = allInputsAreValid && allInputsValidation[i];
			}

			$submitButtons.each(function () {
				this.disabled = !allInputsAreValid;
			});
		}
	});
})();



(function () { // fake logics
	$('a[href$="index.html"]').each(function () {
		this.href += '?login=true';
	});

	// var wlc = window.webLogicControls;
	// var UI = wlc.UI;

	// popupSomeWindowForTest();

	// function popupSomeWindowForTest() {
	// 	var pls = [
	// 		'pl-message-credit-limitation-introduction',
	// 		'plpm-modification-succeeded',
	// 		// 'pl-message-intro-jia-xi-quan',
	// 		// 'pl-message-intro-te-quan-ben-jin',
	// 		// 'pl-message-intro-ti-yan-jin',
	// 		// 'pl-available-tickets-list',
	// 		// 'pl-trading-password-incorrect',
	// 		// 'pl-product-terminated',
	// 		// 'pl-input-image-vcode'
	// 	];

	// 	var currentPL = 0;
	// 	$('.page-body').on('click', function () {
	// 		UI.popupLayersManager.show(pls[currentPL]);
	// 		currentPL++;
	// 		if (currentPL >= pls.length) currentPL -= pls.length;
	// 	});
	// }
})();
