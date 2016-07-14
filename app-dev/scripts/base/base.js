(function () {
	function processParametersPassedIn() {
		var qString = location.href.match(/\?[^#]*/);
		if (qString) qString = qString[0].slice(1);

		var qKVPairs = [];
		if (qString) {
			qKVPairs = qString.split('&');
		}

		var psn1; // page sidebar nav Level 1 current
		var psn2; // page sidebar nav Level 2 current
		var tabLabel; // id of tabLabel to show if any
		var bank;
		var bankHTML;

		if (typeof window.psn === 'object') {
			if (window.psn.level1) psn1 = window.psn.level1;
			if (window.psn.level2) psn2 = window.psn.level2;
		}

		for (var i in qKVPairs){
			var kvpString = qKVPairs[i];
			var kvp = kvpString.split('=');

			if (kvp[0] === 'psn1') psn1 = kvp[1];
			if (kvp[0] === 'psn2') psn2 = kvp[1];
			if (kvp[0] === 'tabLabel') tabLabel = kvp[1];
			if (kvp[0] === 'bank') bank = kvp[1];
			if (kvp[0] === 'bankHTML') bankHTML = kvp[1];
		}

		return {
			bank: decodeURIComponent(bank),
			bankHTML: decodeURIComponent(bankHTML).replace(/\+/g, ' '),
			tabLabel: tabLabel,
			psn: {
				level1: psn1,
				level2: psn2
			}
		};
	}


	var urlParameters = processParametersPassedIn();



	$('input, textarea, select').each(function () {
		function _updateInputValueStatus(field) {
			if (!field) {
				return false;
			}

			var tagNameLC = field.tagName.toLowerCase();
			if (tagNameLC !== 'input' && tagNameLC !== 'textarea' && tagNameLC !== 'select') {
				return false;
			}

			var isEmpty = (tagNameLC==='select') ? (field.selectedIndex === -1) : (!field.value);
			if (isEmpty) {
				$(field).removeClass('non-empty-field');
				$(field).addClass('empty-field');
			} else {
				$(field).removeClass('empty-field');
				$(field).addClass('non-empty-field');
			}
		}

		_updateInputValueStatus(this);

		$(this).on('input', function () {
			_updateInputValueStatus(this);
		});
	});


	$('.tab-panel-set').each(function () {
		var $tabList = $(this).find('.tab-list');

		var $allTabs = $tabList.find('> li');
		var currentTab = null;
		var currentItemHint = $tabList.find('> .current-item-hint')[0];

		$allTabs.each(function (index, tab) {
			var panelId = tab.getAttribute('aria-controls');
			var panel = $('#'+panelId)[0];

			if (!panel) throw('Can not find controlled panel for tab [expected panel id="'+panelId+'"].');

			panel.elements = { tab: tab };
			tab.elements = { panel: panel };

		});

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

		var tabToShowAtBegining = $('#panel-tab-'+urlParameters.tabLabel).parent()[0] || $allTabs[0];
		_showPanelAccordingToTab(tabToShowAtBegining);

		function _slideHintToTab(theTab) {
			if (!currentItemHint) return false;

			var currentItemHintCssLeft = -20;

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


			currentItemHint.style.clip = 'rect(0px, '+
				_R+'px, 2px, '+
				_L+'px)'
			;

			return true;
		}

		function _showPanelAccordingToTab(theTab) {
			currentTab = theTab;
			_slideHintToTab(theTab);

			for (var i = 0; i < $allTabs.length; i++) {
				var tab = $allTabs[i];
				_processOnePairOfTabPanel(tab, (theTab && tab === theTab));
			}
		}

		function _processOnePairOfTabPanel(tab, isToShownMyPanel) {
			if (!tab) return false;

			var panel = tab.elements.panel;
			if (!panel) return false;

			if (isToShownMyPanel) {
				panel.setAttribute('aria-hidden', false);
				$(tab).addClass('current');
				$(panel).addClass('current');
			} else {
				panel.setAttribute('aria-hidden', true);
				$(tab).removeClass('current');
				$(panel).removeClass('current');
			}

			return true;
		}
	});



	$('dl.initially-collapsed').each(function () {
		var $allDTs = $(this).find('> dt');
		var $allDDs = $(this).find('> dd');

		$allDTs.each(function (index, dt) {
			var dd = $(dt).find('+ dd')[0];
			if (!dd) throw('Can not find <dd> right after a <dt> element.');

			var ddContent = $(dd).find('> .content')[0];
			if (!ddContent) throw('Can not find .content within a <dd> element.');

			dd.elements = { dt: dt, content: ddContent };
			dt.elements = { dd: dd };

			$(dd).removeClass('expanded');
		});


		$allDTs.on('click', function () {
			_showDDAccordingToDT(this);
		});


		_showDDAccordingToDT(null);



		function _showDDAccordingToDT(dt) {
			var theDD = null;
			if (dt) theDD = dt.elements.dd;

			for (var i = 0; i < $allDDs.length; i++) {
				var dd = $allDDs[i];
				if (theDD && dd === theDD) {
					_processOnePairOfDTDD(dd, 'toggle');
				} else {
					_processOnePairOfDTDD(dd, 'collapse');
				}
			}
		}

		function _processOnePairOfDTDD(dd, action) {
			if (!dd) return false;

			var dt = dd.elements.dt;
			var content = dd.elements.content;

			if (!dt) return false;
			if (!content) return false;

			var $dt = $(dt);
			var $dd = $(dd);
			var $content = $(content);

			var ddNewHeight;

			var wasCollapsed = !$dd.hasClass('expanded');
			var needAction = (!wasCollapsed && action==='collapse') || (action==='toggle');
			if (!needAction) {
				return true;
			}


			if (wasCollapsed) {
				if (content.knownHeight > 20) {
					setTimeout(function () {
						var ddContentCurrentHeight = $content.outerHeight();
						if (ddContentCurrentHeight !== content.knownHeight) {
							content.knownHeight = ddContentCurrentHeight;
							ddNewHeight = ddContentCurrentHeight;
							dd.style.height = content.ddNewHeight+'px';
						}
					}, 100);
				} else {
					content.knownHeight = $content.outerHeight();
				}

				ddNewHeight = content.knownHeight;
				dd.style.height = ddNewHeight+'px';

				$dd.addClass('expanded');
				dd.setAttribute('aria-expanded', true);
				dd.setAttribute('aria-hidden',   false);
				$dt.addClass('expanded');
			} else {
				dd.style.height = '';

				$dd.removeClass('expanded');
				dd.setAttribute('aria-expanded', false);
				dd.setAttribute('aria-hidden',   true);
				$dt.removeClass('expanded');
			}


			return 0;
		}
	});


	setPageSidebarNavCurrentItem(urlParameters.psn);

	function updatePageSidebarNavSubMenuForMenuItem(menuItem, action) {
		var $subMenu = $(menuItem).find('> .menu');
		var subMenuWasExpanded = $(menuItem).hasClass('coupled-shown');
		var needAction =
			(!subMenuWasExpanded && action==='expand') ||
			(subMenuWasExpanded && action==='collapse') ||
			(action==='toggle')
		;
		if (!needAction) {
			return 0;
		}

		if (subMenuWasExpanded) {
			$(menuItem).removeClass('coupled-shown');
			$subMenu.slideUp(null);
		} else {
			$(menuItem).addClass('coupled-shown');
			$subMenu.slideDown(null);
		}
	}

	function setPageSidebarNavCurrentItem(conf) {
		conf = conf || {};
		conf.level1IdPrefix = 'menu-psn-1-';
		setMenuCurrentItemForLevel(1, 2, $('#page-sidebar-nav'), conf);
	}

	function setMenuCurrentItemForLevel(level, depth, parentDom, conf) {
		level = parseInt(level);
		depth = parseInt(depth);
		if (!(level > 0) || !(depth >= level)) {
			throw('Invalid menu level/depth for configuring a menu tree.');
		}
		if (typeof conf !== 'object') {
			throw('Invalid configuration object for configuring a menu tree.');
		}

		var prefix = conf['level'+level+'IdPrefix'];
		var desiredId = prefix + conf['level'+level];

		var $allItems = $(parentDom).find('.menu.level-'+level+' > .menu-item');
		var currentItem;
		var currentItemId;

		$allItems.each(function (index, menuItem) {
			var itemLabel = $(menuItem).find('> a > .label')[0];
			var itemId = itemLabel.id;

			var isCurrentItemOrParentOfCurrentItem = itemId && desiredId && (itemId===desiredId);
			var isCurrentItem = isCurrentItemOrParentOfCurrentItem && level === depth;
			if (isCurrentItemOrParentOfCurrentItem) {
				currentItem = menuItem;
				currentItemId = itemId;
				if (isCurrentItem) {
					$(menuItem).addClass('current');
					$(menuItem).removeClass('current-parent');
				} else {
					$(menuItem).addClass('current-parent');
					$(menuItem).removeClass('current');
				}
			} else {
				$(menuItem).removeClass('current');
				$(menuItem).removeClass('current-parent');
			}
		});

		var currentSubMenuItem = null;
		if (level < depth && currentItem) {
			var nextLevel = level + 1;
			conf['level'+nextLevel+'IdPrefix'] = currentItemId + '-' + nextLevel + '-';
			currentSubMenuItem = setMenuCurrentItemForLevel(nextLevel, depth, currentItem, conf);
			if (currentSubMenuItem) {
				$(currentItem).addClass('has-sub-menu'); // update this for robustness
				$(currentItem).addClass('coupled-shown');
			}
		}

		return currentSubMenuItem || currentItem;
	}

	$('.menu-item.has-sub-menu').each(function () {
		var menuItem = this;
		var $subMenuHint = $(this).find('> a > .sub-menu-hint, > .sub-menu-hint');

		$subMenuHint.on('click', function (event) {
			if (event) {
				event.preventDefault();
				event.stopPropagation();
			}

			updatePageSidebarNavSubMenuForMenuItem(menuItem, 'toggle');
		});
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



	$('.drop-down-list').each(function () {
		var dropDownList = this;
		var $currentValueContainer = $(this).find('.drop-down-list-current-value');
		var inputForStoringValue = $(this).find('input.drop-down-list-value');
		var inputForStoringHTML = $(this).find('input.drop-down-list-value-html');
		var $options = $(this).find('.drop-down-list-options > li'); // assuming there is only one level of menu

		if (urlParameters.bank && urlParameters.bank !== 'undefined') {
			_chooseOption(urlParameters.bank, urlParameters.bankHTML);
		} else {
			if ($options.length > 0) {
				wlc.UI.bodyClickListener.register(this, onClickOutside);
				_chooseOption(0);
			} else {
				_chooseOption(null);
			}
		}

		$currentValueContainer.on('click', function () {
			$(dropDownList).toggleClass('coupled-shown');
		});

		$options.on('click', function () {
			_chooseOption(this);
			$(dropDownList).removeClass('coupled-shown');
		});

		function _chooseOption(chosenOption, chosenOptionHTML) {
			if (typeof chosenOption === 'number') {
				chosenOption = $options[chosenOption];
			}

			var chosenValue;

			if (chosenOption && typeof chosenOption === 'string' && chosenOptionHTML && typeof chosenOptionHTML === 'string') {
				$currentValueContainer.html(chosenOptionHTML);
				$(inputForStoringValue).val(chosenOption);
				$(inputForStoringHTML).val(chosenOptionHTML);
			}

			if (!chosenOption) {
				$currentValueContainer[0].innerHTML = '';
				$(inputForStoringValue).val('');
				$(inputForStoringHTML).val('');
				return true;
			}

			if (!chosenValue) chosenValue = $(chosenOption).find('.value')[0];
			if (chosenValue) chosenValue = chosenValue.getAttribute('data-value');

			chosenOptionHTML = $(chosenOption).html();
			$currentValueContainer.html(chosenOptionHTML);
			$(inputForStoringValue).val(chosenValue);
			$(inputForStoringHTML).val(chosenOptionHTML);
		}

		function onClickOutside() {
			$(dropDownList).removeClass('coupled-shown');
		}
	});
})();


(function fakeLogics() {
	var DC = new webLogicControls.UI.DraggingController(
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