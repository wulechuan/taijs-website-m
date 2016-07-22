window.webLogicControls = {};

(function () {
	var wlc = this;
	var nilFunction = function () {};


	var AbstractClass = {};
	this.AbstractClass = AbstractClass;
	(function () { // AbstractClass

	}).call(AbstractClass);


	var WCU = {};
	this.CoreUtilities = WCU;
	(function () { // CoreUtilities
		if (window.console && typeof window.console.log === 'function') {
			window.c = window.console;
			c.l = c.log;
			c.t = c.trace;
			c.w = c.warn;
			c.e = c.error;
		} else {
			window.c = {
				l: nilFunction,
				t: nilFunction,
				w: nilFunction,
				e: nilFunction
			};
		}

		var setValue = {};
		this.setValue = setValue;
		(function () {
			function updateSimpleValue(recursiveDepth, typeString, targetObject, key, sourceValue, allowToRemoveTargetValue, valueParser) {
				var resultStates = {
					newValueHasBeenTaken: false,
					oldValueHasBeenRemoved: false,
					valueHasBeenChanged: false,
					valueHasBeenCreated: false,
					valueTypeChanged: false,
					inputValueWasInvalid: false
				};
				// The value is NOT necessarily to change for newValueHasBeenTaken to be true.
				// for example:
				//     at begining:
				//         targetObject.propertyA === 3
				//     then:
				//         targetObject.propertyA = 3
				// In this situation, the newValueHasBeenTaken is true even if the values before and after this action happen to be the same.

				allowToRemoveTargetValue = !!allowToRemoveTargetValue;

				var oldValueExisted = targetObject.hasOwnProperty(key);
				var oldValue = targetObject[key];
				var targetValueOldTypeWrong = oldValueExisted && typeof oldValue !== typeString;
				var warningMessage = 'Property "'+key+'" has been set to a "'+typeString+'" value. Note that the old value was of type "'+typeof targetObject[key]+'".';

				if (!key || typeof key !== 'string' || typeof targetObject !== 'object' || !targetObject) {
					throw('Invalid targetObject or key provided.');
				} else {
					if (typeof sourceValue === 'function') {

						resultStates.inputValueWasInvalid = true;

					} else if (typeof sourceValue === 'undefined') {

						if (allowToRemoveTargetValue) {

							/* *********************************** */
							delete targetObject[key];
							/* *********************************** */

							resultStates.oldValueHasBeenRemoved = oldValueExisted;
							resultStates.valueHasBeenChanged = oldValueExisted && typeof oldValue !== 'undefined';
						} else {
							resultStates.inputValueWasInvalid = true;
						}

					} else if (sourceValue === null) {

						if (allowToRemoveTargetValue) {

							/* *********************************** */
							delete targetObject[key];
							/* *********************************** */

							resultStates.oldValueHasBeenRemoved = oldValueExisted;
							resultStates.valueHasBeenChanged = oldValue !== null;
						} else {
							resultStates.inputValueWasInvalid = true;
						}

					} else {

						if (typeof sourceValue !== 'object') {
							var parsedResult;
							if (typeof valueParser !== 'function') {
								parsedResult = {
									isValid: true,
									value: sourceValue
								};
							} else {
								parsedResult = valueParser(sourceValue);
							}

							if (parsedResult.isValid) {

								/* *********************************** */
								targetObject[key] = parsedResult.value; 
								/* *********************************** */

								resultStates.newValueHasBeenTaken = true;
								resultStates.valueHasBeenChanged = targetObject[key] !== oldValue;
								resultStates.valueHasBeenCreated = !oldValueExisted;

								if (targetValueOldTypeWrong) {
									resultStates.valueTypeChanged = true;
									console.warn(warningMessage);
								}
							} else {
								resultStates.inputValueWasInvalid = true;
							}

						} else if (typeof sourceValue === 'object' && sourceValue !== null && sourceValue.hasOwnProperty(key)) {
							if (recursiveDepth && recursiveDepth > 0) {
								resultStates = updateSimpleValue(recursiveDepth-1, typeString, targetObject, key, sourceValue[key], allowToRemoveTargetValue, valueParser);
							} else {
								resultStates.inputValueWasInvalid = true;
							}
						}

					}
				}

				return resultStates;
			}

			this.boolean = function (targetObject, key, sourceValue, allowToRemoveTargetValue) {
				return updateSimpleValue(
					1,
					'boolean',
					targetObject,
					key,
					sourceValue,
					allowToRemoveTargetValue,
					function (value) {
						return {
							isValid: true,
							value: !!value
						};
					}
				);
			};
			this.number = function (targetObject, key, sourceValue, allowToRemoveTargetValue, allowNaNValue, customParser) {
				return updateSimpleValue(
					1,
					'number',
					targetObject,
					key,
					sourceValue,
					allowToRemoveTargetValue,
					function (value) {
						var result = {
							isValid: true,
							value: value
						};
						result.value = parseFloat(value);
						result.isValid = !!allowNaNValue || !isNaN(result.value);
						if (result.isValid && typeof customParser === 'function') {
							result = customParser(value);
						}
						return result;
					}
				);
			};
			this.numberPositive = function (targetObject, key, sourceValue, allowToRemoveTargetValue) {
				return this.number(
					targetObject, key, sourceValue, allowToRemoveTargetValue,
					false,
					function (value) {
						return {
							isValid: value > 0,
							value: value
						};
					}
				);
			};
			this.numberNonNegative = function (targetObject, key, sourceValue, allowToRemoveTargetValue) {
				return this.number(
					targetObject, key, sourceValue, allowToRemoveTargetValue,
					false,
					function (value) {
						return {
							isValid: value >= 0,
							value: value
						};
					}
				);
			};
			this.numberNoLessThan = function (targetObject, key, sourceValue, allowToRemoveTargetValue, limit) {
				return this.number(
					targetObject, key, sourceValue, allowToRemoveTargetValue,
					false,
					function (value) {
						limit = parseFloat(limit);
						var limitValid = !isNaN(limit);

						if (!limitValid) {
							throw('Invalid limitation provided while setting value to a number no less than the limitation.');
						}

						return {
							isValid: value >= limit,
							value: value
						};
					}
				);
			};
			this.numberLessThan = function (targetObject, key, sourceValue, allowToRemoveTargetValue, limit) {
				return this.number(
					targetObject, key, sourceValue, allowToRemoveTargetValue,
					false,
					function (value) {
						limit = parseFloat(limit);
						var limitValid = !isNaN(limit);

						if (!limitValid) {
							throw('Invalid limitation provided while setting value to a number less than the limitation.');
						}

						return {
							isValid: value < limit,
							value: value
						};
					}
				);
			};
			this.numberInRange = function (targetObject, key, sourceValue, allowToRemoveTargetValue, rangeA, rangeB) {
				return this.number(
					targetObject, key, sourceValue, allowToRemoveTargetValue,
					false,
					function (value) {
						rangeA = parseFloat(rangeA);
						rangeB = parseFloat(rangeB);

						var rangeAValid = !isNaN(rangeA);
						var rangeBValid = !isNaN(rangeB);

						if (!rangeAValid || !rangeBValid) {
							throw('Invalid range provided while setting value to a number with range.');
						}

						var start = Math.min(rangeA, rangeB);
						var end = Math.max(rangeA, rangeB);

						return {
							isValid: (value >= start) && (value < end),
							value: value
						};
					}
				);
			};
		}).call(setValue);
	}).call(WCU);


	var DOM = {};
	this.DOM = DOM;
	(function () { // DOM
		this.ANestedInB = function (A, B, considerAisBAsTrue) {
			if (!(A instanceof Node && B instanceof Node)) return false;

			if (!considerAisBAsTrue) A = A.parentNode;
			while (A.tagName && A!==document.body && A!==B) {
				A = A.parentNode;
			}

			return A===B;
		};
	}).call(DOM);


	var UI = {};
	this.UI = UI;
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


		this.Menu_NOT_DONE_YET = function Menu(rootElement, initOptions) {
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


		this.DraggingController = function DraggingController(rootElement, initOptions) {
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


		this.SingleCharacterInputsSet = function SingleCharacterInputsSet(rootElement, initOptions) {
			if (
				!(rootElement instanceof Node) || 
				rootElement === document || 
				rootElement === document.body || 
				rootElement === document.documentElement
			) {
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
			this.clear = function () {
				// var thisController = this;
				$allInputs.each(function (index) {
					this.value = '';
					status.allInputsValue[index] = '';
					status.allInputsFilling[index] = false;
					status.allInputsValidation[index] = false;
					// status.allInputsValidation[index] = validateOneInput.call(thisController, this);
				});
				aggregateAllInputsValue.call(this);
				aggregateAllInputsStatus.call(this);
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
					this.readOnly = false;
				});
				status.isDisabled = false;
			};
			this.focus = function() {
				$allInputs[0].focus();
			};


			var inputForAggregation = null;
			var inputToChangeFocusOn = null;
			var defaultValidator;
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

				inputToChangeFocusOn = null;

				input.newValueIsValid = false;
				input.onInputEventDispatched = false;

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
					inputOnValueDecided.call(this, event);
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
					if (status.inputsTypeIsNumber) {
						input.value = '';
					}
				}

				input.onInputEventDispatched = true;
				input.newValueIsValid = inputIsValid;
			}

			function inputOnKeyUp(event) {
				if (!event || !event.target) return false;
				event.stopPropagation();

				var k = event.keyCode;
				var input = event.target;
				// console.log('inputOnKeyUp: keyCode: '+k, '\n\tinput['+input.dataset.inputIndex+']', '\tvalue="'+input.value+'"');

				var focusMovingDirectionIsLeft = false;
				if (k === 8) { // baskspace
					if (input.inputFiledWasEmptyOnBackspaceKeyDown) {
						focusMovingDirectionIsLeft = true;
						inputToChangeFocusOn = getPrevInputOf.call(this, input);
					}
					delete input.inputFiledWasEmptyOnBackspaceKeyDown;
				}

				if (k === 46) { // delete, either chief or numpad
					inputToChangeFocusOn = null;
				}

				var valueIsEmpty = !input.value;

				// console.log('empty?', valueIsEmpty, '\tshould nex?', input.shouldChangeFocusToNextInput,
				// 	'\npos:', input.caretStatus.pos, '\t left?', input.caretStatus.isAtLeftEnd, '\t right?', input.caretStatus.isAtRightEnd);

				if (k === 36) { // home key
					focusMovingDirectionIsLeft = true;
					inputToChangeFocusOn = getFirstInput.call(this);
				}

				if (k === 35) { // end key
					focusMovingDirectionIsLeft = false;
					inputToChangeFocusOn = getLastInput.call(this);
				}

				if (k === 37) { // left arrow key
					focusMovingDirectionIsLeft = true;
					if (valueIsEmpty || input.caretStatus.isAtLeftEnd) {
						inputToChangeFocusOn = getPrevInputOf.call(this, input);
					}
				}

				if (k === 39) { // right arrow key
					focusMovingDirectionIsLeft = false;
					if (valueIsEmpty || input.caretStatus.isAtRightEnd) {
						inputToChangeFocusOn = getNextInputOf.call(this, input);
					}
				}

				inputOnValueDecided.call(this, event);

				delete input.newValueIsValid;
				delete input.onInputEventDispatched;

				if (inputToChangeFocusOn !== input) {
					focusInput.call(this, inputToChangeFocusOn);
					setCaretPosition(inputToChangeFocusOn, (focusMovingDirectionIsLeft || k === 35) ? 'end' : 0);
				}
			}

			function inputOnValueDecided(event) {
				var input = event.target;
				var inputIndex = parseInt(input.dataset.inputIndex);
				var inputOldValue = status.allInputsValue[inputIndex];

				var inputValueChanged = !!input.onInputEventDispatched || input.value !== inputOldValue;

				if (!inputValueChanged) return true;

				var inputIsValid = !!input.newValueIsValid;

				var inputWasValid = status.allInputsValidation[inputIndex];
				var inputWasFilled = status.allInputsFilling[inputIndex];
				var inputIsFinallyFilled = input.value.length > 0;
				// console.log('\t inputWasFilled:', inputWasFilled, '\t inputIsFinallyFilled:', inputIsFinallyFilled);


				// update input status and aggregatedValue BEFORE calling callbacks
				status.allInputsValue[inputIndex]      = input.value;
				aggregateAllInputsValue.call(this);

				status.allInputsFilling[inputIndex]    = inputIsFinallyFilled;
				status.allInputsValidation[inputIndex] = inputIsValid;
				aggregateAllInputsStatus.call(this);


				if (inputIsValid || !inputIsFinallyFilled) {
					$(input).removeClass('invalid');
				} else {
					$(input)   .addClass('invalid');
				}


				if (inputIsFinallyFilled) {
					inputOnFill.call(this, event, inputWasValid);
					inputToChangeFocusOn = getNextInputOf.call(this, input);
				}

				if (inputWasFilled && !inputIsFinallyFilled) {
					inputOnClear.call(this, event, inputWasValid);
					inputToChangeFocusOn = null;
				}

				// fire allInputs event handlers AFTER calling callbacks of single input
				dispatchEventsThatObservingAllInputs.call(this);
			}

			function inputOnFill(event, inputWasValid) {
				// console.log('inputOnFill');
				var input = event.target;
				var inputIndex = parseInt(input.dataset.inputIndex);
				var inputIsValid = status.allInputsValidation[inputIndex];


				if (this.onOneInputFill) this.onOneInputFill(event, status);


				if (inputIsValid) {
					if (this.onOneInputValid) this.onOneInputValid(event, status);
				} else {
					if (this.onOneInputInvalid) this.onOneInputInvalid(event, status);
				}


				if (!inputWasValid && inputIsValid) {
					if (this.onOneInputCorrected) this.onOneInputCorrected(event, status);
				}

				if (inputWasValid && !inputIsValid) {
					if (this.onOneInputGoWrong) this.onOneInputGoWrong(event, status);
				}
			}

			function inputOnClear(event/*, inputWasValid*/) {
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
				// console.trace('aggregateAllInputsStatus');
				status.allInputsAreValid   = true;
				status.allInputsAreFilled  = true;
				status.allInputsAreCleared = true;
				for (var i = 0; i < $allInputs.length; i++) {
					var inputIsFilled = status.allInputsFilling[i];
					var inputIsValid  = status.allInputsValidation[i];

					if (!inputIsFilled) status.allInputsAreFilled  = false;
					if (inputIsFilled)  status.allInputsAreCleared = false;
					if (!inputIsValid)  status.allInputsAreValid   = false;
				}
			}
			function dispatchEventsThatObservingAllInputs(isCheckingOnLoad) {
				// console.log('dispatchEventsThatObservingAllInputs');
				if (status.allInputsAreCleared && this.onAllInputsClear) this.onAllInputsClear(status.aggregatedValue, status, isCheckingOnLoad);
				if (status.allInputsAreFilled  && this.onAllInputsFill ) this.onAllInputsFill (status.aggregatedValue, status, isCheckingOnLoad);
				if (status.allInputsAreValid   && this.onAllInputsValid) this.onAllInputsValid(status.aggregatedValue, status, isCheckingOnLoad);
			}

			function getPrevInputOf(refInput) {
				return $allInputs[parseInt(refInput.dataset.inputIndex)-1];
			}

			function getNextInputOf(refInput) {
				return $allInputs[parseInt(refInput.dataset.inputIndex)+1];
			}

			function getFirstInput() {
				return $allInputs[0];
			}

			function getLastInput() {
				return $allInputs[$allInputs.length-1];
			}

			function focusInput(input) {
				if (input && typeof input.focus === 'function') {
					input.focus();
				}
				return input;
			}

			function config(options) {
				options = options || {};

				if (options.hasOwnProperty('inputForAggregation')) {
					if (options.inputForAggregation instanceof Node) {
						var _el = options.inputForAggregation;
						var tnlc = _el.tagName.toLowerCase();
						if (tnlc === 'input') {
							var type = _el.type.toLowerCase();
							if (type !== 'checkbox' && type !== 'raido') {
								inputForAggregation = options.inputForAggregation;
								_el.type = status.inputsAreForPassword ? 'hidden' : 'hidden';
								inputForAggregation.readOnly = false; // important
								inputForAggregation.disabled = false; // in case it is associated with a form
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
					this.autocomplete = 'off';
					this.dataset.inputIndex = index;
					this.type = status.inputsAreForPassword ? 'password' : 'text';
					status.allInputsValue[index] = this.value;
					status.allInputsFilling[index] = this.value.length > 0;
					validateOneInput.call(thisController, this);
				});

				aggregateAllInputsStatus.call(this, true);
				dispatchEventsThatObservingAllInputs.call(this, true);

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


		this.ProgressRing = function ProgressRing(rootElement, initOptions) {
			if (
				!(rootElement instanceof Node) || 
				rootElement === document || 
				rootElement === document.body || 
				rootElement === document.documentElement
			) {
				throw('Invalid rootElement for constructing a '+this.constructor.name+'.');
			}

			// $(rootElement).addClass('uses-css-clip');

			this.options = {
				takeLastQueuedDegreeOnly: true,
				useTransitions: true,
				transitionsTotalDuration: 2.51219
			};

			this.config = config.bind(this);
			this.setDegreeTo = setDegreeTo.bind(this);
			this.setPercentageTo = setPercentageTo.bind(this);
			this.setDegreeViaHTMLAttribute = function () {
				this.setDegreeTo('html-attribute-value');
			};

			var half1, half2, pKeyTransitionDuration;

			var halves = [];
			var half1Settings = { index: 1 };
			var half2Settings = { index: 2 };

			var currentDegree = 0;
			var status = {
				isRunning: false,
				queuedDegrees: []
			};

			init.call(this);

			function init() {
				var thisController = this;
				this.config(initOptions);
				prepareDoms();
				currentDegree = _parseDegreeVia(currentDegree);

				if (initOptions && !!initOptions.disableInitialUpdate) {
				} else {
					setTimeout(function () {
						thisController.setDegreeViaHTMLAttribute();
					}, 0);
				}
			}

			function prepareDoms () { // add or remve doms as needed
				var $halfMasks = $(rootElement).find('> .half-mask');
				var count, i, j, _mask, $half, _half;

				if ($halfMasks.length < 2) {
					count = 2 - $halfMasks.length;
					var tagName = 'B';
					if (count===1) tagName = $halfMasks[0].tagName;

					for (i = 0; i < count; i++) {
						_mask = document.createElement(tagName);
						_mask.className = 'half-mask';

						$halfMasks.push(_mask);
						rootElement.appendChild(_mask);
					}
				} else if ($halfMasks.length > 2) {
					for (i = 2; i < $halfMasks.length; i++) {
						_mask = $halfMasks[i];
						rootElement.removeChild(_mask);
					}
				}


				for (i = 0; i < $halfMasks.length; i++) {
					_mask = $halfMasks[i];
					$half = $(_mask).find('> .half');
					if ($half.length < 1) {
						_half = document.createElement('i');
						_half.className = 'half';

						$half.push(_half);
						_mask.appendChild(_half);
					} else {
						_half = $half[0];
						if ($half.length > 1) {
							for (j = 1; j < $half.length; j++) {
								_mask.removeChild(_half);
							}
						}
					}

					halves.push(_half);
				}

				half1 = halves[0];
				half2 = halves[1];

				$(half1.parentNode).addClass('half-1').removeClass('half-2');
				$(half2.parentNode).addClass('half-2').removeClass('half-1');

				var _S = half1.style;
				var possibleKeyPrefixes = [
					'',
					'webkit',
					'ms',
					'moz'
				];

				var keyName = 'transitionDuration';
				for (var k = 0; k < possibleKeyPrefixes.length; k++) {
					var pre = possibleKeyPrefixes[k];
					var key;
					if (!pre) {
						key = keyName;
					} else {
						key = pre + keyName.slice(0, 1).toUpperCase() + keyName.slice(1);
					}
					if (typeof _S[key] === 'string') {
						pKeyTransitionDuration = key;
						break;
					}
				}

				half1.style.transform = 'rotate(180deg)';
				half2.style.transform = 'rotate(0deg)';

				half1Settings.dom = half1;
				half1Settings.style = half1.style;

				half2Settings.dom = half2;
				half2Settings.style = half2.style;
			}

			function config(options) {
				if (typeof options !== 'object' || !options) return;

				if (options.hasOwnProperty('disableInitialUpdate')) {
					this.options.disableInitialUpdate = !! options.disableInitialUpdate;
				}

				if (options.hasOwnProperty('useTransitions')) {
					this.options.useTransitions = !! options.useTransitions;
				}

				if (options.hasOwnProperty('takeLastQueuedDegreeOnly')) {
					this.options.takeLastQueuedDegreeOnly = !! options.takeLastQueuedDegreeOnly;
				}

				var _num = parseFloat(options.transitionsTotalDuration);
				if (!isNaN(_num) && _num > 0.05) {
					this.options.transitionsTotalDuration = _num;
				}

				// console.log('result', this.options);
			}

			function _parseDegreeVia(degree) {
				var inputWasValid = true;
				var degreeFloatValue = NaN;

				if (typeof degree === 'number' && !isNaN(degree)) {
					degreeFloatValue = degree;
				} else {
					degreeFloatValue = parseFloat(degree);

					if (isNaN(degreeFloatValue)) {
						inputWasValid = false;
						degreeFloatValue = 0;
					} else {
						var stringIsPercentage = !!degree.match(/^\s*[\+\-]?[\d\.]*\d+%\D*\s*$/);

						if (stringIsPercentage) {
							degreeFloatValue = 3.6 * degreeFloatValue;
						}
					}
				}

				var degreeFloatValueSafe = degreeFloatValue % 360;

				degree         = (degreeFloatValue)    .toFixed(3);
				var degreeSafe = (degreeFloatValueSafe).toFixed(3);

				degreeFloatValue     = parseFloat(degree);
				degreeFloatValueSafe = parseFloat(degreeSafe);

				if (degreeFloatValueSafe === 0 && degreeFloatValue >= 359.9999) degreeFloatValueSafe = 360;

				var result = {
					inputWasValid: inputWasValid,
					raw: degreeFloatValue,
					safe: degreeFloatValueSafe
				};
				// console.log(result);

				return result;
			}

			function _getDegreeFromHtml() {
				return _parseDegreeVia(rootElement.getAttribute('data-degree'));
			}

			function setPercentageTo(newPercentage) {
				if (typeof newPercentage === 'string') {
					newPercentage = (parseFloat(newPercentage) || 0) * 0.01;
					// var stringIsPercentage = !!newPercentage.match(/^\s*[\+\-]?[\d\.]*\d+%\D*\s*$/);
					// if (stringIsPercentage) {
					// }
				} else if (typeof newPercentage === 'number' && !isNaN(newPercentage)) {
				} else {
					newPercentage = 0;
				}

				newPercentage = Math.min(0, Math.max(100, newPercentage)) + '%';

				this.setDegreeTo(newPercentage * 360);
			}

			function setDegreeTo(newDegree) {
				queueOneNewDegree.call(this, newDegree);
				doUpdateDegreeFromQueue.call(this);
			}

			function queueOneNewDegree(newDegree) {
				if (newDegree === 'html-attribute-value') {
					newDegree = _getDegreeFromHtml();
				} else if (!newDegree || typeof newDegree === 'number' || newDegree === true) {
					newDegree = _parseDegreeVia(newDegree);
				} else {
					newDegree = _parseDegreeVia(newDegree.raw);
				}

				if (this.options.takeLastQueuedDegreeOnly) {
					status.queuedDegrees.splice(0);
				}
				status.queuedDegrees.push(newDegree);
			}

			function fetchDegreeFromQueue() {
				return status.queuedDegrees.splice(0, 1)[0];
			}

			function doUpdateDegreeFromQueue() {
				if (status.isRunning) {
					return;
				}

				var newDegree = fetchDegreeFromQueue.call(this);
				if (typeof newDegree !== 'object' || typeof newDegree.safe !== 'number' || isNaN(newDegree.safe)) {
					return false;
				}

				var thisController = this;
				status.isRunning = true;

				var oldSafeDegree = currentDegree.safe;
				var newSafeDegree = newDegree.safe;
				var deltaTotalAbs = Math.abs(newSafeDegree - oldSafeDegree);
				var eitherTransitionsIsNecessary = !!this.options.useTransitions && deltaTotalAbs > 1; // at least one degree to change

				// console.log('=== from', oldSafeDegree, 'to', newSafeDegree, '===', deltaTotalAbs, 'transition?', this.options.useTransitions, '\t', this.options.transitionsTotalDuration, 'sec');

				_processHalfSettings(
					half1Settings,
					Math.min(180, oldSafeDegree),
					Math.min(180, newSafeDegree),
					this.options.transitionsTotalDuration
				);
				_processHalfSettings(
					half2Settings,
					Math.max(180, oldSafeDegree),
					Math.max(180, newSafeDegree),
					this.options.transitionsTotalDuration
				);

				function _processHalfSettings (_S, oldSafeDegree, newSafeDegree, totalDuration) {
					_S.oldDegree = oldSafeDegree;
					_S.newDegree = newSafeDegree;
					_S.delta = _S.oldDegree - _S.newDegree;
					_S.deltaAbs = Math.abs(_S.delta);

					if (deltaTotalAbs < 0.001) {
						_S.duration = 0;
					} else {
						_S.duration = totalDuration * _S.deltaAbs / deltaTotalAbs;
					}

					_S.transitionNecessary = eitherTransitionsIsNecessary && _S.duration > 0.01 && _S.deltaAbs > 0.1;
					if (_S.transitionNecessary) {
						_S.style[pKeyTransitionDuration] = _S.duration + 's';
					} else {
						_S.style.transitionProperty = 'none';
					}
					// console.log('transition:', _S.style[pKeyTransitionDuration], _S.deltaAbs+'deg: ', oldSafeDegree, 'to', newSafeDegree);
				}


				var halfA, halfB; // transition of halfA goes BEFORE transition of halfB

				if (oldSafeDegree > 180) {
					halfA = half1Settings;
					halfB = half2Settings;
				} else {
					halfA = half2Settings;
					halfB = half1Settings;
				}

				// console.log('order:', halfA.index, ' >>> ', halfB.index);


				updateHalfA();


				function updateHalfA() {
					// console.log('update A [',halfA.index,']:\t', halfA.oldDegree, '-->', halfA.newDegree, '\ttransition?', halfA.transitionNecessary, '\t\t',halfA.duration,'sec');
					halfA.style.transform = 'rotate('+halfA.newDegree+'deg)';

					if (!halfA.transitionNecessary) {
						updateHalfB();
					} else {
						// console.log('B is waiting for A...');
						halfA.dom.addEventListener('transitionend', onTransitionAEnd);
					}
				}
				function onTransitionAEnd () {
					// console.log('transition A end');
					halfA.dom.removeEventListener('transitionend', onTransitionAEnd);
					updateHalfB();
				}

				function updateHalfB() {
					// console.log('update B [',halfB.index,']:\t', halfB.oldDegree, '-->', halfB.newDegree,  '\ttransition?', halfB.transitionNecessary, '\t\t',halfB.duration,'sec');
					halfB.style.transform = 'rotate('+halfB.newDegree+'deg)';

					if (!halfB.transitionNecessary) {
						onBothHalvesUpdated();
					} else {
						// console.log('finishing is waiting for B...');
						halfB.dom.addEventListener('transitionend', onTransitionBEnd);
					}
				}
				function onTransitionBEnd () {
					// console.log('transition B end');
					halfB.dom.removeEventListener('transitionend', onTransitionBEnd);
					onBothHalvesUpdated();
				}

				function onBothHalvesUpdated() {
					halfA.style[pKeyTransitionDuration] = '';
					halfB.style[pKeyTransitionDuration] = '';
					halfA.style.transitionProperty = '';
					halfB.style.transitionProperty = '';

					rootElement.getAttribute('data-degree', newDegree.raw);
					currentDegree = newDegree;

					status.isRunning = false;
					// console.trace('-------------', currentDegree);

					doUpdateDegreeFromQueue.call(thisController);
				}


				return newDegree;
			}

		};

		this.ProgressRings = function ProgressRings(rootElement, initOptions) {
			if (
				!(rootElement instanceof Node) || 
				rootElement === document || 
				rootElement === document.body || 
				rootElement === document.documentElement
			) {
				throw('Invalid rootElement for constructing a '+this.constructor.name+'.');
			}

			var ringsDom = Array.prototype.slice.apply($(rootElement).find('.ring'));
			if (ringsDom.length < 1) {
				throw('No ring element found under rootElement when constructing a '+this.constructor.name+'.\n rootElement:', rootElement);
			}

			this.options = {
				// takeLastQueuedDegreeOnly: true,
				// useTransitions: true,
				// singleRingTransitionsTotalDuration: NaN,
				perRings: []
			};

			var rings = [];
			this.controllers = {
				rings: rings
			};

			this.createOneRing = createOneRing.bind(this);
			this.config = config.bind(this);
			this.setDegrees = setDegrees.bind(this);
			this.setPercentages = setPercentages.bind(this);

			init.call(this);

			function init() {
				this.config(initOptions, true);

				for (var i = 0; i < ringsDom.length; i++) {
					this.createOneRing(ringsDom[i]);
				}
			}

			function setDegrees(degrees) {
				if (!Array.isArray(degrees)) degrees = [degrees];
				var count = Math.min(degrees.length, rings.length);
				for (var i = 0; i < count; i++) {
					rings[i].setDegreeTo(degrees[i]);
				}
			}

			function setPercentages(percentages) {
				if (!Array.isArray(percentages)) percentages = [percentages];
				var count = Math.min(percentages.length, rings.length);
				for (var i = 0; i < count; i++) {
					rings[i].setPercentageTo(percentages[i]);
				}
			}

			function createOneRing(ringRootElement) {
				var results = evaluateOptionsOfRings.call(this, rings.length);
				var options =results.optionsPerRings[0];
				rings.push(new UI.ProgressRing(ringRootElement, options));
			}

			function config(options, shouldNotConfigRings) {
				if (typeof options !== 'object' || !options) return;

				WCU.setValue.boolean(this.options, 'disableInitialUpdate', options, true);
				WCU.setValue.boolean(this.options, 'useTransitions', options, true);
				WCU.setValue.boolean(this.options, 'takeLastQueuedDegreeOnly', options, true);
				WCU.setValue.numberPositive(this.options, 'singleRingTransitionsTotalDuration', options, true);

				if (options.hasOwnProperty('perRings')) {
					if (typeof options.perRings === 'undefined' || options.perRings === null) {
						this.options.perRings.splice(0, this.options.perRings.length);
					} else {
						var _oprS; // source
						var _oprT = this.options.perRings; // target

						if (typeof options.perRings === 'object') {
							_oprS = options.perRings;
							if (!Array.isArray(_oprS)) _oprS = [_oprS];
						} else {
							_oprS = [];
						}

						for (var i = 0; i < _oprS.length; i++) {
							var _oprSI = _oprS[i];
							var _oprTI = _oprT[i];

							if (typeof _oprSI !== 'object' || !_oprSI) {
								continue;
							}

							if (typeof _oprTI !== 'object' || !_oprTI) {
								_oprT[i] = _oprSI;
								continue;
							}

							WCU.setValue.boolean(_oprTI, 'disableInitialUpdate', _oprSI, true);
							WCU.setValue.boolean(_oprTI, 'useTransitions', _oprSI, true);
							WCU.setValue.boolean(_oprTI, 'takeLastQueuedDegreeOnly', _oprSI, true);
							WCU.setValue.numberPositive(_oprTI, 'singleRingTransitionsTotalDuration', _oprSI, true);
						}
					}
				}

				if (!shouldNotConfigRings) {
					configRings.call(this);
				}

				// console.log('ProgressRings options:', this.options);
			}

			function configRings(indexRangeA, indexRangeB) {
				var results = evaluateOptionsOfRings.call(this, i).optionsPerRings[0];

				indexRangeA = results.indexRangeA; // valid values
				indexRangeB = results.indexRangeB; // valid values
				var optionsPerRings = results.optionsPerRings;

				for (var i = 0; i < optionsPerRings.length; i++) {
					var ring = rings[i];
					if (ring) ring.config(optionsPerRings[i]);
				}
			}

			function evaluateOptionsOfRings(indexRangeA, indexRangeB) {
				var results = {
					indexRangeA: NaN,
					indexRangeB: NaN,
					optionsPerRings: []
				};

				indexRangeA = parseInt(indexRangeA);
				indexRangeB = parseInt(indexRangeB);

				var ringsCount = rings.length;

				var validIndexRangeAProvided = indexRangeA >= 0; // exceeding [rings.length] is allowed
				if (!validIndexRangeAProvided) {
					indexRangeA = 0;
				}
				var validIndexRangeBProvided = indexRangeB >= 0; // exceeding [rings.length] is allowed
				if (!validIndexRangeBProvided) {
					if (validIndexRangeAProvided) {
						indexRangeB = indexRangeA;
					} else {
						indexRangeB = ringsCount - 1;
					}
				}

				var loopStart = Math.min(indexRangeA, indexRangeB);
				var loopEnd = Math.max(indexRangeA, indexRangeB);

				results.indexRangeA = loopStart;
				results.indexRangeB = loopEnd;

				var _oGlobalDefault = this.options;
				var _oprS = this.options.perRings;
				for (var i = loopStart; i <= loopEnd; i++) {
					var _oprSI = _oprS[i];
					var _oprTI = {};

					if (typeof _oprSI !== 'object' || !_oprSI) {
						_oprSI = {};
					}

					var R;

					R = WCU.setValue.boolean(_oprTI, 'disableInitialUpdate', _oprSI);
					if (!R.valueHasBeenCreated) {
						WCU.setValue.boolean(_oprTI, 'disableInitialUpdate', _oGlobalDefault);
					}

					R = WCU.setValue.boolean(_oprTI, 'useTransitions', _oprSI);
					if (!R.valueHasBeenCreated) {
						WCU.setValue.boolean(_oprTI, 'useTransitions', _oGlobalDefault);
					}

					R = WCU.setValue.boolean(_oprTI, 'takeLastQueuedDegreeOnly', _oprSI);
					if (!R.valueHasBeenCreated) {
						WCU.setValue.boolean(_oprTI, 'takeLastQueuedDegreeOnly', _oGlobalDefault);
					}

					R = WCU.setValue.numberPositive(_oprTI, 'transitionsTotalDuration', _oprSI);
					if (!R.valueHasBeenCreated) {
						WCU.setValue.numberPositive(_oprTI, 'transitionsTotalDuration', _oGlobalDefault.singleRingTransitionsTotalDuration);
					}

					// c.l(_oprTI);
					results.optionsPerRings.push(_oprTI);
				}

				return results;
			}
		};
	}).call(UI);
}).call(window.webLogicControls);