(function () {
	var wlc = window.webLogicControls;
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



	$('.app > .popup-layers, .page .popup-layers').each(function () {
		var $pLContainer = $(this);
		var $bp = $pLContainer.find('.popup-layers-back-plate');

		$pLContainer.find('.popup-layer').each(function () {
			this.elements = {
				$popupLayersBackPlate: $bp
			};

			var $pL = $(this);
			$pL.find('[button-action="confirm"], [button-action="cancel"]').on('click', function() {
				$bp.hide();
				$pL.hide();
			});
		});
	});

	var $globalbp = $('.app > .popup-layers .popup-layers-back-plate');
	var $pLTaijsServiceContact = $('.app > .popup-layers #pl-taijs-service-contact');

	// $('.page-body-stamp .taijs-service-contact').on('click', function () {
	// 	if (!navigator.userAgent.math(/MicroMessenger/i)) {
	// 		$globalbp.show();
	// 		$pLTaijsServiceContact.show();
	// 	}
	// });

	$('.page').each(function () {
		var $page = $(this);
		var pageBody = $page.find('.page-body')[0];

		if (pageBody) {
			var pageHeaderHeight = 48;

			var windowInnerHeight = window.innerHeight;
			var pageBodyMinHeight = windowInnerHeight - pageHeaderHeight;

			var pageHasFixedFooter = $page.hasClass('fixed-page-footer') && !!$page.find('.page-footer')[0];
			if (pageHasFixedFooter) {
				var pageFixedFooterHeight = 66;
				pageBodyMinHeight -= pageFixedFooterHeight;
			}

			pageBody.style.minHeight = pageBodyMinHeight + 'px';
		}
	});



	$('a[href$="index.html"]').each(function () {
		this.href += '?login=true';
	});

	$('.nav-back[data-back-target="history"]').on('click', function (event) {
		event.preventDefault();
		event.stopPropagation();
		history.back();
	});


	$('input, textarea, select').each(function () {
		function _updateInputValueStatus(field) {
			if (!field) {
				return false;
			}

			var tnlc = field.tagName.toLowerCase();
			if (tnlc !== 'input' && tnlc !== 'textarea' && tnlc !== 'select') {
				return false;
			}

			var isEmpty = (tnlc==='select') ? (field.selectedIndex === -1) : (!field.value);
			if (isEmpty) {
				$(field).removeClass('non-empty-field');
				$(field).addClass('empty-field');
			} else {
				$(field).removeClass('empty-field');
				$(field).addClass('non-empty-field');
			}

			if (Array.isArray(field.onValueChange)) {
				field.valueStatus.isEmpty = isEmpty;
				field.valueStatus.isValid = true; // not implemented yet

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


	$('button[button-action="clear-input-field"][for-input]').each(function () {
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
				setTimeout(function () {
					controlledInput.focus();
				}, 0);
			});
		}
	});


	$('[data-text-format]').each(function () {
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
			;
		}
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


		// console.log($allRequiredInputs);
		// console.log(buttonSubmit);


		var allInputsAreValid = false;

		var allInputsValidation = [];
		for (var i = 0; i < $allRequiredInputs.length; i++) {
			allInputsValidation[i] = false;
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


	$('.sensitive-content').each(function () {
		var $sensitiveContentBlock = $(this);

		var $toggleIcon = $sensitiveContentBlock.find('.sensitive-content-status-icon');
		if ($toggleIcon.length < 1) {
			return false;
		}

		$toggleIcon.on('click', function () {
			$sensitiveContentBlock.toggleClass('sensitive-content-shown');
		});
	});


	$('.tab-panel-set').each(function () {
		var $allPanels = $(this).find('.panel');
		if ($allPanels.length < 1) return false;

		var $tabList = $(this).find('.tab-list');
		var $allTabs = $tabList.find('> li');

		$allPanels.each(function () {
			this.elements = { tab: null };
		});

		$allTabs.each(function (index, tab) {
			var panelId = tab.getAttribute('aria-controls');
			var panel = $('#'+panelId)[0];

			if (!panel) throw('Can not find controlled panel for tab [expected panel id="'+panelId+'"].');

			panel.elements.tab = tab;
			tab.elements = { panel: panel };
		});



		var currentTab = null;
		var currentItemHint = $tabList.find('> .current-item-hint')[0];


		if ($allTabs.length > 1) {
			$allTabs.on('click', function () {
				_showPanelAccordingToTab(this);
			});
			$allTabs.on('mouseover', function () {
				_slideHintToTab(this);
			});
			$tabList.on('mouseout', function () {
				_slideHintToTab(currentTab);
			});
		}

		if ($allTabs.length < 1 || $allPanels.length === 1) {
			_showPanel($allPanels[0]);
		} else {
			var tabToShowAtBegining = $('#panel-tab-'+urlParameters.tabLabel).parent()[0] || $allTabs[0];
			_showPanelAccordingToTab(tabToShowAtBegining);
		}


		function _slideHintToTab(theTab) {
			if (!currentItemHint) return false;

			var currentItemHintCssLeft = 0;

			if (!theTab) {
				currentItemHint.style.clip = '';
				return true;
			}

			var _P = $(theTab).offsetParent();
			var _L = $(theTab).offset().left;
			var _LP = $(_P).offset().left;

			_L -= _LP;
			_L -= currentItemHintCssLeft;

			var _W = $(theTab).outerWidth();

			var _R = _L+_W;


			currentItemHint.style.clip = 'rect('+
			       '0, '+
				_R+'px, '+
				   '3px, '+
				_L+'px)'
			;

			return true;
		}

		function _showPanelAccordingToTab(theTab) {
			currentTab = theTab;
			_slideHintToTab(theTab);

			var thePanel = null;
			if (theTab && theTab.elements) thePanel = theTab.elements.panel;
			_showPanel(thePanel);
		}

		function _showPanel(thePanel) {
			var currentTab = null;
			if (thePanel && thePanel.elements) currentTab = thePanel.elements.tab;
			_slideHintToTab(currentTab);

			for (var i = 0; i < $allPanels.length; i++) {
				var panel = $allPanels[i];
				_showHideOnePanel(panel, (thePanel && panel === thePanel));
			}
		}

		function _showHideOnePanel(panel, isToShow) {
			if (!panel) return false;

			var tab = panel.elements.tab;

			if (isToShow) {
				panel.setAttribute('aria-hidden', false);
				$(tab).addClass('current');
				$(panel).addClass('current');
				var nameToShowInPageHeader = panel.dataset.nameInPageHeader;
				if (nameToShowInPageHeader) {
					$(panel).parents('.page').find('.page-header .header-bar .center h1').html(nameToShowInPageHeader);
					$('title').html(nameToShowInPageHeader);
				}
			} else {
				panel.setAttribute('aria-hidden', true);
				$(tab).removeClass('current');
				$(panel).removeClass('current');
			}

			return true;
		}
	});


	$('.progress-rings').each(function (index) {
		var progressRings = new wlc.UI.ProgressRings(this, {
			// takeLastQueuedDegreeOnly: false,
			// useTransitions: false,
			// disableInitialUpdate: true,
			// treatTotalDurationAsRoughSpeed: false,
			// singleRingTransitionsTotalDuration: 1,
			// perRings: [
			// 	{ transitionsTotalDuration: 2 }
			// ]
		});


		var pageWidth = window.innerWidth;
		function update(pageX) {
			// return false;
			var margin = 75;
			var degrees = [
				// Math.max(0, Math.min(1, (pageX - margin) / (pageWidth - margin - margin))) * 360 * Math.random(),
				// Math.max(0, Math.min(1, (pageX - margin) / (pageWidth - margin - margin))) * 360 * Math.random(),
				Math.max(0, Math.min(1, (pageX - margin) / (pageWidth - margin - margin))) * 360
			];
			// c.l(degrees);
			progressRings.setDegrees(degrees);
		}
		// function print() {
		// 	c.l('Got degree:', progressRings.getDegree());
		// }

		if (index === 0) {
			var move = false;
			var waiting = false;
			// setTimeout(print, 1000);

			$(document.body)
				.on('mousedown', function (event) {
					update(event.pageX);
					move = true;
				})
				.on('mousemove', function () {
					if (!move) return false;
					if (waiting) return false;
					waiting = true;
					setTimeout(function () {
						// update(event.pageX);
						waiting = false;
					}, 100);
				})
				.on('mouseup', function () {
					move = false;
					waiting = false;
					// setTimeout(print, 1000);
				})
			;
		}
	});


	var $allTabularLists = $('.tabular .f-list');

	$allTabularLists.each(function () {
		var $allListItems  = $(this).find(' > li.selectable');
		var $allCheckboxes = $allListItems.find('input[type="checkbox"].selectable-list-item-selector');
		var $allRadios     = $allListItems.find('input[type="radio"].selectable-list-item-selector');
		// console.log('has checkboxes: ', $allCheckboxes.length > 0, '\nhas radios: ', $allRadios.length > 0);

		function _updateListItemAccordingToCheckboxStatus(listItem, checkbox) {
			var $li = $(listItem);
			if (checkbox.disabled) {
				$li.addClass('disabled');
			} else {
				$li.removeClass('disabled');
			}

			if (checkbox.checked) {
				$li.addClass('selected');
			} else {
				$li.removeClass('selected');
			}
		}

		if ($allCheckboxes.length > 0) {
			$allListItems.each(function () {
				var listItem = this;
				var $listItem = $(this);


				var $myCheckbox = $listItem.find('input[type="checkbox"].selectable-list-item-selector');
				var myCheckbox = $myCheckbox[0];


				var _myCheckboxUntouchedYet = true;
				setTimeout(function () { /* Initializing selection status; And this must dealy because ie8 to ie11 updates cached "checked" statuses very late */
					if (_myCheckboxUntouchedYet) {
						_updateListItemAccordingToCheckboxStatus(listItem, myCheckbox);
					}
				}, 100);

				if (myCheckbox) {
					$myCheckbox.on('click', function(event) {
						if (this.disabled) return false;
						_myCheckboxUntouchedYet = false;
						if (event) event.stopPropagation();
					});

					$listItem.on('click', function () {
						if (myCheckbox.disabled) return false;
						myCheckbox.checked = !myCheckbox.checked;
						_myCheckboxUntouchedYet = false;
						_updateListItemAccordingToCheckboxStatus(this, myCheckbox);
					});

					$myCheckbox.on('change', function() {
						_updateListItemAccordingToCheckboxStatus(listItem, this);
					});
				}
			});
		}







		function _updateAllListItemsAccordingToRadioStatuses() {
			for (var i = 0; i < $allListItems.length; i++) {
				var _li = $allListItems[i];
				var _radio = _li.elements && _li.elements.radio;

				var $li = $(_li);

				if (_radio.disabled) {
					$li.addClass('disabled');
				}

				if (_radio.checked) {
					$li.addClass('selected');
				} else {
					$li.removeClass('selected');
				}
			}
		}

		if ($allRadios.length > 0) {
			var _radioUntouchedYet = true;
			setTimeout(function () { /* Initializing selection status; And this must dealy because ie8 to ie11 updates cached "checked" statuses very late */
				if (_radioUntouchedYet) {
					_updateAllListItemsAccordingToRadioStatuses();
				}
			}, 100);

			$allListItems.each(function () {
				var listItem = this;
				var $listItem = $(this);

				var $myRadio = $listItem.find('input[type="radio"].selectable-list-item-selector');
				var myRadio = $myRadio[0];
				if (myRadio) {
					if (typeof listItem.elements !== 'object') listItem.elements = {};
					listItem.elements.radio = myRadio;

					$listItem.on('click', function () {
						if (!myRadio.disabled) {
							_radioUntouchedYet = false;
							myRadio.checked = true;
						}
						_updateAllListItemsAccordingToRadioStatuses();
					});
				}
			});
		}
	});
})();


(function fakeLogics() {
	window.DC = new webLogicControls.UI.DraggingController(
		document.body,
		{
			movingElement: $('.app-fg-layer')[0],
			durationForResettingPosition: 0.2,
			triggerDirection: 'd',
			onFirstTrigger: function (event, options) {
				console.log('first:', options.status.triggerCount);
			},
			onEachTrigger: function(event, options) {
				console.log('each:', options.status.triggerCount);
			}
		}
	);
})();