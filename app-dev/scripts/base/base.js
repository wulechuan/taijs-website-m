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
					var fieldElement = this.elements.field;

					var value = parseFloat(fieldElement.value);
					var valueString = value+'';
					var errorInfoElement;

					// C.w('Getting criteria from HTML is NOT safe!');
					var min = parseFloat(fieldElement.getAttribute('data-value-min'));
					var max = parseFloat(fieldElement.getAttribute('data-value-max'));
					if (isNaN(value)) return false;

					var isInteger = !valueString.match(/\./);

					var isWhole100 = isInteger && !!valueString.match(/\d+00$/);

					if (!isNaN(min) && !isNaN(max)) {
						var low = Math.min(min, max);
						var high = Math.max(min, max);
						min = low;
						max = high;
					}

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

					C.t(value, min, max, isValid);

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
		// setupAllInputFieldsForTheirFillingStatus($page, isFirstTime);
		// setupAllClearInputButtons($page, isFirstTime);
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

		// function setupAllInputFieldsForTheirFillingStatus($page, isFirstTime) {
		// 	if (!isFirstTime) return true;

		// 	$page.find('input, textarea, select').each(function () {
		// 		function _updateInputValueStatus(field) {
		// 			if (!field) {
		// 				return false;
		// 			}

		// 			var tnlc = field.tagName.toLowerCase();
		// 			if (tnlc !== 'input' && tnlc !== 'textarea' && tnlc !== 'select') {
		// 				return false;
		// 			}

		// 			var isEmpty = true;
		// 			var type = '';

		// 			if (tnlc==='select') {
		// 				isEmpty = field.selectedIndex === -1;
		// 			} else if (tnlc === 'input') {
		// 				type = field.type.toLowerCase();
		// 				if (type === 'checkbox') {
		// 					isEmpty = !field.checked;
		// 				} else if (type === 'radio') {
		// 					C.e('Not implemented yet!');
		// 					isEmpty = !field.checked;
		// 				} else {
		// 					isEmpty = !field.value;
		// 				}
		// 			}

		// 			if (isEmpty) {
		// 				$(field).removeClass('non-empty-field');
		// 				$(field).addClass('empty-field');
		// 			} else {
		// 				$(field).removeClass('empty-field');
		// 				$(field).addClass('non-empty-field');
		// 			}

		// 			field.valueStatus.isEmpty = isEmpty;
		// 			field.valueStatus.isValid = !isEmpty; // not implemented yet

		// 			if (Array.isArray(field.onValueChange)) {
		// 				for (var i = 0; i < field.onValueChange.length; i++) {
		// 					var callback = field.onValueChange[i];
		// 					if (typeof callback === 'function') callback.call(field, field.valueStatus);
		// 				}
		// 			}
		// 		}

		// 		this.onValueChange = [];
		// 		this.valueStatus = {
		// 			isEmpty: true,
		// 			isValid: false
		// 		};

		// 		_updateInputValueStatus(this);

		// 		$(this).on('input', function () {
		// 			_updateInputValueStatus(this);
		// 		});
		// 	});
		// }

		// function setupAllClearInputButtons($page, isFirstTime) {
		// 	if (!isFirstTime) return true;

		// 	$page.find('button[button-action="clear-input-field"][for-input]').each(function () {
		// 		function updateClearButtonStatusForInputField($clearButton, valueStatus) {
		// 			valueStatus = valueStatus || { isValid: true };
		// 			if (valueStatus.isEmpty) {
		// 				$clearButton.hide();
		// 			} else {
		// 				$clearButton.show();
		// 			}
		// 		}

		// 		var $clearButton = $(this);
		// 		this.setAttribute('type', 'button'); // prevent this from submitting <form>

		// 		var controlledInputId = this.getAttribute('for-input');
		// 		if (controlledInputId) controlledInputId = '#'+controlledInputId;

		// 		var controlledInput = $(controlledInputId)[0];

		// 		var inputIsValid = false;
		// 		if (controlledInput) {
		// 			var tnlc = controlledInput.tagName.toLowerCase();
		// 			if (tnlc === 'input') {
		// 				var inputType = controlledInput.type.toLowerCase();
		// 				inputIsValid = (inputType !== 'checkbox') && (inputType !== 'radio');
		// 			} else if (tnlc === 'textarea') {
		// 				inputIsValid = true;
		// 			} else {
		// 				inputIsValid = true;
		// 			}
		// 		}

		// 		if (inputIsValid) {
		// 			setTimeout(function () {
		// 				updateClearButtonStatusForInputField($clearButton, controlledInput.valueStatus);
		// 			}, 100);

		// 			controlledInput.onValueChange.push(function (valueStatus) {
		// 				updateClearButtonStatusForInputField($clearButton, valueStatus);
		// 			});

		// 			$clearButton.on('click', function (event) {
		// 				if (event) {
		// 					event.preventDefault();
		// 					event.stopPropagation();
		// 				}

		// 				controlledInput.value = '';
		// 				$(controlledInput).removeClass('non-empty-field');
		// 				$(controlledInput).removeClass('Invalid');
		// 				this.style.display = 'none';
		// 				if (typeof controlledInput.elements === 'object') {
		// 					var el = controlledInput.elements;
		// 					if (el.coupledChineseNumbers) {
		// 						el.coupledChineseNumbers.innerHTML = '';
		// 					}
		// 				}

		// 				setTimeout(function () {
		// 					controlledInput.focus();
		// 				}, 0);
		// 			});
		// 		}
		// 	});
		// }

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
	var wlc = window.webLogicControls;
	var WCU = wlc.CoreUtilities;


	$('form').each(function () { buildVirtualForm(this); });


	function buildVirtualForm(rootElement) {
		if (rootElement.virtualForm instanceof VirtualForm) {
			rootElement.virtualForm.rebuild();
		} else {
			new VirtualForm(rootElement);
		}
	}



	function VirtualForm (rootElement) {
		if (!(rootElement instanceof Node)) rootElement = document.body;

		var status = {
			rootElementIsAForm: rootElement.tagName.toLowerCase() === 'form',
			hasNoValidationAttributeAtBeginning: false,
		};


		if (status.rootElementIsAForm) {
			status.hasNoValidationAttributeAtBeginning = !rootElement.hasAttribute('novalidate');
		}

		var publicStatus = {
			allFieldsValidation: []
		};

		var elements = {
			root: rootElement,
			requiredFields: [],
			buttonsForSubmission: []
		};

		this.elements = {};
		this.status = publicStatus;
		this.checkValidation = checkValidation.bind(this);
		this.validate = validate.bind(this);
		this.getField = getField.bind(this);
		this.getVirtualField = getVirtualField.bind(this);
		this.validateFieldByIndex = validateFieldByIndex.bind(this);
		this.setFieldValidationByIndex = setFieldValidationByIndex.bind(this);
		this.rebuild = function () {
			C.l('Rebuilding an existing {'+this.constructor.name+'}...');
			build.call(this);
		};


		init.call(this);
		if (status.isInitializing) {
			C.e('Fail to construct <'+this.constructor.name+'>.');
			simpleDestroyThis();
			return;
		}

		rootElement.virtualForm = this;

		function simpleDestroyThis() {
			WCU.objectToolkit.destroyInstanceObject(this);
		}

		function init() {
			status.isInitializing = true;

			if (rootElement.virtualForm instanceof VirtualForm) {
				rootElement.virtualForm.rebuild();
				delete status.isInitializing;
				simpleDestroyThis();
				return;
			}

			if (!build.call(this)) return;

			delete status.isInitializing;
		}

		function build() {
			var isFirstTime = !!status.isInitializing;

			var oldRequiredFields = elements.requiredFields;
			// var oldButtonsForSubmission = this.elements.buttonsForSubmission;

			// requiredFieldsChanged does not mean the value of these elements changed, but addition or deletion of them instead
			var requiredFieldsChanged = oldRequiredFields.length !== elements.requiredFields.length; // fake implementation

			collectElements.call(this);


			if (isFirstTime && elements.requiredFields.length < 1) return false;


			if (isFirstTime || requiredFieldsChanged) {
				this.elements.root = rootElement; // just for safety
				this.elements.requiredFields       = [].concat(elements.requiredFields);
				this.elements.buttonsForSubmission = [].concat(elements.buttonsForSubmission);

				buildAllVirtualFieldsAsNeeded.call(this);
			}

			return true;
		}

		function collectElements() {
			var $allInvolvedElements;

			if (status.rootElementIsAForm) {
				$allInvolvedElements = $(rootElement.elements); // in case some fields/buttons NOT nested under <form> but has an attribute named "form"
			} else {
				$allInvolvedElements = $(rootElement).find('input, textarea, select, [contentEditable="true"]');
			}

			var $allRequiredInputs = $allInvolvedElements.filter(function (index, el) {
				var tnlc = el.tagName.toLowerCase();

				if (tnlc === 'input' || tnlc === 'textarea' || tnlc === 'select') {
					return el.hasAttribute('required');
				}

				var ce = el.getAttribute('contentEditable');
				if (typeof ce === 'string') ce = ce.toLowerCase();

				return (ce === 'true') && el.hasAttribute('required');
			});


			var $buttonsForSubmission = $allInvolvedElements.filter(function (index, el) {
				var attr =  el.getAttribute('button-action');
				if (attr) attr = attr.toLowerCase();
				return attr==='submit';
			});

			elements.requiredFields       = Array.prototype.slice.apply($allRequiredInputs);
			elements.buttonsForSubmission = Array.prototype.slice.apply($buttonsForSubmission);
		}

		function buildAllVirtualFieldsAsNeeded() {
			var i;
			var atLeastOneNewVirtualFieldCreated = false;
			for (i = 0; i < elements.requiredFields.length; i++) {
				var thisOneCreated = createNewVirtualFieldAsNeeded.call(this, i);
				atLeastOneNewVirtualFieldCreated = atLeastOneNewVirtualFieldCreated || thisOneCreated;
			}

			if (atLeastOneNewVirtualFieldCreated) {
				// C.t('validating virtualForm after building virtualFields...');
				this.validate();
			}
		}

		function createNewVirtualFieldAsNeeded(index) {
			// index = parseInt(index);
			// if (isNaN(index) || index <0 || index >= elements.requiredFields.length) return false;
			var field = elements.requiredFields[index];
			// if (!(field instanceof Node)) return;
			var virtualField = new VirtualField(field, {
				virtualForm: this,
				indexInVirtualForm: index
			});
			return !virtualField.hasBeenDestroied;
		}

		function getField(index) {
			index = parseInt(index);
			if (isNaN(index) || index < 0 || index >= elements.requiredFields.length) {
				C.e('Invalid index provided.');
				return;
			}
			var field = elements.requiredFields[index];
			if (!field || !(field.virtualField instanceof VirtualField)) return null;

			return field;
		}

		function getVirtualField(index) {
			var field = this.getField(index);
			if (field) {
				return field.virtualField;
			}

			return;
		}

		function validate() {
			// C.t('validating virtualForm');
			for (var i = 0; i < elements.requiredFields.length; i++) {
				validateFieldByIndex.call(this, i);
			}

			// C.t('CHECKING AFTER VALIDATING VIRTUALFORM...');
			// this.checkValidation();
		}

		function checkValidation(options) {
			var allInputsAreValid = true;
			if (status.rootElementIsAForm && rootElement.hasAttribute('novalidate')) {
				if (status.hasNoValidationAttributeAtBeginning) {
					C.w('form has been added "novalidate" attribute later.');
				}
			} else {
				// C.l('updating virtualForm validation status');

				options = options || {};
				options.shouldSkipDisabledInputs = !!options.shouldSkipDisabledInputs; // not implemented yet
				options.shouldSkipReadOnlyInputs = !!options.shouldSkipReadOnlyInputs; // not implemented yet

				for (var i = 0; i < publicStatus.allFieldsValidation.length; i++) {
					if (!publicStatus.allFieldsValidation[i]) {
						allInputsAreValid = false;
						break;
					}
				}
				// C.l('\t allInputsAreValid?', allInputsAreValid);
			}

			elements.buttonsForSubmission.forEach(function (button) {
				button.disabled = !allInputsAreValid;
			});

			return allInputsAreValid;
		}

		function validateFieldByIndex(index) {
			var field = this.getField(index);
			if (field) {
				field.virtualField.validate();
			}
		}

		function setFieldValidationByIndex(index, isValid) {
			// C.l('recieving field status: ', index, isValid);
			var field = this.getField(index);
			if (field && typeof isValid === 'boolean') {
				publicStatus.allFieldsValidation[index] = isValid;
			}

			C.l('\t ==> CHECKING on VirtualField Callback...');
			this.checkValidation();
		}
	}

	function VirtualField(fieldElement, initOptions) {
		if (!(fieldElement instanceof Node)) return;

		var status = {
			virtualForm: undefined,
			indexInVirtualForm: NaN,

			isSelect: false,
			isCheckbox: false,
			isRadio: false,
			isText: false,
			isPassword: false,

			valueIsEmpty: true,
			valueIsValid: false,
			validator: null,
			onFieldChangeEventHandler: undefined,
			onValueChange: [],
			registeredEventHandlers: []
		};

		var publicStatus = {};

		var elements = {
			field: fieldElement,
			tips: {
				// default: null,
				// error: {}
			}
		};


		this.elements = {};
		this.status = publicStatus;

		this.scanForTips = scanForTipsDefaultMethod.bind(this);
		this.validate = validate.bind(this);
		this.rebuild = function (options) {
			C.l('Rebuilding an existing {'+this.constructor.name+'}...');
			build.call(this, options);
		};


		init.call(this);
		if (status.isInitializing) {
			C.e('Fail to construct <'+this.constructor.name+'>.');
			simpleDestroyThis();
			return;
		}

		fieldElement.virtualField = this;

		function simpleDestroyThis() {
			WCU.objectToolkit.destroyInstanceObject(this);
		}

		function init() {
			status.isInitializing = true;

			if (fieldElement.virtualField instanceof VirtualField) {
				fieldElement.virtualField.rebuild();
				delete status.isInitializing;
				simpleDestroyThis();
				return;
			}

			if (!build.call(this, initOptions)) return;

			delete status.isInitializing;
		}


		function build(options) {
			var isFirstTime = !!status.isInitializing;

			this.elements.field = fieldElement; // just for safety


			if (isFirstTime) {
				status.onFieldChangeEventHandler = (function (event) {
					for (var i = 0; i < status.onValueChange.length; i++) {
						var callback = status.onValueChange[i];
						if (typeof callback === 'function') {
							callback.call(this, event);
						}
					}
				}).bind(this);


				status.onValueChange.push((function (event) {
					C.l('first', event);
				}).bind(this));
			}



			var virtualFormOptionsAreValid = 
				(options.virtualForm instanceof VirtualForm) &&
				typeof options.indexInVirtualForm === 'number' &&
				!!options.virtualForm.elements &&
				!!options.virtualForm.elements.requiredFields &&
				options.indexInVirtualForm >= 0 &&
				options.indexInVirtualForm < options.virtualForm.elements.requiredFields.length
			;
			// C.l(
			// 	'\n',(options.virtualForm instanceof VirtualForm),
			// 	'\n',typeof options.indexInVirtualForm === 'number',
			// 	'\n',!!options.virtualForm.elements,
			// 	'\n',!!options.virtualForm.elements.requiredFields,
			// 	'\n',options.indexInVirtualForm >= 0,
			// 	'\n',options.indexInVirtualForm < options.virtualForm.elements.requiredFields.length
			// );

			var virtualFormSetupChanged = false;
			if (virtualFormOptionsAreValid) {
				if (status.virtualForm === options.virtualForm && status.indexInVirtualForm === options.indexInVirtualForm) {
				} else {
					virtualFormSetupChanged = true;
					status.virtualForm = options.virtualForm;
					status.indexInVirtualForm = options.indexInVirtualForm;
				}
			}

			if (virtualFormSetupChanged) {
				// do something as needed
			}


			if (isFirstTime) { // The type of an input field is changable! But why would we do that!
				var tnlc = fieldElement.tagName.toLowerCase();

				status.isSelect = false;
				status.isCheckbox = false;
				status.isRadio = false;
				status.isText = false;
				status.isPassword = false;

				if (tnlc === 'input') {
					status.isSelect = false;

					var type = fieldElement.type.toLowerCase();
					if (type === 'checkbox') {
						status.isCheckbox = true;

					} else if (type === 'radio') {
						status.isText = false;
						status.isRadio = true;
					} else {
						status.isText = true;
						status.isPassword = type === 'password';
					}
				} else if (tnlc === 'textarea') {
						status.isText = true;
				} else if (tnlc === 'select') {
						status.isSelect = true;
				} else { // contentEditable
					status.isText = true;
				}
			}




			setupValidator.call(this, options, isFirstTime);
			setupEventHandlers.call(this, isFirstTime);


			if (isFirstTime) {
				setupClearInputButton.call(this);
			}


			var R = WCU.save.method(status, 'scanForTips', options, false);
			if (R.valueHasBeenChanged) {
				this.scanForTips();
				this.elements.tips = {
					default: elements.tips.default,
					errors:  elements.tips.errors // reference instead of duplication
				};
			}





			var shouldValidateNow = true;
			if (virtualFormOptionsAreValid && status.virtualForm) {
				shouldValidateNow = false; // wait for virtualForm batch action
			} else {
				if (isFirstTime) {
				} else {
					// shouldValidateNow = false;
				}
			}

			if (shouldValidateNow) {
				this.validate();
			}


			return true;
		}

		function setupValidator(options, isFirstTime) {
			if (!isFirstTime && !!status.validator) return;


			options = options || {};


			var validator = WCU.objectToolkit.evaluateDotNotationChainViaHTMLAttribute(fieldElement, 'data-validator');
			var validatorIsSpecified = typeof validator === 'function';

			if (typeof options.validator === 'function') { // override HTML's setup with options argument's
				validator = options.validator;
				validatorIsSpecified = true;
			}


			if (
				(!validatorIsSpecified && typeof status.validator === 'function') ||
				( validatorIsSpecified && validator === status.validator)
			) {
			} else {
				if (validatorIsSpecified) {
					status.validator = validator;
				}
			}



			if (!status.validator) {
				if (status.isPassword) {
					status.validator = defaultValidatorForTextInputField;
				} else if (status.isText) {
					status.validator = defaultValidatorForTextInputField;
				} else if (status.isCheckbox) {
					status.validator = defaultValidatorForCheckbox;
				} else if (status.isRadio) {
					status.validator = defaultValidatorForRadio;
				} else if (status.isSelect) {
					status.validator = defaultValidatorForSelect;
				} else {
					// hopefully impossible
				}
			}
		}

		function setupEventHandlers(isFirstTime) {
			if (!isFirstTime) return;


			var boundEventHandler;
			var handlers = status.registeredEventHandlers;

			boundEventHandler = (function () {
				C.l('\t boundEventHandler for ', fieldElement.tagName, fieldElement.type);
				this.validate();
			}).bind(this);
			handlers.push(boundEventHandler);


			if (status.isText) {
				$(fieldElement).on('input', boundEventHandler);
			} else if (status.isCheckbox || status.isRadio || status.isSelect) {
				$(fieldElement).on('change', boundEventHandler);
			}


			fieldElement.onUpdateAtHiddenState = boundEventHandler;
		}

		function setupClearInputButton(scanRootElement) {
			if (!(scanRootElement instanceof Node)) scanRootElement = $(fieldElement).parents('.page');
			// C.l(scanRootElement);
			var id = fieldElement.id;
			if (!id) return;
			if (!status.isText) return;

			var $buttons = $(scanRootElement).find('button[button-action="clear-input-field"][for-input="'+id+'"]');
			$buttons.each(function () {
				function updateClearButtonStatusForInputField() {
					if (status.valueIsEmpty) {
						$clearButton.hide();
					} else {
						$clearButton.show();
					}
					C.l(status);
				}

				var $clearButton = $(this);
				this.setAttribute('type', 'button'); // prevent this from submitting <form>

				// setTimeout(function () {
				// 	updateClearButtonStatusForInputField();
				// }, 100);

				status.onValueChange.push(function () {
					updateClearButtonStatusForInputField($clearButton);
				});

				$clearButton.on('click', function (event) {
					if (event) {
						event.preventDefault();
						event.stopPropagation();
					}

					fieldElement.value = '';
					$(fieldElement).removeClass('non-empty-field');
					$(fieldElement).removeClass('Invalid');

					$clearButton.hide();

					if (typeof fieldElement.elements === 'object') {
						var el = fieldElement.elements;
						if (el.coupledChineseNumbers) {
							el.coupledChineseNumbers.innerHTML = '';
						}
					}

					setTimeout(function () {
						fieldElement.focus();
					}, 0);
				});
			});
		}

		function scanForTipsDefaultMethod(scanRootElement) {
			if (!(scanRootElement instanceof Node)) scanRootElement = $(fieldElement).parents('.page');
			// C.l(scanRootElement);
			var id = fieldElement.id;
			if (!id) return;

			elements.tips.default = $(scanRootElement).find('.input-tip.default[for="'+id+'"]')[0];
			elements.tips.errors = Array.prototype.slice.apply(
				$(scanRootElement).find('.input-tip.error[for="'+id+'"]')
			);
		}

		function updateStatus() {
			var isEmpty = true;
			if (status.isText) {
				isEmpty = !fieldElement.value;
			} else if (status.isCheckbox) {
				isEmpty = !fieldElement.checked;
			} else if (status.isRadio) {
				C.e('Radio not implemented yet!');
				isEmpty = !fieldElement.checked;
			} else if (status.isSelect) {
				isEmpty = fieldElement.selectedIndex === -1;
			}

			status.valueIsEmpty = isEmpty;
		}

		function updateCssClasses() {
			if (status.valueIsEmpty) {
				$(fieldElement)
					.removeClass('non-empty-field')
					   .addClass('empty-field')
				;
			} else {
				$(fieldElement)
					.removeClass('empty-field')
					   .addClass('non-empty-field')
				;
			}


			if (status.valueIsValid) {
				$(fieldElement).removeClass('value-invalid');
			} else {
				$(fieldElement)   .addClass('value-invalid');
			}
		}

		function updateInfoTips(validateResult) {
			var defaultTip = elements.tips.default;
			var errorTip   = validateResult.errorInfoElement;
			if (!validateResult.isValid && !!errorTip) {
				showOrHideInputTip(defaultTip, true, false);
				showOrHideInputTip(errorTip, false, true);
			} else {
				showOrHideInputTip(defaultTip, true, true);
				showOrHideInputTip(elements.tips.errors, false, false); // hide all errors
			}

		}

		function defaultValidatorForTextInputField() {
			return fieldElement.value.replace(/^\s+/, '').replace(/\s+$/, '').length > 0;
		}
		function defaultValidatorForCheckbox() {
			return fieldElement.checked;
		}
		function defaultValidatorForRadio() {
			C.e('Radio validator not implemented!');
			return true;
		}
		function defaultValidatorForSelect() {
			return fieldElement.value !== -1;
		}

		function validate() {
			updateStatus.call(this);

			var validator = status.validator;

			var validateResult = {
				isValid: true,
				errorInfoElement: null
			};

			if (typeof validator === 'function') {
				var rawResult = validator.call(this);
				if (typeof rawResult === 'boolean') {
					validateResult.isValid = rawResult;
				} else if (!rawResult || typeof rawResult !== 'object' || typeof rawResult.isValid !== 'boolean') {
					C.e('Invalid return value of a input value validator. The return MUST be either a boolean or an object which contains a boolean property with property name "isValid".');
					validateResult.isValid = false;
				} else {
					validateResult.isValid = rawResult.isValid;
					if (rawResult.errorInfoElement instanceof Node) {
						validateResult.errorInfoElement = rawResult.errorInfoElement;
					}
				}
			}

			status.valueIsValid = validateResult.isValid;

			C.l('\t --> Validating virtualField ['+status.indexInVirtualForm+']', fieldElement.tagName, fieldElement.type);
			C.l('\t\t isEmpty?', status.valueIsEmpty, '\t isValid?', status.valueIsValid);

			if (status.virtualForm) {
				 status.virtualForm.setFieldValidationByIndex(status.indexInVirtualForm, status.valueIsValid);
			}

			updateCssClasses.call(this);
			updateInfoTips.call(this, validateResult);
		}

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
