(function () { // temp logic which are not robust or completed
	function processParametersPassedIn() {
		var qString = location.href.match(/\?[^#]*/);
		if (qString) qString = qString[0].slice(1);

		var qKVPairs = [];
		if (qString) {
			qKVPairs = qString.split('&');
		}

		var tabLabel; // id of tabLabel to show if any

		for (var i in qKVPairs){
			var kvpString = qKVPairs[i];
			var kvp = kvpString.split('=');
			if (kvp[0] === 'tabLabel') tabLabel = kvp[1];
		}

		return {
			tabLabel: tabLabel
		};
	}

	var urlParameters = processParametersPassedIn();
	window.urlParameters = urlParameters;




	var popupLayersManager = new PopupLayersManager();
	window.popupLayersManager = popupLayersManager;

	function PopupLayersManager() {
		this.show = function (popupLayerIdOrDom, event) {
			_showOrHidePopupLayer(popupLayerIdOrDom, true, event);
		};
		this.hide = function (popupLayerIdOrDom) {
			_showOrHidePopupLayer(popupLayerIdOrDom);
		};

		function _showOrHidePopupLayer(popupLayerIdOrDom, isToShow, eventOfShow) {
			if (!popupLayerIdOrDom) return false;

			var plId, pl;
			if (typeof popupLayerIdOrDom === 'string') {
				plId = popupLayerIdOrDom;
				pl = $('#'+plId)[0];
			} else {
				pl = popupLayerIdOrDom;
				plId = pl.id;
			}

			if (!pl || !pl.elements) {
				C.e('Cannot find popup layer with id "'+plId+'".');
				return false;			
			}

			var $bp = pl.elements.$popupLayersBackPlate;

			if (!isToShow) {
				$bp.hide();
				$(pl).hide();
				// _clearCssClassNamesAboutShowingUp(pl);
			} else {
				var $pl = $(pl);
				var isPoliteMessage = $pl.hasClass('polite-message');
				var isPopupPanel = $pl.hasClass('has-docked-panel');
				var hasPopupWindowOrDialog = !$pl.hasClass('has-no-popup-window');

				var needToDecideShowingUpDirection = !isPopupPanel && !isPoliteMessage && !hasPopupWindowOrDialog;

				if (needToDecideShowingUpDirection) {
					var $pw = $pl.find('.popup-window');
					_clearCssClassNamesAboutShowingUp($pw);
					var cssClass = _decideShowingUpSourceDirection(eventOfShow);
					$pw.addClass(cssClass);
				}



				var needToShowBackPlate = !isPoliteMessage;
				if (needToShowBackPlate) $bp.show();
				$pl.show();

				if (isPoliteMessage) {
					var durationBeforeAutoHide = 3000;
					var _temp = parseFloat(pl.getAttribute('data-showing-duration-in-seconds'));
					if (!isNaN(_temp) && _temp > 1) durationBeforeAutoHide = _temp * 1000;

					setTimeout(function () {
						$pl.fadeOut();
					}, durationBeforeAutoHide);
				}
			}
		}

		function _clearCssClassNamesAboutShowingUp($pw) {
			$pw
				.removeClass('shows-up-from-center shows-up-from-top shows-up-from-top-left shows-up-from-top-right shows-up-from-bottom shows-up-from-bottom-left shows-up-from-bottom-right shows-up-from-leftside shows-up-from-rightside');
		}

		function _decideShowingUpSourceDirection(event) {
			var cssClass = 'shows-up-from-center';

			if (typeof event !== 'object' || typeof event.pageX !== 'number' || typeof event.pageY !== 'number') {
				return cssClass;
			}

			var w = window.innerWidth;
			var h = window.innerHeight;
			var x = event.pageX;
			var y = event.pageY;
			var ratioX = 0.33;
			var ratioY = 0.4;

			var isLeft = x <= w * ratioX;
			var isRight = x >= w * (1 - ratioX);
			var isAbove = y <= h * ratioY;
			var isBelow = y >= h * (1 - ratioY);

			if (isAbove) {
				cssClass = 'shows-up-from-top';
				if (isLeft) {
					cssClass = 'shows-up-from-top-left';
				} else if (isRight) {
					cssClass = 'shows-up-from-top-right';
				}
			} else if (isBelow) {
				cssClass = 'shows-up-from-bottom';
				if (isLeft) {
					cssClass = 'shows-up-from-bottom-left';
				} else if (isRight) {
					cssClass = 'shows-up-from-bottom-right';
				}
			} else {
				if (isLeft) {
					cssClass = 'shows-up-from-leftside';
				} else if (isRight) {
					cssClass = 'shows-up-from-rightside';
				}
			}

			return cssClass;
		}
	}


	$('.app > .popup-layers, .page .popup-layers').each(function () {
		var $plContainer = $(this);
		var $bp = $plContainer.find('.popup-layers-back-plate');

		$plContainer.find('.popup-layer').each(function () {
			if (this.hasBeenProcessed) return true;

			this.elements = {
				$popupLayersBackPlate: $bp
			};
			// C.l(this.id, this.elements.$popupLayersBackPlate[0]);

			var pl = this;
			var $pl = $(pl);
			$pl.find('[button-action="confirm"], [button-action="cancel"]').on('click', function() {
				popupLayersManager.hide(pl);
			});

			this.hasBeenProcessed = true;
		});
	});
})();



(function () { // permanent logics
	var wlc = window.webLogicControls;
	var WCU = wlc.CoreUtilities;


	$('.page').each(function () {
		commonSetupAciontsForOnePage(this);
	});


	function commonSetupAciontsForOnePage(page) {
		var $page = $(page);

		setupAllAutoConstructTabPanelSets($page);
		setupPageBodyMinHeightForPage($page);
		setupAllButtonsWithInlineClickAction($page);
		setupAllNavBackButtons($page);
		setupAllInputFieldsForTheirFillingStatus($page);
		setupAllClearInputButtons($page);
		setupAllContentsWithDesiredStringFormat($page);
		setupAllSensitiveContentBlocks($page);
		setupAllChineseNumbersPresenters($page);

		function setupAllButtonsWithInlineClickAction($page) {
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
							window.window.popupLayersManager.show(actionTarget, event);
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

		function setupAllAutoConstructTabPanelSets($page) {
			$page.find('.tab-panel-set').each(function () {
				if (this.dataset.doNotAutoConstruct) {
					// C.l('Skipping auto constructing TabPanelSet from:', this);
					return true;
				}
				new wlc.UI.TabPanelSet(this, {
					initTab: window.urlParameters.tabLabel
				});
			});
		}

		function setupPageBodyMinHeightForPage($page) {
			var pageBody = $page.find('.page-body')[0];
			if (!page || !pageBody) {
				return;
			}

			var pageHeaderHeight = $page.offset().top;
			var shouldSetBodyContent = false;
			var pageBodyContentOffsetY = 0;

			var windowInnerHeight = window.innerHeight;
			var pageBodyMinHeight = windowInnerHeight - pageHeaderHeight;

			var pageHasFixedFooter = $page.hasClass('fixed-page-footer') && !!$page.find('.page-footer')[0];
			if (pageHasFixedFooter) {
				var pageFixedFooterHeight = 66;
				pageBodyMinHeight -= pageFixedFooterHeight;
			}

			var $pageBodyContent = $(pageBody).find('> .content');
			var pageBodyContent = $pageBodyContent[0];
			if (pageBodyContent) {
				shouldSetBodyContent = true;
				pageBodyContentOffsetY = $pageBodyContent.offset().top;
			}

			var pageBodyContentMinHeight = pageBodyMinHeight - pageBodyContentOffsetY + pageHeaderHeight;
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

		function setupAllNavBackButtons($page) {
			$page.find('.nav-back[data-back-target="history"]').on('click', function (event) {
				event.preventDefault();
				event.stopPropagation();
				history.back();
			});
		}

		function setupAllInputFieldsForTheirFillingStatus($page) {
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

		function setupAllClearInputButtons($page) {
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

		function setupAllContentsWithDesiredStringFormat($page) {
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

		function setupAllSensitiveContentBlocks($page) {
			$page.find('.sensitive-content').each(function () {
				var $sensitiveContentBlock = $(this);

				var $toggleIcon = $sensitiveContentBlock.find('.sensitive-content-status-icon');
				if ($toggleIcon.length < 1) {
					C.e('No toggle icon found under a ".sensitive-content" block.');
					return false;
				}

				$sensitiveContentBlock.addClass('sensitive-content-shown');

				$toggleIcon.on('click', function () {
					$sensitiveContentBlock.toggleClass('sensitive-content-shown');
				});
			});
		}

		function setupAllChineseNumbersPresenters($page) {
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
	}
})();



(function () { // temp logic which are not robust or completed
	var wlc = window.webLogicControls;
	// var WCU = wlc.CoreUtilities;



	$('.menu-item.has-sub-menu').each(function () {
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



	$('.progress-rings').each(function () {
		new wlc.UI.ProgressRings(this);
	});



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

		var buttonSubmit =$(this.elements).filter(function (index, el) {
			var attr =  el.getAttribute('button-action');
			if (attr) attr = attr.toLowerCase();
			return attr==='submit';
		})[0];


		// if (this.name === 'signup') {
		// 	C.l(this.elements);
		// 	// console.log($allRequiredInputs);
		// 	console.log(buttonSubmit);
		// }


		var allInputsAreValid = false;

		var allInputsValidation = [];
		for (var i = 0; i < $allRequiredInputs.length; i++) {
			var field = $allRequiredInputs[i];
			allInputsValidation[i] = !!field.valueStatus && !!field.valueStatus.isValid;
		}


		_validateAllRequiredInputs();


		$allRequiredInputs.each(function (index) {
			var tnlc = this.tagName.toLowerCase();

			function validatorForInputOrTextarea() {
				allInputsValidation[index] = !!this.value.replace(/^\s+/, '').replace(/\s+$/, '').length;
				_validateAllRequiredInputs();
			}

			if (tnlc === 'input') {
				var type = this.type.toLowerCase();
				if (type === 'checkbox') {
					$(this).on('change', function () {
						allInputsValidation[index] = this.checked;
						_validateAllRequiredInputs();
					});
				} else {
					$(this).on('input', validatorForInputOrTextarea.bind(this));
					this.onUpdateAtHiddenState = validatorForInputOrTextarea.bind(this);
				}
			} else if (tnlc === 'textarea') {
				$(this).on('input', validatorForInputOrTextarea.bind(this));
				this.onUpdateAtHiddenState = validatorForInputOrTextarea.bind(this);
			} else {
				// $(this).on('input', validatorForContentEditableElement.bind(this));
				// this.onUpdateAtHiddenState = function () {
				// }
			}
		});


		function _validateAllRequiredInputs(shouldSkipDisabledInputs, shouldSkipReadOnlyInputs) {
			shouldSkipDisabledInputs = !!shouldSkipDisabledInputs; // not implemented yet
			shouldSkipReadOnlyInputs = !!shouldSkipReadOnlyInputs; // not implemented yet
			allInputsAreValid = true;
			for (var i = 0; i < allInputsValidation.length; i++) {
				allInputsAreValid = allInputsAreValid && allInputsValidation[i];
			}

			if (buttonSubmit) buttonSubmit.disabled = !allInputsAreValid;
		}
	});
})();



(function () { // fake logics
	$('a[href$="index.html"]').each(function () {
		this.href += '?login=true';
	});
})();



