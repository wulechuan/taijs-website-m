window.webLogicControls = {};

(function () {
	var wlc = this;


	this.Class = {};
	(function () { // Class

	}).call(this.Class);


	this.DOM = {};
	(function () { // DOM
		this.ANestedInB = function (A, B, considerAisBAsTrue) {
			if (!(A instanceof Node && B instanceof Node)) return false;

			if (!considerAisBAsTrue) A = A.parentNode;
			while (A.tagName && A!==document.body && A!==B) {
				A = A.parentNode;
			}

			return A===B;
		};
	}).call(this.DOM);


	this.UI = {};
	(function () { // UI
		this.bodyClickListener = new BodyClickListener();
		function BodyClickListener() {
			/*
				require:
					ANestedInB()
			*/
			this.registeredElements = [];

			this.register = function (elements, callback) {
				if (typeof callback !== 'function') return false;

				if (!Array.isArray(elements)) elements = [elements];
				for (var i = 0; i < elements.length; i++) {
					var el = elements[i];
					if (!el) continue;
					this.registeredElements.push({
						element: el,
						callback: callback
					});
				}
			};

			this.broadCastOutsideClickToRegisteredElements = function (clickedEl) {
				for (var i = 0; i < this.registeredElements.length; i++) {
					var record = this.registeredElements[i];
					var el = record.element;
					var isOutside = this.testClickOutsideElement(el, clickedEl);
					if (isOutside) {
						record.callback(clickedEl);
					}
				}
			};

			this.testClickOutsideElement = function (testEl, clickedEl) {
				return !wlc.DOM.ANestedInB(clickedEl, testEl, true);

				// if (!testEl || !clickedEl) return true;

				// while (clickedEl && clickedEl!==document.body && clickedEl!==testEl) {
				// 	clickedEl = clickedEl.parentNode;
				// }

				// return testEl !== clickedEl;
			};

			function _init() {
				$('body').on('click', (function (event) {
					var clickedEl = event.target;
					this.broadCastOutsideClickToRegisteredElements(clickedEl);
				}).bind(this));
			}

			_init.call(this);
		}


		this.Menu_NOT_DONE_YET = function (rootElement, initOptions) {
			// function example() {
			// 	conf = conf || {};
			// 	conf.level1IdPrefix = 'menu-chief-1-';
			// 	setMenuCurrentItemForLevel(1, 2, $('#app-chief-nav'), conf);
			// }

			this.options = {
				cssClassItemActive: 'current',
				cssClassItemParentOfActive: 'current-parent'
			};

			this.onItemActivate = undefined;
			this.onItemDeactivate = undefined;

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
		};


		this.DraggingController = function(rootElement, initOptions) {
			/*
				require:
					ANestedInB()
			*/
			if (!(rootElement instanceof Node)) {
				throw('Invalid rootElement for constructing a '+this.constructor.name+'.');
			}

			this.options = {
				durationForResettingPosition: 0.4,
				maxOffsetX: 120,
				maxOffsetY: 180,
				triggerX: 60,
				triggerY: 90,
				// triggerResetX: 60 * 0.75,
				// triggerResetY: 90 * 0.75,
				triggerDirection: 'downwards'
			};

			this.onFirstTrigger = undefined;
			this.onEachTrigger = undefined;

			this.config = function (options) {
				config.call(this, options);
			};

			this.enable = function () {
				status.enabled = true;
			};

			this.disable = function () {
				status.enabled = false;
				this.cancelDragging();
			};

			this.cancelDragging = function () {
				if (status.mouseDownEvent) status.shouldCancelDragging = true;
			};

			var status = {
				enabled: true,
				triggerCount: 0,
				justTriggered: false,
				mouseDownEvent: null,
				draggingDirectionIsHorizontal: undefined,
				draggingDirectionIsNegative: undefined,
				isDraggingAlongTriggerDirection: false,
				draggingDirectionHasBeenDecided: false,
				transitionIsPlaying: false
			};

			var data = {
				movingElementOldInlineTransform: ''
			};

			var triggerCallBackOptions = {
				rootElement: rootElement,
				movingElement: null,
				status: status
			};

			function onMouseDown(event) {
				if (status.enabled && !status.transitionIsPlaying) {
					prepareDragging.call(this, event);
				}
			}

			function onMouseUp() {
				if (status.isDraggingAlongTriggerDirection) {
					resetMovingElementPosition.call(this);
				}
				clearStatus();
			}

			function onMouseMove(event) {
				if (status.shouldCancelDragging) {
					clearStatus();
				} else {
					detectValidDragging.call(this, event);
				}
			}




			function config(options) {
				options = options || {};

				if (options.hasOwnProperty('movingElement')) {
					var me = options.movingElement;
					if (me instanceof Node) {
						if (wlc.DOM.ANestedInB(rootElement, me)) {
							console.warn('DraggingController: The rootElement is a descendant of the movingElement.');
						}
					} else if (me === null) {
						me = rootElement;
					} else {
						me = undefined;
					}

					if (me) {
						var cbo = triggerCallBackOptions;

						if (cbo.movingElement instanceof Node) {
							restoreMovingElement();
							restoreMovingElementTransition();
						}

						cbo.movingElement = me;
						data.movingElementOriginalInlineTransform = me.style.transform;
						data.movingElementOriginalInlineTransition = me.style.transition;

						this.cancelDragging();
					}
				}

				switch (options.triggerDirection) {
					case 'l':
						this.options.triggerDirection = 'leftwards';
						break;
					case 'r':
						this.options.triggerDirection = 'rightwards';
						break;
					case 'u':
						this.options.triggerDirection = 'upwards';
						break;
					case 'd':
						this.options.triggerDirection = 'downwards';
						break;

					case 'left':
					case 'right':
					case 'up':
					case 'down':
						this.options.triggerDirection = options.triggerDirection+'wards';
						break;

					case 'leftwards':
					case 'rightwards':
					case 'upwards':
					case 'downwards':
						this.options.triggerDirection = options.triggerDirection;
						break;

					default:
						// do nothing
				}

				var _O = this.options;

				if (options.durationForResettingPosition > 0) _O.durationForResettingPosition = options.durationForResettingPosition;

				if (options.maxOffsetX > 0) _O.maxOffsetX = options.maxOffsetX;
				if (options.maxOffsetY > 0) _O.maxOffsetY = options.maxOffsetY;

				if (options.triggerX > 0) _O.triggerX = Math.min(_O.maxOffsetX, options.triggerX);
				if (options.triggerY > 0) _O.triggerY = Math.min(_O.maxOffsetY, options.triggerY);

				_O.triggerResetX = _O.triggerX * 0.75;
				_O.triggerResetY = _O.triggerY * 0.75;

				if (options.triggerResetX > 0) _O.triggerResetX = Math.min(_O.triggerResetX, options.triggerResetX);
				if (options.triggerResetY > 0) _O.triggerResetY = Math.min(_O.triggerResetY, options.triggerResetY);

				if (typeof options.onFirstTrigger === 'function') this.onFirstTrigger = options.onFirstTrigger;
				if (typeof options.onEachTrigger === 'function') this.onEachTrigger = options.onEachTrigger;
			}

			function restoreMovingElement() {
				var style = triggerCallBackOptions.movingElement.style;
				style.webkitTouchCallout = '';
				style.webkitUserSelect = '';
				style.khtmlUserSelect = '';
				style.mozUserSelect = '';
				style.msUserSelect = '';
				style.userSelect = '';
				style.transform = data.movingElementOriginalInlineTransform;
			}
			function restoreMovingElementTransition() {
				triggerCallBackOptions.movingElement.style.transition = data.movingElementOriginalInlineTransition;
				status.transitionIsPlaying = false;
			}

			function clearStatus() {
				status.shouldCancelDragging = false;
				status.mouseDownEvent = null;
				status.triggerCount = 0;
				status.justTriggered = false;
				status.draggingDirectionIsHorizontal = undefined;
				status.draggingDirectionIsNegative = undefined;
				status.isDraggingAlongTriggerDirection = false;
				status.draggingDirectionHasBeenDecided = false;
			}

			function prepareDragging(event) {
				clearStatus(); // just for sure
				restoreMovingElement(); // just for sure

				status.mouseDownEvent = event;

				switch (this.options.triggerDirection) {
					case 'leftwards':
					case 'rightwards':
						status.draggingDirectionIsHorizontal = true;
						break;

					default:
					case 'upwards':
					case 'downwards':
						status.draggingDirectionIsHorizontal = false;
						break;
				}
			}

			function resetMovingElementPosition() {
				if (status.transitionIsPlaying) return true;
				status.transitionIsPlaying = true;
				var me = triggerCallBackOptions.movingElement;
				me.style.transition = 'transform '+this.options.durationForResettingPosition+'s ease-out';
				me.addEventListener('transitionend', removeTransitionEndHandler);

				restoreMovingElement();
			}

			function removeTransitionEndHandler() {
				var me = triggerCallBackOptions.movingElement;
				me.removeEventListener('transitionend', removeTransitionEndHandler);
				restoreMovingElementTransition();
			}

			function detectValidDragging(event) {
				var _E = status.mouseDownEvent;
				if (!_E) return false;

				var x1 = _E.pageX;
				var y1 = _E.pageY;

				var x2 = event.pageX;
				var y2 = event.pageY;

				var dx = x2 - x1;
				var dy = y2 - y1;

				var dxA = Math.abs(dx);
				var dyA = Math.abs(dy);


				if (!status.draggingDirectionHasBeenDecided) {
					var hasDraggedFarEnough = dy*dy + dx*dx >= 50;
					if (hasDraggedFarEnough) {
						status.draggingDirectionHasBeenDecided = true;
						switch (this.options.triggerDirection) {
							case 'leftwards':
								status.isDraggingAlongTriggerDirection = dx < -5 && dxA > dyA*3;
								status.draggingDirectionIsNegative = dx < 0;
								break;

							case 'rightwards':
								status.isDraggingAlongTriggerDirection = dx >  5 && dxA > dyA*3;
								status.draggingDirectionIsNegative = dx < 0;
								break;

							case 'upwards':
								status.isDraggingAlongTriggerDirection = dy < -5 && dyA > dxA*3;
								status.draggingDirectionIsNegative = dy < 0;
								break;

							default:
							case 'downwards':
								status.isDraggingAlongTriggerDirection = dy >  5 && dyA > dxA*3;
								status.draggingDirectionIsNegative = dy < 0;
								break;
						}
					}
				} else if (status.isDraggingAlongTriggerDirection) {
					updateMovingElementPositionAndDealWithTrigger.call(this, dx, dy, dxA, dyA);
				}
			}

			function updateMovingElementPositionAndDealWithTrigger(dx, dy, dxA, dyA) {
				var me = triggerCallBackOptions.movingElement;
				var style = me. style;

				style.transitionProperty = 'none';
				style.webkitTouchCallout = 'none';
				style.webkitUserSelect = 'none';
				style.khtmlUserSelect = 'none';
				style.mozUserSelect = 'none';
				style.msUserSelect = 'none';
				style.userSelect = 'none';

				var maxOffset, maxDraggingLength, delta, deltaAbs, triggerLength, triggerResetLength, tranlateAxis, screenSize, clickCoord;
				if (status.draggingDirectionIsHorizontal) {
					maxOffset = this.options.maxOffsetX;
					triggerLength = this.options.triggerX;
					triggerResetLength = this.options.triggerResetX;
					delta = dx;
					deltaAbs = dxA;
					tranlateAxis = 'X';
					screenSize = window.innerWidth;
					clickCoord = status.mouseDownEvent.pageX;
				} else {
					maxOffset = this.options.maxOffsetY;
					triggerLength = this.options.triggerY;
					triggerResetLength = this.options.triggerResetY;
					delta = dy;
					deltaAbs = dyA;
					tranlateAxis = 'Y';
					screenSize = window.innerHeight;
					clickCoord = status.mouseDownEvent.pageY;
				}


				var targetOffset = 0;
				var isNeg = status.draggingDirectionIsNegative;
				if ((isNeg && delta > 0) || (!isNeg && delta < 0)) {
					// targetOffset = 0;
				} else {
					targetOffset = delta;

					var draggingFalloffStartPoint = 5;
					if (deltaAbs > draggingFalloffStartPoint) {
						maxDraggingLength = Math.max(draggingFalloffStartPoint, (isNeg ? clickCoord : (screenSize - clickCoord)) * 0.6);
						var rawRatio = Math.min(1, (deltaAbs - draggingFalloffStartPoint) / maxDraggingLength);
						targetOffset = rawRatio * (maxOffset - draggingFalloffStartPoint) + draggingFalloffStartPoint;
						if (isNeg) targetOffset = -targetOffset;
					}
				}

				if (Math.abs(targetOffset) >= maxOffset) { // in case accuracy were not promised
					targetOffset = isNeg ? -maxOffset : maxOffset;
				}

				me.style.transform = 'translate'+tranlateAxis+'('+targetOffset+'px)';



				var mayTrigger      = deltaAbs >= triggerLength;
				var mayResetTrigger = deltaAbs <= triggerResetLength;



				if (mayTrigger) {
					if (!status.justTriggered) {
						status.triggerCount++;
						status.justTriggered = true;

						if (status.triggerCount === 1 && typeof this.onFirstTrigger === 'function') {
							this.onFirstTrigger(event, triggerCallBackOptions);
						}

						if (typeof this.onEachTrigger === 'function') {
							this.onEachTrigger(event, triggerCallBackOptions);
						}
					}
				}

				if (status.justTriggered && mayResetTrigger) {
					status.justTriggered = false;
				}
			}

			function init () {
				this.config(initOptions);

				var $_r = $(rootElement);
				$_r
					.on('mousedown', onMouseDown.bind(this))
					.on('mouseup',   onMouseUp  .bind(this))
					.on('mousemove', onMouseMove.bind(this))
				;

				clearStatus();
			}

			init.call(this);
		};


		this.SingleCharacterInputsSet = function (rootElement, initOptions) {
			if (!(rootElement instanceof Node)) {
				throw('Invalid rootElement for constructing a '+this.constructor.name+'.');
			}
			var $allInputs = $(rootElement).find('input.single-char-input').filter(function (index, input) {
				var type = input.type.toLowerCase();
				return type !== 'checkbox' && type !== 'radio';
			});
			if ($allInputs.length < 1) {
				$allInputs.each(function () {
					this.disabled = true;
				});
				throw('Too few input fields for constructing a '+this.constructor.name+'.');
			}

			this.options = {};

			this.validatorsForEachInput = [];

			this.onOneInputClear = undefined;
			this.onAllInputsClear = undefined;
			this.onOneInputFill = undefined;
			this.onAllInputsFill = undefined;
			this.onOneInputInvalid = undefined;
			this.onOneInputValid = undefined;
			this.onAllInputsValid = undefined;

			this.config = function (options) {
				config.call(this, options);
			};
			this.getValue = function () {
				return status.aggregatedValue;
			};
			this.disable = function() {
				$allInputs.each(function () {
					this.disabled = true;
				});
				status.isDisabled = true;
			};
			this.enable = function() {
				$allInputs.each(function () {
					this.disabled = false;
				});
				status.isDisabled = false;
			};



			var inputForAggregation = null;
			var defaultValidator = undefined;
			var status = {
				isDisabled: false,
				inputsAreForPassword: false,
				inputsTypeIsNumber: false,
				aggregatedValue: '',
				allInputsValue: [],
				allInputsFilling: [],
				allInputsValidation: []
			};

			function getCaretPosition(ctrl) {
				// http://demo.vishalon.net/getset.htm
				var CaretPos = 0;
				if (document.selection) { // IE Support
					ctrl.focus();
					var sel = document.selection.createRange ();

					sel.moveStart ('character', -ctrl.value.length);

					CaretPos = sel.text.length;
				} else if (ctrl.selectionStart || ctrl.selectionStart == '0') { // Non-IE support
					CaretPos = ctrl.selectionStart;
				}

				return (CaretPos);
			}

			function setCaretPosition(ctrl, pos) {
				if (!ctrl) return false;

				if (typeof pos === 'string' && pos.toLowerCase() === 'end') {
					pos = ctrl.value.length;
				}
				// console.log('desired caret pos:', pos);

				// http://demo.vishalon.net/getset.htm
				if(ctrl.setSelectionRange) {
					ctrl.focus();
					ctrl.setSelectionRange(pos, pos);
				} else if (ctrl.createTextRange) {
					var range = ctrl.createTextRange();
					range.collapse(true);
					range.moveEnd('character', pos);
					range.moveStart('character', pos);
					range.select();
				}
			}

			function clearCaretPositionForInput(input) {
				if (typeof input.caretStatus !== 'object') input.caretStatus = {};
				input.caretStatus.pos = NaN;
				input.caretStatus.isAtLeftEnd = false;
				input.caretStatus.isAtRightEnd = false;
			}

			function updateCaretPositionForInput(input) {
				if (!input || !input.tagName || input.tagName.toLowerCase() !== 'input') return null;

				var caretPos = getCaretPosition(input);

				if (typeof input.caretStatus !== 'object') input.caretStatus = {};
				input.caretStatus.pos = caretPos;
				input.caretStatus.isAtLeftEnd = caretPos === 0;
				input.caretStatus.isAtRightEnd = caretPos === input.value.length;

				return input.caretStatus;
			}

			function defaultValidatorForNumber(value) {
				var isValid = value.match(/^\d$/);
				return !!isValid;
			}

			function inputOnFocus(event) {
				var input = event.target;
				// var inputIndex = parseInt(input.dataset.inputIndex);
				updateCaretPositionForInput.call(this, input);
			}

			function inputOnBlur(event) {
				var input = event.target;
				// var inputIndex = parseInt(input.dataset.inputIndex);
				clearCaretPositionForInput(input);
			}

			function inputOnKeyDown(event) {
				if (!event || !event.target) return false;
				event.stopPropagation();

				var k = event.keyCode;
				var input = event.target;
				// console.log('inputOnKeyDown: keyCode: '+k, '\n\tinput['+input.dataset.inputIndex+']', '\tvalue="'+input.value+'"');

				updateCaretPositionForInput.call(this, input);

				if (k === 8) { // baskspace
					input.keyBackspaceWasDown = true;
					input.inputFiledWasEmptyOnBackspaceKeyDown = !input.value;
				}

				if (k === 46) { // delete, either chief or numpad
					input.keyDelWasDown = true;
				}

				if (input.keyBackspaceWasDown || input.keyDelWasDown) {
					// these keys will NOT fire oninput event at all
					input.value = '';
					delete input.keyBackspaceWasDown;
					delete input.keyDelWasDown;
					inputOnValueDecided.call(this, event, false);
				}
			}

			function inputOnInput(event) {
				if (!event || !event.target) return false;
				event.stopPropagation();

				var input = event.target;
				// console.log('inputOnInput:', '\n\tinput['+input.dataset.inputIndex+']', '\tvalue="'+input.value+'"');

				if (input.value.length > 1) {
					if (input.caretStatus.isAtLeftEnd) {
						input.value = input.value.slice(0, 1);
					} else {
						input.value = input.value.slice(-1);
					}
				}

				var inputIsTemporarilyFilled = input.value.length > 0;
				var inputIsValid = inputIsTemporarilyFilled && validateOneInput.call(this, input);

				if (inputIsTemporarilyFilled && !inputIsValid) {
					if (status.inputsAreForPassword) {
						input.value = '';
					}
				}

				inputOnValueDecided.call(this, event, inputIsValid);
			}

			function inputOnKeyUp(event) {
				if (!event || !event.target) return false;
				event.stopPropagation();

				var k = event.keyCode;
				var input = event.target;
				// console.log('inputOnKeyUp: keyCode: '+k, '\n\tinput['+input.dataset.inputIndex+']', '\tvalue="'+input.value+'"');

				if (k === 8) { // baskspace
					if (input.inputFiledWasEmptyOnBackspaceKeyDown) {
						input.shouldChangeFocusToPrevInput = true;
						input.shouldChangeFocusToNextInput = false;
					}
					delete input.inputFiledWasEmptyOnBackspaceKeyDown;
				}

				if (k === 46) { // delete, either chief or numpad
					input.shouldChangeFocusToPrevInput = false;
					input.shouldChangeFocusToNextInput = false;
				}

				var valueIsEmpty = !input.value;

				// console.log('empty?', valueIsEmpty, '\tshould nex?', input.shouldChangeFocusToNextInput,
				// 	'\npos:', input.caretStatus.pos, '\t left?', input.caretStatus.isAtLeftEnd, '\t right?', input.caretStatus.isAtRightEnd);

				if (k === 37) { // left arrow key
					input.shouldChangeFocusToPrevInput = valueIsEmpty || input.caretStatus.isAtLeftEnd;
					input.shouldChangeFocusToNextInput = false;
				}

				if (k === 39) { // right arrow key
					input.shouldChangeFocusToPrevInput = false;
					input.shouldChangeFocusToNextInput = valueIsEmpty || input.caretStatus.isAtRightEnd;
				}


				var focusedInput;
				if (input.shouldChangeFocusToPrevInput) {
					focusedInput = focusPrevInput.call(this, input);
					setCaretPosition(focusedInput, 'end');
				} else if (input.shouldChangeFocusToNextInput) {
					focusedInput = focusNextInput.call(this, input);
					setCaretPosition(focusedInput, 0);
				}

				delete input.shouldChangeFocusToPrevInput;
				delete input.shouldChangeFocusToNextInput;
				delete input.keyWasDot;
			}

			function inputOnValueDecided(event, inputIsValid) {
				inputIsValid = !!inputIsValid;

				var input = event.target;
				var inputIndex = parseInt(input.dataset.inputIndex);

				var inputWasValid = status.allInputsValidation[inputIndex];
				var inputWasFilled = status.allInputsFilling[inputIndex];
				var inputIsFinallyFilled = input.value.length > 0;
				// console.log('\t inputWasFilled:', inputWasFilled, '\t inputIsFinallyFilled:', inputIsFinallyFilled);


				// update input status and aggregatedValue BEFORE calling callbacks
				status.allInputsValue[inputIndex]      = input.value;
				aggregateAllInputsValue.call(this);

				status.allInputsFilling[inputIndex]    = inputIsFinallyFilled;
				status.allInputsValidation[inputIndex] = inputIsValid;


				if (inputIsValid || !inputIsFinallyFilled) {
					$(input).removeClass('invalid');
				} else {
					$(input)   .addClass('invalid');
				}


				if (inputIsFinallyFilled) {
					input.shouldChangeFocusToPrevInput = false;
					input.shouldChangeFocusToNextInput = inputOnFill.call(this, event, inputWasValid);
				}

				if (inputWasFilled && !inputIsFinallyFilled) {
					input.shouldChangeFocusToNextInput = false;
					input.shouldChangeFocusToPrevInput = false;
					inputOnClear.call(this, event, inputWasValid);
				}

				// fire allInputs event handlers AFTER calling callbacks of single input
				aggregateAllInputsStatus.call(this);
			}

			function inputOnFill(event, inputWasValid) {
				// console.log('inputOnFill');
				var input = event.target;
				var inputIndex = parseInt(input.dataset.inputIndex);
				var inputIsValid = status.allInputsValidation[inputIndex];


				if (this.onOneInputFill) this.onOneInputFill(event);


				if (inputIsValid) {
					if (this.onOneInputValid) this.onOneInputValid(event);
				} else {
					if (this.onOneInputInvalid) this.onOneInputInvalid(event);
				}


				if (!inputWasValid && inputIsValid) {
					if (this.onOneInputCorrected) this.onOneInputCorrected(event);
				}

				if (inputWasValid && !inputIsValid) {
					if (this.onOneInputGoWrong) this.onOneInputGoWrong(event);
				}

				var shouldChangeFocus = inputIsValid;
				return shouldChangeFocus;
			}

			function inputOnClear(event, inputWasValid) {
				// console.log('inputOnClear');
				if (this.onOneInputClear) this.onOneInputClear(event);
				// this.onOneInputInvalid && this.onOneInputInvalid(event);
			}

			function validateOneInput(input) {
				// console.log('validateOneInput');
				var inputIndex = parseInt(input.dataset.inputIndex);
				var inputIsValid = input.value.length > 0;
				if (inputIsValid) {
					var validator = this.validatorsForEachInput[inputIndex];
					if (!validator) validator = defaultValidator;
					if (validator) {
						inputIsValid = validator.call(this, input.value);
					}
				}
				return inputIsValid;
			}

			function aggregateAllInputsValue() {
				status.aggregatedValue = status.allInputsValue.join('');
				if (inputForAggregation) {
					inputForAggregation.value = status.aggregatedValue;
					if (typeof inputForAggregation.onUpdateAtHiddenState === 'function') inputForAggregation.onUpdateAtHiddenState();
				}
			}
			function aggregateAllInputsStatus(isCheckingOnLoad) {
				// console.log('aggregateAllInputsStatus');
				var allInputsAreValid = true;
				var allInputsAreFilled = true;
				var allInputsAreCleared = true;
				for (var i = 0; i < $allInputs.length; i++) {
					var inputIsFilled = status.allInputsFilling[i];
					var inputIsValid  = status.allInputsValidation[i];

					if (!inputIsFilled) allInputsAreFilled = false;
					if (inputIsFilled)  allInputsAreCleared = false;
					if (!inputIsValid)  allInputsAreValid = false;
				}

				if (allInputsAreCleared && this.onAllInputsClear) this.onAllInputsClear(isCheckingOnLoad);
				if (allInputsAreFilled  && this.onAllInputsFill ) this.onAllInputsFill (isCheckingOnLoad);
				if (allInputsAreValid   && this.onAllInputsValid) this.onAllInputsValid(isCheckingOnLoad);
			}

			function focusPrevInput(refInput) {
				var inputIndex = parseInt(refInput.dataset.inputIndex);
				var targetElement = $allInputs[inputIndex-1];
				var canFocus = (inputIndex > 0) && !!targetElement;
				if (canFocus) {
					targetElement.focus();
				}
				return canFocus ? targetElement : null;
			}

			function focusNextInput(refInput) {
				var inputIndex = parseInt(refInput.dataset.inputIndex);
				var targetElement = $allInputs[inputIndex+1];
				var canFocus = (inputIndex < $allInputs.length-1) && !!targetElement;
				if (canFocus) {
					targetElement.focus();
				}
				return canFocus ? targetElement : null;
			}

			function config(options) {
				options = options || {};

				if (options.hasOwnProperty('inputForAggregation')) {
					if (options.inputForAggregation instanceof Node) {
						var _el = options.inputForAggregation;
						var tnlc = _el.tagName.toLowerCase();
						if (tnlc === 'input') {
							var type = _el.type.toLowerCase();
							if (_el.type !== 'checkbox' && _el.type !== 'raido') {
								inputForAggregation = options.inputForAggregation;
								_el.type = status.inputsAreForPassword ? 'hidden' : 'hidden';
							}
						}
					} else {
						inputForAggregation = null;
					}
				}

				if (options.hasOwnProperty('defaultValidator')) {
					defaultValidator = (typeof options.defaultValidator === 'function') ? options.defaultValidator : undefined;
				}

				if (status.inputsTypeIsNumber && !defaultValidator) defaultValidator = defaultValidatorForNumber;

				if (Array.isArray(options.validatorsForEachInput)) {
					for (var i = 0; i < options.validatorsForEachInput.length; i++) {
					 var validator = options.validatorsForEachInput[i];
					 if (typeof validator === 'function') this.validatorsForEachInput[i] = validator;
					 else if (typeof validator === null) this.validatorsForEachInput[i] = undefined;
					}
				}

				if (typeof options.onOneInputClear     === 'function') this.onOneInputClear     = options.onOneInputClear;
				if (typeof options.onOneInputFill      === 'function') this.onOneInputFill      = options.onOneInputFill;
				if (typeof options.onOneInputInvalid   === 'function') this.onOneInputInvalid   = options.onOneInputInvalid;
				if (typeof options.onOneInputValid     === 'function') this.onOneInputValid     = options.onOneInputValid;
				if (typeof options.onOneInputCorrected === 'function') this.onOneInputCorrected = options.onOneInputCorrected;
				if (typeof options.onOneInputGoWrong   === 'function') this.onOneInputGoWrong   = options.onOneInputGoWrong;
				if (typeof options.onAllInputsClear    === 'function') this.onAllInputsClear    = options.onAllInputsClear;
				if (typeof options.onAllInputsFill     === 'function') this.onAllInputsFill     = options.onAllInputsFill;
				if (typeof options.onAllInputsValid    === 'function') this.onAllInputsValid    = options.onAllInputsValid;
			}

			function init () {
				var thisController = this;
				var $_r = $(rootElement);

				status.inputsTypeIsNumber   = $_r.hasClass('input-only-digits');
				status.inputsAreForPassword = $_r.hasClass('input-password');

				var inputForAggregation = $_r.find('input.single-char-inputs-aggregator')[0];
				if (inputForAggregation) this.config({
					inputForAggregation: inputForAggregation // might be overrided by initOptions
				});

				this.config(initOptions);

				$allInputs.each(function (index) {
					this.dataset.inputIndex = index;
					this.type = status.inputsAreForPassword ? 'password' : 'text';
					status.allInputsValue[index] = this.value;
					status.allInputsFilling[index] = this.value.length > 0;
					validateOneInput.call(thisController, this);
				});

				aggregateAllInputsStatus.call(this, true);

				// make sure basic setup executed BEFORE binding event listeners
				$allInputs
					.on('focus',    inputOnFocus   .bind(thisController))
					.on('blur',     inputOnBlur    .bind(thisController))
					.on('keydown',  inputOnKeyDown .bind(thisController))
					.on('input',    inputOnInput   .bind(thisController))
					.on('keyup',    inputOnKeyUp   .bind(thisController))
				;

				this.enable();
			}

			init.call(this);
		};
	}).call(this.UI);
}).call(window.webLogicControls);