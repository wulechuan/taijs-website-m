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
		(function () { // Global Pollution
			if (window.console && typeof window.console.log === 'function') {
				window.C = window.console;
				C.l = C.log;
				C.t = C.trace;
				C.w = C.warn;
				C.e = C.error;
			} else {
				window.C = {
					L: nilFunction,
					T: nilFunction,
					W: nilFunction,
					E: nilFunction
				};
			}
		})();


		var save = {};
		this.save = save;
		(function () {
			function _updateValueSafely(recursiveDepth, typeString, targetObject, key, sourceValue, allowToRemoveTargetValue, valueParser, shouldTrace) {
				var resultStates = {
					newValueHasBeenTaken: false,
					oldValueHasBeenRemoved: false,
					valueHasBeenChanged: false,
					valueHasBeenCreated: false,
					valueTypeChanged: false,
					inputValueWasInvalid: false
				};
				// a valid valueParser MUST return an object like this:
				// {
				//     isValid: boolean,
				//     value: the value, which is NOT necessarily be valid, because we rely on the isValid boolean
				// }

				// The value is NOT necessarily to change for newValueHasBeenTaken to be true.
				// for example:
				//     at begining:
				//         targetObject.propertyA === 3
				//     then:
				//         targetObject.propertyA = 3
				// In this situation, the newValueHasBeenTaken is true even if the values before and after this action happen to be the same.

				allowToRemoveTargetValue = !!allowToRemoveTargetValue;

				var oldKeyExisted = targetObject.hasOwnProperty(key);
				var oldValue = targetObject[key];
				var parsedResult = {
					isValid: false,
					value: sourceValue
				};
				var targetValueOldTypeWrong = oldKeyExisted && typeof oldValue !== typeString;
				var warningMessage = 'Property "'+key+'" has been set to a "'+typeString+'" value. Note that the old value was of type "'+typeof targetObject[key]+'".';

				if (!key || typeof key !== 'string' || typeof targetObject !== 'object' || !targetObject) {
					throw('Invalid targetObject or key provided.');
				} else {
					if (typeof sourceValue === 'function') {

						if (typeString !== 'function') {
							resultStates.inputValueWasInvalid = true;
						} else {

							/* *********************************** */
							parsedResult.isValid = true;
							/* *********************************** */

						}

					} else if (typeof sourceValue === 'undefined') {

						if (allowToRemoveTargetValue) {

							/* *********************************** */
							delete targetObject[key];
							/* *********************************** */

							// here the parsedResult.isValid is still FALSE but the resultStates.inputValueWasInvalid is also FLASE

							resultStates.oldValueHasBeenRemoved = oldKeyExisted;
							resultStates.valueHasBeenChanged = oldKeyExisted && typeof oldValue !== 'undefined';
						} else {
							resultStates.inputValueWasInvalid = true;
						}

					} else if (sourceValue === null) {

						if (allowToRemoveTargetValue) {

							/* *********************************** */
							delete targetObject[key];
							/* *********************************** */

							// here the parsedResult.isValid is still FALSE but the resultStates.inputValueWasInvalid is also FLASE

							resultStates.oldValueHasBeenRemoved = oldKeyExisted;
							resultStates.valueHasBeenChanged = oldValue !== null;
						} else {
							resultStates.inputValueWasInvalid = true;
						}

					} else {

						if (typeof sourceValue !== 'object') {
							if (typeof valueParser !== 'function') {

								/* *********************************** */
								parsedResult.isValid = true; // simple don't parse or validate the soureValue, treating it valid.
								/* *********************************** */

							} else {
								parsedResult = valueParser(sourceValue);
							}
						} else if (typeof sourceValue === 'object' && sourceValue !== null && sourceValue.hasOwnProperty(key)) {
							if (recursiveDepth && recursiveDepth > 0) {
								resultStates = _updateValueSafely(recursiveDepth-1, typeString, targetObject, key, sourceValue[key], allowToRemoveTargetValue, valueParser, shouldTrace);
							} else {
								resultStates.inputValueWasInvalid = true;
							}
						} else {
							resultStates.inputValueWasInvalid = true;
						}

					}
				}

				if (parsedResult.isValid) {

					/* *********************************** */
					targetObject[key] = parsedResult.value; 
					/* *********************************** */

					resultStates.newValueHasBeenTaken = true;
					resultStates.valueHasBeenCreated = !oldKeyExisted;
					resultStates.valueHasBeenChanged = !oldKeyExisted || (targetObject[key] !== oldValue);

					if (targetValueOldTypeWrong) {
						resultStates.valueTypeChanged = true;
						console.warn(warningMessage);
					}
				}

				return resultStates;
			}

			this.boolean = function (targetObject, key, sourceValue, allowToRemoveTargetValue/*, shouldTrace*/) {
				return _updateValueSafely(
					1,
					'boolean',
					targetObject, key, sourceValue, allowToRemoveTargetValue,
					function (value) {
						return {
							isValid: true,
							value: !!value
						};
					}
				);
			};
			this.number = function (targetObject, key, sourceValue, allowToRemoveTargetValue, allowNaNValue, customParser/*, shouldTrace*/) {
				return _updateValueSafely(
					1,
					'number',
					targetObject, key, sourceValue, allowToRemoveTargetValue,
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
			this.numberPositive = function (targetObject, key, sourceValue, allowToRemoveTargetValue/*, shouldTrace*/) {
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
			this.numberNonNegative = function (targetObject, key, sourceValue, allowToRemoveTargetValue/*, shouldTrace*/) {
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
			this.numberNoLessThan = function (targetObject, key, sourceValue, allowToRemoveTargetValue, limit/*, shouldTrace*/) {
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
			this.numberLessThan = function (targetObject, key, sourceValue, allowToRemoveTargetValue, limit/*, shouldTrace*/) {
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
			this.numberInRange = function (targetObject, key, sourceValue, allowToRemoveTargetValue, rangeA, rangeB/*, shouldTrace*/) {
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
			this.string = function (targetObject, key, sourceValue, allowToRemoveTargetValue, allowEmptyString, customParser/*, shouldTrace*/) {
				return _updateValueSafely(
					1,
					'string',
					targetObject, key, sourceValue, allowToRemoveTargetValue,
					function (value) {
						var result = {
							isValid: (typeof value === 'string') && (!!allowEmptyString || value.length > 0),
							value: value
						};
						if (result.isValid && typeof customParser === 'function') {
							result = customParser(value);
						}
						return result;
					}
				);
			};
			this.method = function (targetObject, key, sourceFunction, allowToRemoveExistingFunction/*, shouldTrace*/) {
				return _updateValueSafely(
					1,
					'function',
					targetObject,
					key,
					sourceFunction,
					allowToRemoveExistingFunction
				);
			};
		}).call(save);


		var objectToolkit = {};
		this.objectToolkit = objectToolkit;
		(function () {
			this.destroyInstanceObject = function (obj) {
				if (typeof obj === 'object') {
					for (var p in obj) {
						delete obj[p];
					}

					obj.hasBeenDestroied = true;
				}

				return obj;
			};
		}).call(objectToolkit);


		var stringFormatters = {};
		this.stringFormatters = stringFormatters;
		(function () {
			this.DecimalToChineseNumbers = function DecimalToChineseNumbers(initOptions) {
				var c0s = '〇';
				var c1s = '一';
				var c2s = '二';
				var c3s = '三';
				var c4s = '四';
				var c5s = '五';
				var c6s = '六';
				var c7s = '七';
				var c8s = '八';
				var c9s = '九';
				var c10s = '十';
				var c100s = '百';
				var c1000s = '千';
				var c10000s = '万';
				var cBaseUnitMoneyS = '元';

				var c0t = '零';
				var c1t = '壹';
				var c2t = '贰';
				var c3t = '叁';
				var c4t = '肆';
				var c5t = '伍';
				var c6t = '陆';
				var c7t = '柒';
				var c8t = '捌';
				var c9t = '玖';
				var c10t = '拾';
				var c100t = '佰';
				var c1000t = '仟';
				var c10000t = '萬';
				var cBaseUnitMoneyT = '圆';

				var cBaseUnitRegular = '个';
				var cDot = '点';
				var cYi = '亿';
				var cFractionUnitsMoney = '角分厘豪';
				var cSuffixZheng = '整';


				this.options = { // default values, will be overrided by runtime values
					isMoney: true,
					tenWritesOneTen: false, // 拾写作壹拾；零拾写作零壹拾
					jianXie: false, // 简写
					jianXieLing: false, // 简写零
					jianXieShiBaiQian: false, // 简写十百千
					jianXieWan: false, // 简写万
					jianXieMoneyUnitYuan: false, // 简写元
					fractionMaxDigitsRegular: NaN, // 非货币（钱数）最长小数位数
					fractionMaxDigitsMoney: 2 // 货币（钱数）最长小数位
				};

				this.data = {
					lastGroomedInput: '',
					lastConciseValue: '',
					lastResult: '',
					lastValueHadDot: false
				};

				this.config = config.bind(this);
				this.format = format.bind(this);


				var status = {};


				init.call(this);




				function init() {
					status.isInitializing = true;
					this.config(initOptions, this.options);
					delete status.isInitializing;
				}

				function config(newOptions, targetOptions) {
					var isInitializing = !!status.isInitializing;

					if (typeof targetOptions !== 'object' || !targetOptions) {
						targetOptions = this.options; // by default we config the this.options instead of runtime options
					}
					if (!isInitializing && typeof targetOptions !== 'object') {
						throw('No targetOptions provided.');
					}

					isInitializing = isInitializing && (targetOptions === this.options);


					WCU.save.number(targetOptions, 'fractionMaxDigitsRegular', newOptions, false, true);
					WCU.save.numberNoLessThan(targetOptions, 'fractionMaxDigitsMoney', newOptions, false, 2);

					var saveBool = WCU.save.boolean;

					var R1 = saveBool(targetOptions, 'isMoney', newOptions);
					// C.t('changed?', R1.valueHasBeenChanged, 'isMoney:', targetOptions.isMoney);
					var R4;
					if (R1.valueHasBeenChanged || isInitializing) {
						R4 = saveBool(targetOptions, 'jianXie', !targetOptions.isMoney);
					}

					var R2 = saveBool(targetOptions, 'jianXie', newOptions);
					var R3 = saveBool(targetOptions, 'tenWritesOneTen', newOptions);

					if ((R4 && R4.valueHasBeenChanged) || R2.valueHasBeenChanged || isInitializing) {
						// if (!targetOptions.isMoney) {
						// 	saveBool(targetOptions, 'jianXieLing', targetOptions.jianXie);
						// }

						saveBool(targetOptions, 'jianXieShiBaiQian', targetOptions.jianXie);
						saveBool(targetOptions, 'jianXieWan', targetOptions.jianXie);
						saveBool(targetOptions, 'jianXieMoneyUnitYuan', targetOptions.jianXie);
					}

					saveBool(targetOptions, 'jianXieLing', newOptions);
					saveBool(targetOptions, 'jianXieShiBaiQian', newOptions);
					saveBool(targetOptions, 'jianXieWan', newOptions);
					saveBool(targetOptions, 'jianXieMoneyUnitYuan', newOptions);


					if (R1.valueHasBeenChanged || R3.valueHasBeenChanged || isInitializing) {
						targetOptions.tenWritesOneTen = targetOptions.tenWritesOneTen || targetOptions.isMoney;
					}
				}

				function format(n, optionsOrIsMoney, shouldLog) {
					// http://www.cnblogs.com/zyxzhsh/archive/2010/10/18/1854476.html

					var inputIsValid = true;
					shouldLog = !!shouldLog;


					if (typeof n === 'number') {
						inputIsValid = !isNaN(n);
						n = n.toString();
					} else if (typeof n === 'string') {
						inputIsValid = /^\d*\.?\d*$/.test(n) && n.length > 0; // 允许小数点前后均无数字，故意要求不那么严格
					} else {
						inputIsValid = false;
					}

					if (!inputIsValid) {
						this.data.lastValueHadDot = false;
						this.data.lastGroomedInput = n;
						this.data.lastConciseValue = '';
						this.data.lastResult = '';
						return '';
						// throw('Invalid number to convert to Chinese capital number.');
					}


					var options = {}; // runtime copy


					this.config(this.options, options); // first of all, copy default values into runtime options


					if (typeof optionsOrIsMoney === 'boolean' || typeof optionsOrIsMoney === 'number') {
						this.config({
							isMoney: optionsOrIsMoney
						}, options);
					} else if (typeof optionsOrIsMoney === 'object' && optionsOrIsMoney) { // should handle null object
						this.config(optionsOrIsMoney, options);
					}

					// if (shouldLog) C.l(options);



					n = n
						.replace(/^0+/, '')
						// .replace(/\.$/, '') // we need to record wheather there was a dot within the input
					;



					var c0 = options.jianXieLing ? c0s : c0t;
					var c1 = options.jianXie ? c1s : c1t;
					var c2 = options.jianXie ? c2s : c2t;
					var c3 = options.jianXie ? c3s : c3t;
					var c4 = options.jianXie ? c4s : c4t;
					var c5 = options.jianXie ? c5s : c5t;
					var c6 = options.jianXie ? c6s : c6t;
					var c7 = options.jianXie ? c7s : c7t;
					var c8 = options.jianXie ? c8s : c8t;
					var c9 = options.jianXie ? c9s : c9t;
					var c10 = options.jianXieShiBaiQian ? c10s : c10t;
					var c100 = options.jianXieShiBaiQian ? c100s : c100t;
					var c1000 = options.jianXieShiBaiQian ? c1000s : c1000t;
					var c10000 = options.jianXieWan ? c10000s : c10000t;

					var cBaseUnitMoney = options.jianXieMoneyUnitYuan ? cBaseUnitMoneyS : cBaseUnitMoneyT;

					var cNumbers  = [c0, c1, c2, c3, c4, c5, c6, c7, c8, c9];
					var cIntUnits = (function () {
						var section = c1000+c100+c10+c10000+c1000+c100+c10; // 千百十万千百十
						return section+cYi+section;
					})();




					var fractionMaxDigitsMoneyDecided = cFractionUnitsMoney.length;

					var fractionMaxDigitsMoneyAllowed = parseInt(options.fractionMaxDigitsMoney);
					if (!isNaN(fractionMaxDigitsMoneyAllowed) && fractionMaxDigitsMoneyAllowed>1) {
						fractionMaxDigitsMoneyDecided = Math.min(fractionMaxDigitsMoneyAllowed, fractionMaxDigitsMoneyDecided);
					}



					var cUnits = cIntUnits;
					var fractionMaxDigits;

					if (options.isMoney) {
						cUnits += cBaseUnitMoney; // 追加个位数字单位，即“圆”。
						fractionMaxDigits = fractionMaxDigitsMoneyDecided;
					} else {
						cUnits += cBaseUnitRegular; // 追加个位数字临时占位单位，即“个”。
						fractionMaxDigits = parseInt(options.fractionMaxDigitsRegular);
					}



					var pop = n.indexOf('.'); // position of point

					var nInterger = '';
					var nFractionRaw = '';
					var inputSegmentAfterDot ='';
					var nFraction = '';
					var i; // loop indexer

					if (pop >= 0) {
						nInterger = n.substring(0, pop);
						inputSegmentAfterDot = n.substring(pop+1);

						if (!isNaN(fractionMaxDigits)) {
							inputSegmentAfterDot = n.substr(pop+1, fractionMaxDigits);
						}

						nFractionRaw = inputSegmentAfterDot.replace(/0*$/, '');
					} else {
						nInterger = n;
					}


					if (options.isMoney) {
						if (nFractionRaw.length > 0) {
							cUnits += cFractionUnitsMoney.slice(0, fractionMaxDigits);
							nFraction = (nFractionRaw + '0000000000000000000000000').slice(0, fractionMaxDigits);
						}
						// 钱数小数点后面的各个数字也带单位，为数字位数与单位位数对应，此处须预先补零
					} else {
						nFraction = nFractionRaw;
					}


					var nWithUnit = nInterger;
					if (options.isMoney) {
						nWithUnit += nFraction; // 钱数小数点后面的各个数字也带单位，所以处理方法与整数部分相同
					}

					cUnits = cUnits.slice(-nWithUnit.length);

					var result = '';
					var resultFraction = '';


					var needSuffixZheng = options.isMoney && (nFractionRaw.length < fractionMaxDigits);


					if (shouldLog) {
						C.l(
							'n:', n, '\t pop:', pop,
							'\n\t nInterger:', nInterger,
							'\n\t fractionMaxDigits:', fractionMaxDigits,
							'\n\t nFractionRaw:', nFractionRaw,
							'\n\t nFraction:', nFraction,
							'\n\t nWithUnit:', nWithUnit,
							'\n\t nWithUnit.length:', nWithUnit.length,
							'\n\t cUnits:', cUnits,
							'\n\t needSuffixZheng:', needSuffixZheng
						);
					}


					for (i=0; i < nWithUnit.length; i++) {
						result += cNumbers[nWithUnit.charAt(i)] + cUnits.charAt(i);
					}

					if (!options.isMoney && nFraction.length) { // 还要处理小数部分，常规模式下，小数部分无单位
						resultFraction = cDot;
						for (i=0; i < nFraction.length; i++) {
							resultFraction += cNumbers[nFraction.charAt(i)];
						}
					}

					if (result.length < 1) {
						result = c0 + (options.isMoney ? cBaseUnitMoney : cBaseUnitRegular);
					}
					if (shouldLog) C.l(options.isMoney, result);




					var regexp;



					if (!options.isMoney) {
						// 去除非钱数的临时单位，即“个”
						regexp = new RegExp(cBaseUnitRegular);
						result = result.replace(regexp, '');
						if (shouldLog) C.l('\n'+regexp + ' ----> '+'""'+ '\n\t\t' + result);
					}



					// 取得所有零值的配套单位，例如“零仟零佰”变成“零零”；其中，最新钱数单位暂不处理，因为末尾的零值须另行处理
					regexp = new RegExp(
						c0+'('+
							(
								c1000+c100+c10+(options.isMoney ? cFractionUnitsMoney.slice(0, fractionMaxDigitsMoneyDecided-1) : '')
							).split('').join('|')+
						')',
						'g'
					);
					result = result.replace(regexp, c0);
					if (shouldLog) C.l('\n'+regexp + ' ----> '+c0+ '\n\t\t' + result);


					// 处理连零
					regexp = new RegExp(c0+'+', 'g');
					result = result.replace(regexp, c0);
					if (shouldLog) C.l('\n'+regexp + ' ----> '+c0+ '\n\t\t' + result);


					// 处理连零之后（注意，是之后），“零亿”、“零万”之前剩余的“零”须去除
					regexp = new RegExp(c0+'('+cYi+'|'+c10000+')', 'g');
					result = result.replace(regexp, '$1');
					if (shouldLog) C.l('\n'+regexp + ' ----> '+'$1'+ '\n\t\t' + result);



					// 去除零万之前的零之后（注意，是之后），“亿”、“万”二字可能紧邻，须将“万”字替换为“零”字；
					// 但如果“亿万”二字后面原本就紧跟“零”字，则不需追加额外“零”字
					regexp = new RegExp(cYi+c10000+c0+'*', 'g');
					result = result.replace(regexp, cYi+c0);
					if (shouldLog) C.l('\n'+regexp + ' ----> '+cYi+c0+ '\n\t\t' + result);



					// 为安全起见，很多场合要求将小于二十的值，写作“壹拾”，即“壹”不省略
					// 如果不要求写作“壹拾”，则应去除前面的“壹”
					if (!options.tenWritesOneTen) {
						
						regexp = new RegExp('^'+c1+c10);
						result = result.replace(regexp, c10);
						if (shouldLog) C.l('\n'+regexp + ' ----> '+c10+ '\n\t\t' + result);


						regexp = new RegExp(c0+c1+c10, 'g');
						result = result.replace(regexp, c0+c10);
						if (shouldLog) C.l('\n'+regexp + ' ----> '+c10+ '\n\t\t' + result);
					}


					// 如果“零”出现在整数部分或整个字符串末尾，却又不是整数部分唯一的字符或整个串唯一的字符，那么应去除该“零”
					regexp = new RegExp('(.+)'+c0+(options.isMoney ? ('('+cBaseUnitMoney+')') :'$'));
					result = result.replace(regexp, '$1$2');
					if (shouldLog) C.l('\n'+regexp + ' ----> '+'$1$2'+ '\n\t\t' + result);



					if (options.isMoney) {
						// 钱数最小单位前方如果出现了零，则零连同单位整个去掉
						var smallestMoneyUnitThatUsed = cFractionUnitsMoney[fractionMaxDigitsMoneyDecided-1];
						regexp = new RegExp(c0+smallestMoneyUnitThatUsed);
						result = result.replace(regexp, '');
						// if (shouldLog) C.l('smallestMoneyUnitThatUsed:', smallestMoneyUnitThatUsed);
						if (shouldLog) C.l('\n'+regexp + ' ----> '+'""'+ '\n\t\t' + result);


						// 如果没有整数部分，即仅有“角分厘豪”，那么字符串首部的“零”须去除
						if (nInterger.length < 1 && nFractionRaw.length > 0) {
							regexp = new RegExp('^'+c0+'+');
							result = result.replace(regexp, '');
							if (shouldLog) C.l('\n'+regexp + ' ----> '+'""'+ '\n\t\t' + result);
						}


						// 如果亿或者万字后面是元，而元之后还有合法内容，则亿字或万字后面不一个“零”字
						regexp = new RegExp('('+cYi+'|'+c10000+')'+cBaseUnitMoney+'(.+)');
						result = result.replace(regexp, '$1'+cBaseUnitMoney+c0+'$2');
						if (shouldLog) C.l('\n'+regexp + ' ----> '+'$1'+cBaseUnitMoney+c0+'$2'+ '\n\t\t' + result);


						// 假定钱数最小单位是“分”，那么“两角”应做“两角整”；
						// 假定钱数最小单位是“厘”，那么“两分”应做“两分整”；
						// 依此类推
						if (needSuffixZheng) {
							result += cSuffixZheng;
						}
					} else {
						result += resultFraction;

						// 如果“零点”并非出现在字符串起始，那么应去除该“零”
						regexp = new RegExp('(.+)'+c0+cDot);
						result = result.replace(regexp, '$1'+cDot);
						if (shouldLog) C.l('\n'+regexp + ' ----> '+'$1'+cDot+ '\n\t\t' + result);


						// 如果“点”出现在字符串末尾，那么应去除该“点”
						regexp = new RegExp(cDot+'$');
						result = result.replace(regexp, '');
						if (shouldLog) C.l('\n'+regexp + ' ----> '+'""'+ '\n\t\t' + result);
					}



					var nIntergerString = nInterger.length ? nInterger : '0';
					this.data.lastValueHadDot = pop >= 0;
					this.data.lastResult = result;
					this.data.lastGroomedInput = nIntergerString +
						(this.data.lastValueHadDot ? ('.') : '') + inputSegmentAfterDot
					;
					this.data.lastConciseValue = nIntergerString +
						(nFractionRaw.length ? ('.') : '') + nFractionRaw
					;

					if (shouldLog) C.l('\nFINAL：\n\t\t', this.data);
					return result;
				}
			};
			this.decimalToChineseNumbers = (function () { // for direct usage
				var formatter = new this.DecimalToChineseNumbers({
					isMoney: false,
				});
				return formatter;
			}).call(this);
			this.decimalToChineseMoney = (function () { // for direct usage
				var formatter = new this.DecimalToChineseNumbers({
					isMoney: true
				});
				return formatter;
			}).call(this);
		}).call(stringFormatters);
	}).call(WCU);


	var DOM = {};
	this.DOM = DOM;
	(function () { // DOM
		this.getRole = function (dom) {
			if (dom instanceof Node) {
				var role = dom.getAttribute('role');
				if (typeof role === 'string') return role.toLowerCase();
			}
			return '';
		};

		this.setRole = function (dom, newRole) {
			if (!(dom instanceof Node) || !newRole || typeof newRole !== 'string') {
				return '';
			}

			newRole = newRole.toLowerCase();

			var existingRole = dom.getAttribute('role');
			if (typeof existingRole === 'string' && existingRole.length > 0) {
				C.w('Changing role of an element is Not recommanded by W3C.');
			}

			dom.setAttribute('role', newRole);

			return newRole;
		};

		this.ANestedInB = function (A, B, considerAisBAsTrue) {
			if (!(A instanceof Node && B instanceof Node)) return false;

			if (!considerAisBAsTrue) A = A.parentNode;
			while (A.tagName && A!==document.body && A!==B) {
				A = A.parentNode;
			}

			return A===B;
		};

		this.validateRootElement = function(dom, constructorName, options) {
			options = options || {};

			if (!options.domAlias || typeof options.domAlias !== 'string') {
				options.domAlias = 'rootElement';
			}

			if (typeof constructorName === 'object') {
				constructorName = constructorName.constructor.name;
			} else if (typeof constructorName === 'function') {
				constructorName = constructorName.name;
			}

			if (!constructorName || typeof constructorName !== 'string') {
				constructorName = '<untitled constructor>';
			}

			if (
				!(dom instanceof Node) || 
				  dom === document || 
				  dom === document.documentElement ||
				 (dom === document.body && !options.allowBody)
			) {
				var errorString = 'Invalid '+options.domAlias+' for constructing a '+constructorName+'.';
				if (!options.shouldThrowError) {
					C.e(errorString);
					return null;
				} else {
					throw(errorString);
				}
			}

			return dom;
		};
	}).call(DOM);


	var generalTools = {};
	this.generalTools = generalTools;
	(function () {
		this.URI = {
			evaluateParameters: function () {
				var h = window.location.href;
				var p; // fisrt position of '?' and then parameters sub string
				var s; // position of '#'
				var urlP = {};
				var i, pair;

				p = h.indexOf('\?');
				if (p<0) return urlP;

				s = h.indexOf('#');
				if (s<p) s = h.length; // in case '#' comes before '?', which is illegal, but we are still trying to handle that

				p = h.slice(p+1,s);
				p = p.split('&');
				for (i = 0; i < p.length; i++) {
					pair = p[i].split('=');
					if (pair[0].length===0) continue;
					if (pair.length===1) pair.push('');
					urlP[pair[0]] = decodeURIComponent(pair[1]);
				}

				return urlP;
			},

			generateURIComponentFromObject: function(parameters) {
				parameters = parameters || {};

				var parametersURI = '';
				var i=0;

				for (var key in parameters) {
					parametersURI += key + '=' + parameters[key] + '&';
					i++;
				}

				parametersURI = encodeURIComponent(parametersURI.slice(0,-1));
				if (i>0) parametersURI = '?' + parametersURI;
				return parametersURI;
			}
		};
	}).call(generalTools);


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

			function init() {
				$('body').on('click', (function (event) {
					var clickedEl = event.target;
					this.broadCastOutsideClickToRegisteredElements(clickedEl);
				}).bind(this));
			}

			init.call(this);
		}

		// this.Menu_NOT_DONE_YET = function Menu(rootElement, initOptions) {
			// // function example() {
			// // 	conf = conf || {};
			// // 	conf.level1IdPrefix = 'menu-chief-1-';
			// // 	setMenuCurrentItemForLevel(1, 2, $('#app-chief-nav'), conf);
			// // }

			// this.options = {
			// 	cssClassItemActive: 'current',
			// 	cssClassItemParentOfActive: 'current-parent'
			// };

			// this.onItemActivate = undefined;
			// this.onItemDeactivate = undefined;

			// function setMenuCurrentItemForLevel(level, depth, parentDom, conf) {
			// 	level = parseInt(level);
			// 	depth = parseInt(depth);
			// 	var levelIsValid = level > 0;
			// 	var depthIsValid = depth >= level;

			// 	if (!levelIsValid || !depthIsValid) {
			// 		throw('Invalid menu level/depth for configuring a menu tree.');
			// 	}
			// 	if (typeof conf !== 'object') {
			// 		throw('Invalid configuration object for configuring a menu tree.');
			// 	}

			// 	var prefix = conf['level'+level+'IdPrefix'];
			// 	var desiredId = prefix + conf['level'+level];

			// 	var $allItems = $(parentDom).find('.menu.level-'+level+' > .menu-item');
			// 	var currentItem;
			// 	var currentItemId;

			// 	$allItems.each(function (index, menuItem) {
			// 		var itemLabel = $(menuItem).find('> a > .label')[0];
			// 		var itemId = itemLabel.id;

			// 		var isCurrentItemOrParentOfCurrentItem = itemId && desiredId && (itemId===desiredId);
			// 		var isCurrentItem = isCurrentItemOrParentOfCurrentItem && level === depth;
			// 		if (isCurrentItemOrParentOfCurrentItem) {
			// 			currentItem = menuItem;
			// 			currentItemId = itemId;
			// 			if (isCurrentItem) {
			// 				$(menuItem).addClass('current');
			// 				$(menuItem).removeClass('current-parent');
			// 			} else {
			// 				$(menuItem).addClass('current-parent');
			// 				$(menuItem).removeClass('current');
			// 			}
			// 		} else {
			// 			$(menuItem).removeClass('current');
			// 			$(menuItem).removeClass('current-parent');
			// 		}
			// 	});

			// 	var currentSubMenuItem = null;
			// 	if (level < depth && currentItem) {
			// 		var nextLevel = level + 1;
			// 		conf['level'+nextLevel+'IdPrefix'] = currentItemId + '-' + nextLevel + '-';
			// 		currentSubMenuItem = setMenuCurrentItemForLevel(nextLevel, depth, currentItem, conf);
			// 		if (currentSubMenuItem) {
			// 			$(currentItem).addClass('has-sub-menu'); // update this for robustness
			// 			$(currentItem).addClass('coupled-shown');
			// 		}
			// 	}

			// 	return currentSubMenuItem || currentItem;
			// }
		// };


		this.PopupLayersManager = function PopupLayersManager() {
			var thisController = this;

			// var status = {};

			var options = {
				secondsToWaitBackPlateLeavingAniamtionEnd: 1.2,
				secondsToWaitPopupWindowShowingAniamtionEnd: 0.7,
				secondsToWaitPopupWindowLeavingAniamtionEnd: 0.9,
				cssAnimationSupported: window.Modernizr ? window.Modernizr.cssanimations : true
			};

			var elements = {
				$popupLayersContainersUnderApp: $('.app > .popup-layers')
			};

			this.show = function (popupLayerIdOrDom, event) {
				_showOrHidePopupLayer(popupLayerIdOrDom, true, event);
			};
			this.hide = function (popupLayerIdOrDom) {
				_showOrHidePopupLayer(popupLayerIdOrDom);
			};

			this.processAllUnder = _processAllUnder.bind(this);

			(function _init () {
				this.processAllUnder('app');
			}).call(this);

			function _processAllUnder(appOrPageOrPLContainer) {
				var $plContainers;
				if (appOrPageOrPLContainer === 'app') {
					$plContainers = elements.$popupLayersContainersUnderApp;
				} else if ($(appOrPageOrPLContainer).hasClass('.popup-layers')) {
					$plContainers = $(appOrPageOrPLContainer);
				} else if ($(appOrPageOrPLContainer).hasClass('page')) {
					$plContainers = $(appOrPageOrPLContainer).find('.popup-layers');
				} else {
					return false;
				}

				if ($plContainers.length < 1) {
					return false;
				}

				$plContainers.each(function () {
					var plContainer = this;
					var $plContainer = $(plContainer);

					var $bp = $plContainer.find('.popup-layers-back-plate');
					if ($bp.length < 1) {
						C.w('Back plate not found under ', plContainer);
					}

					$plContainer.find('.popup-layer').each(function () {
						var pl = this;
						if (!!pl.status && (pl.status.popupLayerHasBeenProcessed === true)) {
							C.l('Skipped popup-layer "'+pl.id+'", which has already been processed.');
							return true;
						}

						if (typeof pl.elements !== 'object') pl.elements = {};

						pl.elements.popupLayersBackPlate = $bp[0];
						// C.l(pl.id, pl.elements.popupLayersBackPlate);

						var $pl = $(pl);

						$pl.find('[button-action="confirm"], [button-action="cancel"]').on('click', function() {
							thisController.hide(pl);
						});

						var $pw = $pl.find('.popup-window');
						_clearCssClassNamesAboutShowingAnimationsForPopupWindow($pw);
						_clearCssClassNamesAboutLeavingAnimationsForPopupWindow($pw);

						if (typeof pl.status !== 'object') pl.status = {};
						pl.status.popupLayerHasBeenProcessed = true;
					});
				});
			}

			function _clearCssClassNamesAboutShowingAnimationsForPopupWindow($pw) {
				$pw
					.removeClass([
						'shows-up-from-center',
						'shows-up-from-top',
						'shows-up-from-top-left',
						'shows-up-from-top-right',
						'shows-up-from-bottom',
						'shows-up-from-bottom-left',
						'shows-up-from-bottom-right',
						'shows-up-from-leftside',
						'shows-up-from-rightside'
					].join(' '))
				;
			}

			function _clearCssClassNamesAboutLeavingAnimationsForPopupWindow($pw) {
				$pw
					.removeClass([
						'regular-window-leave-from-above',
						'tiny-window-leave-from-above',
						'tall-window-leave-from-above'
					].join(' '))
				;
			}

			function _showOrHidePopupLayer(popupLayerIdOrDom, isToShow, eventOfShow) {
				function __backPlateOnLeavingAnimationEnd(event, invokedViaTimer) {
					if (!bp.__LeavingAnimationNotEndedEitherWay) {
						return true;
					}

					if (invokedViaTimer === true) C.w('Timer ends waiting of "leaving" animation end for ', bp);
					bp.removeEventListener('animationend', __backPlateOnLeavingAnimationEnd);
					$bp.hide();
					$bp.removeClass('popup-layer-back-plate-leaving');

					delete bp.__LeavingAnimationNotEndedEitherWay;
				}

				function __popupWindowOnLeavingAnimationEnd(event, invokedViaTimer) {
					if (!pw.__LeavingAnimationNotEndedEitherWay) {
						return true;
					}

					if (invokedViaTimer === true) C.w('Timer ends waiting of "leaving" animation end for ', pw);
					pw.removeEventListener('animationend', __popupWindowOnLeavingAnimationEnd);
					$pl.hide();
					_clearCssClassNamesAboutLeavingAnimationsForPopupWindow($pw);

					delete pw.__LeavingAnimationNotEndedEitherWay;
				}

				function __popupWindowOnShowingAnimationEnd(event, invokedViaTimer) {
					if (!pw.__ShowingAnimationNotEndedEitherWay) {
						return true;
					}

					if (invokedViaTimer === true) C.w('Timer ends waiting of "showing" animation end for ', pw);
					pw.removeEventListener('animationend', __popupWindowOnShowingAnimationEnd);
					_clearCssClassNamesAboutShowingAnimationsForPopupWindow($pw);

					delete pw.__ShowingAnimationNotEndedEitherWay;
				}




				if (!popupLayerIdOrDom) return false;

				var plId, pl;
				if (typeof popupLayerIdOrDom === 'string') {
					plId = '#'+popupLayerIdOrDom.replace(/^\s*#?/, '').replace(/\s*$/, '');
					pl = $(plId)[0];
				} else {
					pl = popupLayerIdOrDom;
					plId = pl.id;
				}

				if (!pl) {
					C.e('Cannot find popup layer with id "'+plId+'".');
					return false;			
				}


				var bp = null;
				if (!pl.elements) {
					C.w('Popup layer with id "'+plId+'" might not be initialized.');
				} else {
					bp = pl.elements.popupLayersBackPlate;
				}

				var $bp = $(bp);
					$bp.removeClass('popup-layer-back-plate-leaving'); // just for safety

				var $pl = $(pl);
				var $pw = $pl.find('.popup-window');
				var pw = $pw[0];

				var isPoliteMessage = $pl.hasClass('polite-message');
				var isPopupPanel = $pl.hasClass('has-docked-panel');
				var hasPopupWindowOrDialog = !$pl.hasClass('has-no-popup-window');

				if (!isToShow) {
					var needToPlayLeavingAnimation = options.cssAnimationSupported &&
						!!pw && hasPopupWindowOrDialog &&
						!isPopupPanel && !isPoliteMessage
					;
					var needToHideBackPlate = !!bp && !isPoliteMessage;
						
					if (needToPlayLeavingAnimation) {
						pw.__LeavingAnimationNotEndedEitherWay = true;
						pw.addEventListener('animationend', __popupWindowOnLeavingAnimationEnd);
						setTimeout(function () {
							__popupWindowOnLeavingAnimationEnd(null, true);
						}, options.secondsToWaitPopupWindowLeavingAniamtionEnd * 1000);

						var pwHeight = $pw.outerHeight();
						var chosenCssClassNameForLeavingAnimation = 'regular-window-leave-from-above';
						if (pwHeight <= (window.innerHeight * 0.25)) {
							chosenCssClassNameForLeavingAnimation = 'tiny-window-leave-from-above';
						} else if (pwHeight > (window.innerHeight * 0.79)) {
							chosenCssClassNameForLeavingAnimation = 'tall-window-leave-from-above';
						}
						// C.l(pwHeight, window.innerHeight, window.innerHeight * 0.25, chosenCssClassNameForLeavingAnimation);

						// _clearCssClassNamesAboutShowingAnimationsForPopupWindow($pw);
						$pw.addClass(chosenCssClassNameForLeavingAnimation);
					} else {
						if (isPoliteMessage) {
							$pl.fadeOut();
						} else {
							$pl.hide();					
						}
					}

					if (needToHideBackPlate) {
						var needToHideBackPlateAfterAnimation = options.cssAnimationSupported;
						if (needToHideBackPlateAfterAnimation) {
							bp.__LeavingAnimationNotEndedEitherWay = true;
							bp.addEventListener('animationend', __backPlateOnLeavingAnimationEnd);
							setTimeout(function () {
								__backPlateOnLeavingAnimationEnd(null, true);
							}, options.secondsToWaitBackPlateLeavingAniamtionEnd * 1000);

							$bp.addClass('popup-layer-back-plate-leaving');
						} else {
							$bp.hide();
						}
					}
				} else {
					var needToShowBackPlate = !!bp && !isPoliteMessage;
					if (needToShowBackPlate) $bp.show();

					var needToPlayShowingAnimation = options.cssAnimationSupported &&
						!!pw && hasPopupWindowOrDialog &&
						!isPopupPanel
					;

					if (needToPlayShowingAnimation) { // prepare for animation
						var needToAssignCssClassNameForAnimation = !isPoliteMessage;

						var chosenCssClassNameForShowingAnimation;

						var needToDecideShowingUpDirection = needToAssignCssClassNameForAnimation && true; // always do this
						if (needToDecideShowingUpDirection) {
							chosenCssClassNameForShowingAnimation = _decideShowingUpSourceDirection(eventOfShow);
						}

						if (needToAssignCssClassNameForAnimation && chosenCssClassNameForShowingAnimation) {
							$pw.addClass(chosenCssClassNameForShowingAnimation);
						}

						var shouldHandleAnimationEndToDoSometing = !isPoliteMessage;
						if (shouldHandleAnimationEndToDoSometing) {
							pw.__ShowingAnimationNotEndedEitherWay = true;
							pw.addEventListener('animationend', __popupWindowOnShowingAnimationEnd);
							setTimeout(function () {
								__popupWindowOnShowingAnimationEnd(null, true);
							}, options.secondsToWaitPopupWindowShowingAniamtionEnd * 1000);
						}
					} else {
						// nothing to prepare for
					}

					if (!!eventOfShow && eventOfShow.target instanceof Node) {
						eventOfShow.target.blur();
					}

					$pl.show();
					// do NOT use jquery show(complete) callback.
					// other wise the process will effect css animation of popup window under the popup layer.

					if (!isPoliteMessage) {
						setTimeout(function () {
							tryToFocusSomething($pl);
						}, 100);
					}



					var shouldHideAutomatically = isPoliteMessage;
					if (shouldHideAutomatically) {
						var durationBeforeAutoHide = 3000;
						var _temp = parseFloat(pl.getAttribute('data-showing-duration-in-seconds'));
						if (!isNaN(_temp) && _temp > 1) durationBeforeAutoHide = _temp * 1000;

						setTimeout(function () {
							thisController.hide($pl[0]);
						}, durationBeforeAutoHide);
					}
				}
			}

			function tryToFocusSomething($pl) {
				var firstFocusable = $pl.find('input, textarea, [contentEditable="true"], button, a')[0];
				if (firstFocusable) firstFocusable.focus();
			}

			function _decideShowingUpSourceDirection(event) {
				var cssClass = 'shows-up-from-bottom';

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

				// C.l(w, h, x, y, cssClass);

				return cssClass;
			}
		};
		this.popupLayersManager = new this.PopupLayersManager();


		this.DraggingController = function DraggingController(rootElement, initOptions) {
			/*
				require:
					ANestedInB()
			*/
			rootElement = wlc.DOM.validateRootElement(rootElement, this, {
				allowBody: true
			});

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
				status.isInitializing = true;

				this.config(initOptions);

				var $_r = $(rootElement);
				$_r
					.on('mousedown', onMouseDown.bind(this))
					.on('mouseup',   onMouseUp  .bind(this))
					.on('mousemove', onMouseMove.bind(this))
				;

				clearStatus();

				delete status.isInitializing;
			}

			init.call(this);
			if (status.isInitializing) {
				C.e('Fail to construct <'+this.constructor.name+'>.');
				WCU.objectToolkit.destroyInstanceObject(this);
				return;
			}
		};

		this.SingleCharacterInputsSet = function SingleCharacterInputsSet(rootElement, initOptions) {
			rootElement = wlc.DOM.validateRootElement(rootElement, this);

			var $allInputs;

			this.options = {

			};

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
			function aggregateAllInputsStatus(/*isCheckingOnLoad*/) {
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
				status.isInitializing = true;

				if (!rootElement) return false;

				$allInputs = $(rootElement).find('input.single-char-input').filter(function (index, input) {
					var type = input.type.toLowerCase();
					return type !== 'checkbox' && type !== 'radio';
				});

				if ($allInputs.length < 1) {
					C.e('Too few input fields for constructing a '+this.constructor.name+'.');
					return false;
				}


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

				delete status.isInitializing;
			}

			init.call(this);
			if (status.isInitializing) {
				C.e('Fail to construct <'+this.constructor.name+'>.');
				WCU.objectToolkit.destroyInstanceObject(this);
				return;
			}
		};

		this.ProgressRing = function ProgressRing(rootElement, initOptions) {
			rootElement = wlc.DOM.validateRootElement(rootElement, this);

			this.options = {
				useCanvas: true,
				colorHighLightStroke: '#f60',
				colorBgStroke: '#eaeaea',
				useTransitions: true,
				transitionsTotalDuration: 0.51219,
				treatTotalDurationAsRoughSpeed: true, // that is 360deg per duration
				doNotQueueAnyDregree: false,
				takeLastQueuedDegreeOnly: true,
			};

			this.config = config.bind(this);
			this.getDegree = getDegree.bind(this);
			this.getPercentage = getPercentage.bind(this);
			this.setDegreeTo = setDegreeTo.bind(this);
			this.setPercentageTo = setPercentageTo.bind(this);
			this.setDegreeViaHTMLAttribute = function () {
				this.setDegreeTo('html-attribute-value');
			};




			var eChartRing;
			var eChartRingItemStyle = {
				normal: {
					color: this.options.colorHighLightStroke
				}
			};
			var eChartRingBgStyle = {
				normal: {
					color: 'transparent'
				}
			};





			var half1, half2, pKeyTransitionDuration;

			var halves = [];
			var half1Settings = { index: 1 };
			var half2Settings = { index: 2 };

			var currentDegree = 0;
			var currentTargetDegree;
			var status = {
				isRunning: false,
				queuedDegrees: []
			};

			var half1DegreeMeansHidden = 0;
			var half2DegreeMeansHidden = 180;

			init.call(this);
			if (status.isInitializing) {
				C.e('Fail to construct <'+this.constructor.name+'>.');
				WCU.objectToolkit.destroyInstanceObject(this);
				return;
			}


			function init() {
				status.isInitializing = true;
				if (!rootElement) return false;

				this.config(initOptions);
				currentDegree = _parseDegreeVia(currentDegree);

				if (initOptions && !!initOptions.disableInitialUpdate) {
				} else {
					var thisController = this;
					setTimeout(function () { // important for first running, especially for the first acting half element
						thisController.setDegreeViaHTMLAttribute();
					}, 0);
				}

				delete status.isInitializing;
				return true;
			}

			function prepareDoms() {
				if (this.options.useCanvas) {
					prepareDomsForCanvas.call(this);
				} else {
					prepareDomsForElements.call(this);
				}
			}
			function prepareDomsForCanvas() {
				if (!window.echarts) return false;

				$(rootElement).addClass('use-canvas');
				$(rootElement).removeClass('huge-scale-down quadruple-scale-down uses-css-clip');

				eChartRing = window.echarts.init(rootElement);

				var radii = evaluateRadiiForCanvas.call(this);
				var options = {
					series: [
						{
							type:'pie',
							radius: radii,
							hoverAnimation: false,
							label: {
								normal: {
									show: false    
								}  
							},
							itemStyle: {
								normal: {
									color: this.options.colorBgStroke
								}
							},
							data: [ 100 ],
							animation: false
						},
						{
							type:'pie',
							radius: radii,
							hoverAnimation: false,
							label: {
								normal: {
									show: false    
								}  
							},
							data:[
								{
									value: 0,
									itemStyle: eChartRingItemStyle
								},
								{
									value: 100,
									itemStyle: eChartRingBgStyle,
								}
							]
						}
					]
				};

				eChartRing.setOption(options);
			}
			function prepareDomsForElements() { // add or remve doms as needed
				$(rootElement).removeClass('use-canvas');
				// $(rootElement).addClass('uses-css-clip');
				// $(rootElement).removeClass('huge-scale-down').removeClass('quadruple-scale-down'); // really bad
				// $(rootElement).addClass('huge-scale-down').removeClass('quadruple-scale-down'); // smooth but blur
				$(rootElement).addClass('quadruple-scale-down').removeClass('huge-scale-down'); // balanced


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

				half1.style.transform = 'rotate('+half1DegreeMeansHidden+'deg)';
				half2.style.transform = 'rotate('+half2DegreeMeansHidden+'deg)';

				half1Settings.dom = half1;
				half1Settings.style = half1.style;

				half2Settings.dom = half2;
				half2Settings.style = half2.style;
			}

			function config(options) {
				if (typeof options !== 'object' || !options) return;

				var R, temp;


				WCU.save.boolean(this.options, 'disableInitialUpdate', options);


				temp = {
					useCanvas: this.options.useCanvas
				};
				R = WCU.save.boolean(temp, 'useCanvas', options);
				if (R.valueHasBeenChanged) {
					if (temp.useCanvas && !window.echarts) {
						R.valueHasBeenChanged = false;
						C.e('Echarts not found. Doms not changed.');
					} else {
						this.options.useCanvas = temp.useCanvas;
					}
				}



				WCU.save.boolean(this.options, 'useTransitions', options);
				WCU.save.boolean(this.options, 'doNotQueueAnyDregree', options);
				WCU.save.boolean(this.options, 'takeLastQueuedDegreeOnly', options);
				WCU.save.boolean(this.options, 'treatTotalDurationAsRoughSpeed', options);
				WCU.save.numberNoLessThan(this.options, 'transitionsTotalDuration', options, false, 0.05);

				if (!!status.isInitializing || R.valueHasBeenChanged) {
					prepareDoms.call(this);
				}

				// console.log('single ring configered: ', this.options);
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

			function getDegree() {
				if (typeof currentTargetDegree !== 'object') {
					return 0;
				}

				return currentTargetDegree.raw;
			}

			function getPercentage() {
				return this.getDegree() / 360;
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
				if (status.isRunning && this.options.doNotQueueAnyDregree) {
				} else {
					queueOneNewDegree.call(this, newDegree);
				}
				fetchDegreeFromQueueAndUpdateDomsOrCanvas.call(this);
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

			function fetchDegreeFromQueueAndUpdateDomsOrCanvas() {
				// C.l('This ring is already running:', status.isRunning);
				if (status.isRunning) {
					return;
				}

				var newDegree = fetchDegreeFromQueue.call(this);
				if (typeof newDegree !== 'object' || typeof newDegree.safe !== 'number' || isNaN(newDegree.safe)) {
					return false;
				}

				currentTargetDegree = newDegree;

				if (this.options.useCanvas) {
					fetchDegreeFromQueueAndUpdateCanvas.call(this, newDegree);
				} else {
					fetchDegreeFromQueueAndUpdateDoms.call(this, newDegree);
				}
			}

			function evaluateRadiiForCanvas() {
				if (!eChartRing || typeof eChartRing.getWidth !== 'function') {
					return [ '92%', '100%' ];
				}

				var chartWidth = eChartRing.getWidth();
				var radii = [
					((chartWidth - 7) / chartWidth * 100)+'%',
					'100%'
				];

				return radii;
			}

			function fetchDegreeFromQueueAndUpdateCanvas(newDegree) {
				// use eCharts
				var thisController = this;

				var degree = newDegree.safe;
				var value1 = degree / 360;

				var options = {
					series: [{
					},
					{
						radius: evaluateRadiiForCanvas.call(this), // in case canvas resized
						data:[
							{
								value: value1,
								itemStyle: eChartRingItemStyle
							},
							{
								value: (1 - value1),
								itemStyle: eChartRingBgStyle,
							}
						]
					}]
				};

				eChartRing.setOption(options);
				onUpdateDone();

				function onUpdateDone() {
					rootElement.getAttribute('data-degree', newDegree.raw);
					currentDegree = newDegree;

					status.isRunning = false;
					// console.trace('-- everything done! --', currentDegree);

					fetchDegreeFromQueueAndUpdateDomsOrCanvas.call(thisController);
				}
			}

			function fetchDegreeFromQueueAndUpdateDoms(newDegree) {
				var thisController = this;
				status.isRunning = true;

				var oldSafeDegree = currentDegree.safe;
				var newSafeDegree = newDegree.safe;
				var deltaTotalAbs = Math.abs(newSafeDegree - oldSafeDegree);
				var eitherTransitionsIsNecessary = !!this.options.useTransitions && deltaTotalAbs > 1; // at least one degree to change

				// console.log('\n\n=== from', oldSafeDegree, 'to', newSafeDegree, '===', deltaTotalAbs, 'transition?', this.options.useTransitions, '\t', this.options.transitionsTotalDuration, 'sec');

				_processHalfSettings.call(this,
					half1Settings,
					Math.min(180, oldSafeDegree),
					Math.min(180, newSafeDegree),
					this.options.transitionsTotalDuration
				);
				_processHalfSettings.call(this,
					half2Settings,
					Math.max(180, oldSafeDegree),
					Math.max(180, newSafeDegree),
					this.options.transitionsTotalDuration
				);

				function _processHalfSettings (_S, oldSafeDegree, newSafeDegree, totalDurationOrSpeed) {
					_S.oldDegree = oldSafeDegree;
					_S.newDegree = newSafeDegree;
					_S.delta = _S.oldDegree - _S.newDegree;
					_S.deltaAbs = Math.abs(_S.delta);

					if (deltaTotalAbs < 0.001) {
						_S.duration = 0;
					} else {
						if (this.options.treatTotalDurationAsRoughSpeed) {
							_S.duration = totalDurationOrSpeed * _S.deltaAbs / 360;
						} else {
							_S.duration = totalDurationOrSpeed * _S.deltaAbs / deltaTotalAbs;
						}
					}

					_S.transitionNecessary = eitherTransitionsIsNecessary && _S.duration > 0.01 && _S.deltaAbs > 0.1;
					if (_S.transitionNecessary) {
						$(_S.dom).removeClass('no-transition');
						_S.style[pKeyTransitionDuration] = _S.duration + 's';
					} else {
						$(_S.dom).addClass('no-transition');
					}
					// console.log('transition?', _S.transitionNecessary, '\t',
					// 	_S.style[pKeyTransitionDuration],
					// 	'\t\t', _S.deltaAbs+' deg to go: ',
					// 	oldSafeDegree, 'to', newSafeDegree
					// );
				}


				var halfA, halfB; // transition of halfA goes BEFORE transition of halfB

				if (oldSafeDegree <= 180) {
					halfA = half1Settings;
					halfB = half2Settings;
				} else {
					halfA = half2Settings;
					halfB = half1Settings;
				}

				// console.log('action order will be: half', halfA.index, '>>> half', halfB.index);


				updateHalfA();
				var aTransitionEndedAnyHow = false;
				var bTransitionEndedAnyHow = false;


				function updateHalfA() {
					// console.log('update A [', halfA.index,']:\t', halfA.oldDegree, '-->', halfA.newDegree, '\t transition?', halfA.transitionNecessary, '\t\t',halfA.duration,'sec');
					halfA.style.transform = 'rotate('+halfA.newDegree+'deg)';

					if (!halfA.transitionNecessary) {
						updateHalfB();
						setTimeout(function () {
							$(halfA.dom).removeClass('no-transition');
						}, 0);
					} else {
						// console.log('B is waiting for A...');
						setTimeout(function () { onTransitionAEnd(false); }, halfA.duration * 1010);
						halfA.dom.addEventListener('transitionend', onTransitionAEnd);
					}
				}
				function onTransitionAEnd (/*eventOrFalse*/) {
					if (aTransitionEndedAnyHow) return true;

					// console.log('transition A end.\t\t\t from timer?', eventOrFalse===false, halfA.duration);
					halfA.dom.removeEventListener('transitionend', onTransitionAEnd);
					aTransitionEndedAnyHow = true;
					updateHalfB();
				}

				function updateHalfB() {
					// console.log('update B [', halfB.index,']:\t', halfB.oldDegree, '-->', halfB.newDegree, '\t transition?', halfB.transitionNecessary, '\t\t',halfB.duration,'sec');
					halfB.style.transform = 'rotate('+halfB.newDegree+'deg)';

					if (!halfB.transitionNecessary) {
						onBothHalvesUpdated();
						setTimeout(function () {
							$(halfB.dom).removeClass('no-transition');
						}, 0);
					} else {
						// console.log('finishing is waiting for B...');
						setTimeout(function () { onTransitionBEnd(false); }, halfB.duration * 1010);
						halfB.dom.addEventListener('transitionend', onTransitionBEnd);
					}
				}
				function onTransitionBEnd (/*eventOrFalse*/) {
					if (bTransitionEndedAnyHow) return true;

					// console.log('transition B end.\t from timer?', eventOrFalse===false, halfB.duration);
					halfB.dom.removeEventListener('transitionend', onTransitionBEnd);
					bTransitionEndedAnyHow = true;
					onBothHalvesUpdated();
				}

				function onBothHalvesUpdated() {
					halfA.style[pKeyTransitionDuration] = '';
					halfB.style[pKeyTransitionDuration] = '';

					rootElement.getAttribute('data-degree', newDegree.raw);
					currentDegree = newDegree;

					status.isRunning = false;
					// console.trace('-- everything done! --', currentDegree);

					fetchDegreeFromQueueAndUpdateDomsOrCanvas.call(thisController);
				}


				return newDegree;
			}
		};

		this.ProgressRings = function ProgressRings(rootElement, initOptions) {
			rootElement = wlc.DOM.validateRootElement(rootElement, this);

			this.options = {
				// useTransitions: true,
				// singleRingTransitionsTotalDuration: NaN,
				// treatTotalDurationAsRoughSpeed: true,
				// doNotQueueAnyDregree: false,
				// takeLastQueuedDegreeOnly: true,
				perRings: []
			};

			var rings = [];

			this.controllers = {
				rings: rings
			};

			this.createOneRing = createOneRing.bind(this);
			this.config = config.bind(this);
			this.getDegree = getDegree.bind(this);
			this.getDegrees = getDegrees.bind(this);
			this.getPercentage = getPercentage.bind(this);
			this.getPercentages = getPercentages.bind(this);
			this.setDegrees = setDegrees.bind(this);
			this.setPercentages = setPercentages.bind(this);

			var status = {};

			init.call(this);
			if (status.isInitializing) {
				C.e('Fail to construct <'+this.constructor.name+'>.');
				WCU.objectToolkit.destroyInstanceObject(this);
				return;
			}


			function init() {
				status.isInitializing = true;
				this.config(initOptions);

				if (!rootElement) return false;

				var ringsDom = $(rootElement).find('.ring');
				if (ringsDom.length < 1) {
					C.e('No ring element found under rootElement when constructing a '+this.constructor.name+'.\n rootElement:', rootElement);
					return false;
				}

				for (var i = 0; i < ringsDom.length; i++) {
					this.createOneRing(ringsDom[i]);
				}

				delete status.isInitializing;
			}

			function getDegree(index) {
				index = parseInt(index) || 0;
				var ring = rings[index];
				if (!ring) return undefined;
				return ring.getDegree();
			}

			function getPercentage(index) {
				var deg = this.getDegree(index);
				if (typeof deg === 'number') {
					if (isNaN(deg)) return undefined;
					return deg / 360;
				}

				return undefined;
			}

			function getDegrees() {
				var results = [];
				for (var i = 0; i < rings.length; i++) {
					results.push(rings[i].getDegree());
				}
				return results;
			}

			function getPercentages() {
				var results = [];
				for (var i = 0; i < rings.length; i++) {
					results.push(rings[i].getDegree() / 360);
				}
				return results;
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
				var options =results.optionsPerRings[0]; // single options object
				var newRing = new UI.ProgressRing(ringRootElement, options);
				if (newRing.hasBeenDestroied) {
					C.e('Fail to create ring for rings controller.');
					return;
				}
				rings.push(newRing);
			}

			function config(options) {
				var shouldNotConfigRings = !!status.isInitializing;
				if (typeof options !== 'object' || !options) return;

				WCU.save.boolean(this.options, 'disableInitialUpdate', options, true);
				WCU.save.boolean(this.options, 'useTransitions', options, true);
				WCU.save.boolean(this.options, 'doNotQueueAnyDregree', options, true);
				WCU.save.boolean(this.options, 'takeLastQueuedDegreeOnly', options, true);
				WCU.save.boolean(this.options, 'treatTotalDurationAsRoughSpeed', options, true);
				WCU.save.numberPositive(this.options, 'singleRingTransitionsTotalDuration', options, true);

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

							WCU.save.boolean(_oprTI, 'disableInitialUpdate', _oprSI, true);
							WCU.save.boolean(_oprTI, 'useTransitions', _oprSI, true);
							WCU.save.boolean(_oprTI, 'doNotQueueAnyDregree', _oprSI, true);
							WCU.save.boolean(_oprTI, 'takeLastQueuedDegreeOnly', _oprSI, true);
							WCU.save.boolean(_oprTI, 'treatTotalDurationAsRoughSpeed', _oprSI, true);
							WCU.save.numberPositive(_oprTI, 'singleRingTransitionsTotalDuration', _oprSI, true);
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

					R = WCU.save.boolean(_oprTI, 'disableInitialUpdate', _oprSI);
					if (!R.valueHasBeenCreated) {
						WCU.save.boolean(_oprTI, 'disableInitialUpdate', _oGlobalDefault);
					}

					R = WCU.save.boolean(_oprTI, 'doNotQueueAnyDregree', _oprSI);
					if (!R.valueHasBeenCreated) {
						WCU.save.boolean(_oprTI, 'doNotQueueAnyDregree', _oGlobalDefault);
					}

					R = WCU.save.boolean(_oprTI, 'takeLastQueuedDegreeOnly', _oprSI);
					if (!R.valueHasBeenCreated) {
						WCU.save.boolean(_oprTI, 'takeLastQueuedDegreeOnly', _oGlobalDefault);
					}

					R = WCU.save.boolean(_oprTI, 'useTransitions', _oprSI);
					if (!R.valueHasBeenCreated) {
						WCU.save.boolean(_oprTI, 'useTransitions', _oGlobalDefault);
					}

					R = WCU.save.boolean(_oprTI, 'treatTotalDurationAsRoughSpeed', _oprSI);
					if (!R.valueHasBeenCreated) {
						WCU.save.boolean(_oprTI, 'treatTotalDurationAsRoughSpeed', _oGlobalDefault);
					}

					R = WCU.save.numberPositive(_oprTI, 'transitionsTotalDuration', _oprSI);
					if (!R.valueHasBeenCreated) {
						WCU.save.numberPositive(_oprTI, 'transitionsTotalDuration', _oGlobalDefault.singleRingTransitionsTotalDuration);
					}

					// C.l('merged options for ring ['+i+']', _oprTI);
					results.optionsPerRings.push(_oprTI);
				}

				return results;
			}
		};

		this.TabPanelSet = function TabPanelSet(rootElement, initOptions) {
			var thisController = this;
			rootElement = wlc.DOM.validateRootElement(rootElement, this);


			var elements = {
				rootElement: rootElement,
				panels: [],
				tabList: null,
				tabs: [],
				tabListCurrentItemHint: null,

				currentTab: null,
				currentPanel: null
			};

			var status = {
				isOnAction: false
			};

			var publicStatus = { // not public in any way at present
				// elements: elements,
				// options: this.options,
				currentPanelIndex: NaN
			};


			this.elements = elements;
			this.options = {
				allowToShowNone: false,
				selectorOfPanel: '.panel',
				selectorOfTabList: '.tab-list',
				selectorOfTab: '> li', // treat as under tablist, so in face this value is "rootElement .tab-list > li"
				selectorOfTabListCurrentItemHint: '> .current-item-hint', // treat as under tablist, so in face this value is "rootElement .tab-list > .current-item-hint"
				classNameOfCurrentPanel: 'current'
			};

			this.config = config.bind(this);
			this.getPanel = getPanel.bind(this);
			this.getPanelViaTab = getPanelViaTab.bind(this);
			this.showPanel = showPanel.bind(this);
			this.showPanelViaTab = showPanelViaTab.bind(this);
			this.showPrevPanel = showPrevPanel.bind(this);
			this.showNextPanel = showNextPanel.bind(this);
			this.slideTabCurrentItemHintTo = slideTabCurrentItemHintTo.bind(this);

			// If the panel is shown through a way other than showPanel/showPrevPanel/showNextPanel/showPanelViaTab,
			// for example the panel is shown via the famous Swiper.js,
			// then we need to update tablist separately.
			this.syncStatusToPanel = function (thePanelOrTheTabOrTheIndex, shouldTrace) {
				syncStatusToPanel.call(this, thePanelOrTheTabOrTheIndex, shouldTrace, false);
			};

			var $tabList;
			var $tabs;
			var tabListCurrentItemHint;

			function config(options) {
				var isInitializing = !!status.isInitializing;
				var shouldWarnAllowToShowNone = false;
				if (!options) {
					shouldWarnAllowToShowNone = this.options.allowToShowNone && isInitializing;
				} else {
					var R1 = WCU.save.boolean(this.options, 'allowToShowNone', options);

					shouldWarnAllowToShowNone = (isInitializing || R1.valueHasBeenChanged) && this.options.allowToShowNone;
				}

				if (shouldWarnAllowToShowNone) {
					C.w('This TabPanelSet allows to show none of its member panel.');
				}

				WCU.save.string(this.options, 'selectorOfPanel', options, false, false);
				WCU.save.string(this.options, 'selectorOfTabList', options, false, false);
				WCU.save.string(this.options, 'selectorOfTab', options, false, false);
				WCU.save.string(this.options, 'selectorOfTabListCurrentItemHint', options, false, false);
			}

			function init() {
				status.isInitializing = true;
				if (!rootElement) return;

				this.config(initOptions);

				var $root = $(rootElement);

				var $panels = $root.find(this.options.selectorOfPanel);
				if ($panels.length < 1) {
					C.e('No panel was found under <'+this.constructor.name+'> rootElement:', rootElement);
					return false;
				}

				$tabList = $root.find(this.options.selectorOfTabList);
				if ($tabList.length > 1) {
					C.e('More than one tablists were found under <'+this.constructor.name+'> rootElement:', rootElement);
					return false;
				}

				$tabs = $tabList.find(this.options.selectorOfTab);
				if ($tabs.length !== $panels.length) {
					C.w('The count of panels ('+$panels.length+') and that of tabs ('+$tabs.length+') do not match under <'+this.constructor.name+'> rootElement:', rootElement);
				}

				tabListCurrentItemHint = $tabList.find(this.options.selectorOfTabListCurrentItemHint);
				if (tabListCurrentItemHint.length > 1) {
					C.w('More than one tablists current item hint element were found under <'+this.constructor.name+'> rootElement:', rootElement);
				}
				tabListCurrentItemHint = tabListCurrentItemHint[0];

				// we'd better make sure the order of tabs in elements.tabs matches the order of panels in elements.panels
				// elements.panels  = elements.panels.concat($panels);
				// elements.tabs    = elements.tabs.concat($tabs);
				elements.tabList = $tabList[0];
				elements.tabListCurrentItemHint = tabListCurrentItemHint;

				$panels.each(function () {
					// we'd better make sure the order of tabs in elements.tabs matches the order of panels in elements.panels
					this.panelIndex = elements.panels.length;
					elements.panels[this.panelIndex] = this;
					this.elements = { tab: null };
				});

				$tabs.each(function () {
					var myPanelId = this.getAttribute('aria-controls');
					if (!myPanelId) {
						C.w('Uncoupled tab met.', this);
						return false;
					}

					var myPanel = $('#'+myPanelId)[0];

					if (!myPanel) {
						C.e('Can not find controlled panel for tab [expected panel id="'+myPanelId+'"].');
						return false;
					}

					// we'd better make sure the order of tabs in elements.tabs matches the order of panels in elements.panels
					elements.tabs[myPanel.panelIndex] = this;
					this.panelIndex = myPanel.panelIndex;
					myPanel.elements.tab = this;
					this.elements = { panel: myPanel };
				});


				if ($tabs.length > 1) {
					$tabs.on('click', function (event) {
						if (typeof thisController.onTabClick === 'function') {
							thisController.onTabClick(this, event);
						}
						thisController.showPanelViaTab(this);
					});
					$tabs.on('mouseover', function () {
						thisController.slideTabCurrentItemHintTo(this);
					});
					$tabList.on('mouseout', function () {
						thisController.slideTabCurrentItemHintTo(elements.currentTab);
					});
				}


				if (initOptions && initOptions.doNotShowPanelAtInit) {
				} else {
					this.showPanelViaTab(initOptions ? initOptions.initTab : 0);
				}


				delete status.isInitializing;
				return true;
			}

			init.call(this);
			if (status.isInitializing) {
				C.e('Fail to construct <'+this.constructor.name+'>.');
				WCU.objectToolkit.destroyInstanceObject(this);
				return;
			}

			function slideTabCurrentItemHintTo(theTab) {
				if (!tabListCurrentItemHint || !tabListCurrentItemHint.style) return false;

				var tabListCurrentItemHintCssLeft = 0;

				if (!theTab) {
					tabListCurrentItemHint.style.clip = '';
					return true;
				}

				var _P = $(theTab).offsetParent();
				var _L = $(theTab).offset().left;
				var _LP = $(_P).offset().left;

				_L -= _LP;
				_L -= tabListCurrentItemHintCssLeft;

				var _W = $(theTab).outerWidth();

				var _R = _L+_W;


				tabListCurrentItemHint.style.clip = 'rect('+
				       '0, '+
					_R+'px, '+
					   '3px, '+
					_L+'px)'
				;

				return true;
			}

			function getPanel(input) {
				// The input argument could be a tab dom, a panel dom, an integer or a string contains a number, or simply be omitted.
				// If the input is omitted and the currentPanel exists, then the currentPanel is returned.
				// If the input is omitted while the currentPanel does NOT exist, then null is returned.
				// If the input is NOT omitted and a non-object value is provided,  the currentPanel is returned if the currentPanel exists, otherwise the null.
				// But if the input is NOT omitted and an invalid object is provided, this function returns false instead of null.
				// If a panel dom or its tab dom is provided but the panel is NOT the member of this TabPanelSet, then false instead of null is returned.
				var inputPanel;
				var theFoundPanel;
				var inputPanelIndex;

				var inputIsAnObjectThatIsNotANull = typeof input === 'object' && !!input; // handle null object
				var inputIsAPanel = (input instanceof Node) && (typeof input.panelIndex === 'number') && (input.panelIndex >= 0) &&  (typeof input.elements === 'object');
				var inputIsATab   = inputIsAPanel && (input.elements.panel instanceof Node);
				inputIsAPanel = inputIsAPanel && !inputIsATab;

				if (inputIsAnObjectThatIsNotANull) {
					if (inputIsAPanel) {
						// inputPanelIndex = parseInt(input.panelIndex);
						inputPanel = input;
						inputPanelIndex = inputPanel.panelIndex;
					} else if (inputIsATab) {
						inputPanel = input.elements.panel;
						inputPanelIndex = inputPanel.panelIndex;
					} else {
						// some nonsense object
						C.e('Invalid object provided. It might be a uncoupled tab and had skipped setup.', input);
						return false;
					}
				} else {
					inputPanelIndex = parseInt(input);
				}

				if (isNaN(inputPanelIndex)) {
					if (typeof publicStatus.currentPanelIndex !== 'number' || isNaN(publicStatus.currentPanelIndex) || !elements.currentPanel) {
						if (!status.isInitializing) {
							C.w('The desired panel can not be found, nor can the currentPanel.');
						}
						return null;
					} else {
						return elements.currentPanel;
					}
				}

				inputPanelIndex = Math.max(0, Math.min(elements.panels.length-1, inputPanelIndex));
				theFoundPanel = elements.panels[inputPanelIndex];

				if (inputPanel && (theFoundPanel !== inputPanel)) {
					C.e('The input panel is not a member of this TabPanelSet.');
					return false;
				}

				if (!theFoundPanel) {
					C.e('The input was not a dom, then a valid index was evaluated. But an invalid panel got via the index. The panels array might have issue.');
					// Either:
					//     the input was neither a panel dom nor a tab dom,
					//     so inputPanelIndex was evaluated within allowed value range,
					//     and theFoundPanel should be get from the elements.panels array.
					//     thus !theFoundPanel should be false.
					//     in short, if !inputPanel then !!theFoundPanel is hopefully always true,
					//     unless the elements.panels array contains invalid member, which is hopefully impossible.
					// Or:
					//     the input was a panel or a tab dom,
					//     but the panelIndex of the input might NOT be within allowed value range,
					//     since the input itself might not be a valid member of this TabPanelSet,
					//     thus !theFoundPanel might be true (theFoundPanel might be undefined).

					return false;
				}

				return theFoundPanel;
			}

			function getPanelViaTab(tabNameOrTabDomOrPanelIndex) {
				if (typeof tabNameOrTabDomOrPanelIndex === 'string') {
					var panelIndex = parseInt(tabNameOrTabDomOrPanelIndex);
					if (isNaN(panelIndex)) {
						var tabDomOrTabLabelDom = $('#panel-tab-'+tabNameOrTabDomOrPanelIndex)[0];
						var tabDom;
						if (tabDomOrTabLabelDom) {
							if (wlc.DOM.getRole(tabDomOrTabLabelDom) === 'tab') {
								tabDom = tabDomOrTabLabelDom;
							} else {
								tabDom = $(tabDomOrTabLabelDom).parents('[role="tab"]')[0];
							}

							return this.getPanel(tabDom);
						} else {
							return null;
						}
					}
				}

				return this.getPanel(tabNameOrTabDomOrPanelIndex);
			}

			function showPrevPanel() {
				this.showPanel(publicStatus.currentPanelIndex-1);
			}

			function showNextPanel() {
				this.showPanel(publicStatus.currentPanelIndex+1);
			}

			function showPanelViaTab(tab) {
				this.showPanel(this.getPanelViaTab(tab));
			}

			function showPanel(thePanelOrTheTabOrTheIndex, shouldTrace) {
				var thePanel = this.getPanel(thePanelOrTheTabOrTheIndex);
				if (thePanel === false) { // false means thePanel is a nonsense input, while null means omitted panel
					return false;
				}

				var shouldTakeAction = (!elements.currentPanel && !!thePanel) || (!!elements.currentPanel && (thePanel !== elements.currentPanel));

				if (!thePanel && !elements.currentPanel && !this.options.allowToShowNone) {
					shouldTakeAction = true;
					thePanel = elements.panels[0];
				}

				if (shouldTakeAction) {
					syncStatusToPanel.call(this, thePanel, shouldTrace, true);
				// } else {
				// 	C.t('Skipped');
				}
			}

			function syncStatusToPanel(thePanelOrTheTabOrTheIndex, shouldTrace, isMotiveActionFromShowPanel) {
				if (status.isOnAction) {
					// C.e('Re-entered, might encount an infinite loop invoking.');
					return false;
				}
				status.isOnAction = true;

				var thePanel = this.getPanel(thePanelOrTheTabOrTheIndex);

				if (thePanel === false) {
					return false;
				}

				if (!thePanel) {
					elements.currentTab = null;
					elements.currentPanel = null;
					publicStatus.currentPanelIndex = NaN;
				} else {
					if (shouldTrace) C.l('----------------------');
					for (var i = 0; i < elements.panels.length; i++) {
						var panel = elements.panels[i];
						_showHideOnePanel.call(this, panel, (thePanel && panel === thePanel), shouldTrace, isMotiveActionFromShowPanel);
					}

					elements.currentPanel = thePanel;
					publicStatus.currentPanelIndex = thePanel.panelIndex;
					if (thePanel.elements) {
						elements.currentTab = thePanel.elements.tab;
					} else {
						C.w('This panel [id="'+thePanel.id+'"] seems not initialized correctly.');
					}
				}

				this.slideTabCurrentItemHintTo(elements.currentTab);

				status.isOnAction = false;
			}

			function _showHideOnePanel(panel, isToShow, shouldTrace/*, isMotiveActionFromShowPanel*/) {
				if (shouldTrace) C.t(isToShow ? 'show --> ' : 'hide', panel.id);
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

					if (typeof thisController.onPanelShow === 'function') {
						thisController.onPanelShow(panel);
					}
				} else {
					panel.setAttribute('aria-hidden', true);
					$(tab).removeClass('current');
					$(panel).removeClass('current');

					if (typeof thisController.onPanelHide === 'function') {
						thisController.onPanelHide(panel);
					}
				}

				return true;
			}
		};
	}).call(UI);
}).call(window.webLogicControls);