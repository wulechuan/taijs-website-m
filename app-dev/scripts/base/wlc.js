window.webLogicControls = {};

(function () {
	var wlc = this;


	this.Class = {};
	(function () { // Class

	}).call(this.Class);


	this.DOM = {};
	(function () { // DOM
		this.ANestedInB = function (A, B) {
			if (!(A instanceof Node && B instanceof Node)) return false;

			A = A.parentNode;
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
				if (!testEl || !clickedEl) return true;

				while (clickedEl && clickedEl!==document.body && clickedEl!==testEl) {
					clickedEl = clickedEl.parentNode;
				}

				return testEl !== clickedEl;
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
			}

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
		}


		this.DraggingController = function(rootElement, initOptions) {
			if (!(rootElement instanceof Node)) {
				throw('Invalid rootElement for constructing a '+this.constructor.name+'.');
			}

			this.options = {
				durationForResettingPosition: 0.4,
				maxOffsetX: 120,
				maxOffsetY: 180,
				triggerX: 60,
				triggerY: 90,
				triggerDirection: 'downwards'
			};

			this.onFirstTrigger = undefined;
			this.onEachTrigger = undefined;

			this.config = function (options) {
				config.call(this, options);
			};

			var status = {
				triggerCount: 0,
				hasTriggeredAtLeastOnce: false,
				justTriggered: false,
				mouseDownEvent: null,
				draggingDirectionIsHorizontal: undefined,
				draggingDirectionIsNegative: undefined,
				isDraggingAlongTriggerDirection: false,
				draggingDirectionHasBeenDecided: false
			};

			var data = {
				movingElementOldInlineTransform: ''
			};

			var triggerCallBackOptions = {
				rootElement: rootElement,
				movingElement: rootElement,
				status: status
			};

			function onMouseDown(event) {
				prepareDraggingOnMouseDown.call(this, event);
			}

			function onMouseUp() {
				if (status.isDraggingAlongTriggerDirection) {
					resetPositionOnMouseUp.call(this);
				}
				clearStatus();
			}

			function onMouseMove(event) {
				if (status.shouldCancelDragging) {
					clearStatus();
				} else {
					tryToTriggerOnMouseMove.call(this, event);
				}
			}




			function config(options) {
				options = options || {};

				if (options.hasOwnProperty('movingElement')) {
					var _r = rootElement;
					var me = options.movingElement;
					if (me instanceof Node) {
						if (wlc.DOM.ANestedInB(_r, me)) {
							console.warn('DraggingController: The rootElement is a descendant of the movingElement.');
						}
					} else if (me === null) {
						me = _r;
					} else {
						me = undefined;
					}

					if (me) {
						var cbo = triggerCallBackOptions;

						if (cbo.movingElement instanceof Node) {
							restoreMovingElement();
						}

						cbo.movingElement = me;
						data.movingElementOriginalInlineTransform = me.style.transform;
						data.movingElementOriginalInlineTransition = me.style.transition;

						me.style.transition = 'none';

						if (status.mouseDownEvent) status.shouldCancelDragging = true;
					}
				}

				switch (options.triggerDirection) {
					case 'leftwards':
					case 'rightwards':
					case 'upwards':
					case 'downwards':
						this.options.triggerDirection = options.triggerDirection;
						break;
					default:
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
				triggerCallBackOptions.movingElement.style.transform = data.movingElementOriginalInlineTransform;
				triggerCallBackOptions.movingElement.style.transition = data.movingElementOriginalInlineTransition;
			}

			function clearStatus() {
				status.shouldCancelDragging = false;
				status.triggerCount = 0;
				status.hasTriggeredAtLeastOnce = false;
				status.justTriggered = false;
				status.mouseDownEvent = null;
				status.draggingDirectionIsHorizontal = undefined;
				status.draggingDirectionIsNegative = undefined;
				status.isDraggingAlongTriggerDirection = false;
				status.draggingDirectionHasBeenDecided = false;
			}

			function prepareDraggingOnMouseDown(event) {
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

			function resetPositionOnMouseUp() {
				var me = triggerCallBackOptions.movingElement;
				me.style.transition = 'transform '+this.options.durationForResettingPosition+'s ease-out';
				me.addEventListener('transitionend', _removeTransitionEndHandler);

				me.style.transform = data.movingElementOriginalInlineTransform;

				function _removeTransitionEndHandler() {
					me.removeEventListener('transitionend', _removeTransitionEndHandler);
					me.style.transition = data.movingElementOriginalInlineTransition;
				}
			}

			function tryToTriggerOnMouseMove (event) {
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
								status.draggingDirectionIsNegative = status.isDraggingAlongTriggerDirection && dx < 0;
								break;

							case 'rightwards':
								status.isDraggingAlongTriggerDirection = dx >  5 && dxA > dyA*3;
								status.draggingDirectionIsNegative = status.isDraggingAlongTriggerDirection && dx < 0;
								break;

							case 'upwards':
								status.isDraggingAlongTriggerDirection = dy < -5 && dyA > dxA*3;
								status.draggingDirectionIsNegative = status.isDraggingAlongTriggerDirection && dy < 0;
								break;

							default:
							case 'downwards':
								status.isDraggingAlongTriggerDirection = dy >  5 && dyA > dxA*3;
								status.draggingDirectionIsNegative = status.isDraggingAlongTriggerDirection && dy < 0;
								break;
						}
					}
				} else if (status.isDraggingAlongTriggerDirection) {
					var max, delta, deltaAbs, triggerLength, triggerResetLength, transformFunctionName;
					if (status.draggingDirectionIsHorizontal) {
						max = this.options.maxOffsetX;
						triggerLength = this.options.triggerX;
						triggerResetLength = this.options.triggerResetX;
						delta = dx;
						deltaAbs = dxA;
						transformFunctionName = 'translateX';
					} else {
						max = this.options.maxOffsetY;
						triggerLength = this.options.triggerY;
						triggerResetLength = this.options.triggerResetY;
						delta = dy;
						deltaAbs = dyA;
						transformFunctionName = 'translateY';
					}


					var targetOffset = delta;
					if (deltaAbs >= max) {
						targetOffset = status.draggingDirectionIsNegative ? -max : max;
					}
					if (status.draggingDirectionIsNegative) {
						if (delta > 0) targetOffset = 0;
					} else {
						if (delta < 0) targetOffset = 0;
					}
					triggerCallBackOptions.movingElement.style.transform = transformFunctionName+'('+targetOffset+'px)';



					var mayTrigger      = deltaAbs >= triggerLength;
					var mayResetTrigger = deltaAbs <= triggerResetLength;



					if (mayTrigger) {
						var _shouldSkipCountInc = false;
						if (!status.hasTriggeredAtLeastOnce) {
							status.hasTriggeredAtLeastOnce = true;
							status.triggerCount = 1;
							_shouldSkipCountInc = true;
							if (typeof this.onFirstTrigger === 'function') this.onFirstTrigger(event, triggerCallBackOptions);
						}

						if (!status.justTriggered) {
							if (!_shouldSkipCountInc) status.triggerCount++;
							status.justTriggered = true;
							if (typeof this.onEachTrigger === 'function') this.onEachTrigger(event, triggerCallBackOptions);
						}
					}

					if (status.justTriggered && mayResetTrigger) {
						status.justTriggered = false;
					}
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
	}).call(this.UI);
}).call(window.webLogicControls);