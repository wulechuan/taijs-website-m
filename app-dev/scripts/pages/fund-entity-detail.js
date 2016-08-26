$(function () {
	function _generateFakeData(count, pName1, pName2, vRange1, vRange2, isAccumulate, accumBaseValue) {
		var startMonth = 4;
		var startDay = 23;

		var startDate = new Date();
		startDate = startDate.setFullYear(2016, startMonth, startDay);

		var data = [];
		var oneDay = 24 * 3600 * 1000;
		for (var i = 0; i < count; i++) {
			var date = new Date(startDate + i * oneDay);
			var _Y = date.getFullYear();
			var _M = date.getMonth();
			var _D = date.getDate();
			_M = (_M < 10 ? '0' : '') + _M;
			_D = (_D < 10 ? '0' : '') + _D;

			var record = {};
			record[pName1] = _Y + '-' + _M + '-' + _D;

			var value = Math.random() * (vRange2 - vRange1) + vRange1;

			if (isAccumulate) {
				record[pName2] = accumBaseValue;
				accumBaseValue += value;
			} else {
				record[pName2] = value;

			}

			data[i] = record;
		}

		return data;
	}

	function _addFakeHuShenDataTo(data, huShenPName, refPName, vRange1, vRange2) {
		for (var i = 0; i < data.length; i++) {
			var record = data[i];
			var value = Math.abs(Math.random() * (vRange2 - vRange1) + vRange1);
			value *= (Math.random() * 4 > 0.5) ? 1 : -1;
			record[huShenPName] = record[refPName] + value;
		}

		return data;
	}




	var wlc = window.webLogicControls;
	var app = window.taijs.app;


	var eChartFundUnitNetWorthRootElement  = $('#panel-fund-unit-net-worth  .chart-block')[0];
	var eChartFundNetWorthTrendRootElement = $('#panel-fund-net-worth-trend .chart-block')[0];
	var eChartFundUnitNetWorth  = createEChartsForFundUnitNetWorth (eChartFundUnitNetWorthRootElement);
	var eChartFundNetWorthTrend = createEChartsForFundNetWorthTrend(eChartFundNetWorthTrendRootElement);


	$('.tab-panel-set').each(function () {
		var tabPanelSet = new wlc.UI.TabPanelSet(this, {
			initTab: app.data.URIParameters.tabLabel,
			onPanelShow: onPanelShow
		});

		app.controllers.tabPanelSets.push(tabPanelSet);
	});


	// var tabPanelSet = app.controllers.tabPanelSets[0];
	// tabPanelSet.onPanelShow = onPanelShow;




	function onPanelShow(panel) {
		// C.l('onPanelShow:\n\t"#'+panel.id+'"');
		var data;

		switch (panel.id) {
			case 'panel-fund-unit-net-worth':
				data = _generateFakeData(13, 'tradingDay', 'unitNV', 0.125, 2.345);
				updateEChartsForFundUnitNetWorth(eChartFundUnitNetWorth, data);
				break;

			case 'panel-fund-net-worth-trend':
				data = _generateFakeData(13, 'tradingDay', 'accumulateIncome', 0.888, 8.888, true, 27.333);
				_addFakeHuShenDataTo(data, 'huShen', 'accumulateIncome', -25, 45);
				updateEChartsForFundNetWorthTrend(eChartFundNetWorthTrend, data);
				break;

			case 'panel-fund-week-to-year-trend':
				data = _generateFakeData(13, 'tradingDay', 'unitNV', 0.125, 2.345);
				updateEChartsForFundNetWorthTrend(eChartFundNetWorthTrend, data);
				break;

			case 'panel-fund-10k-shares-trend':
				data = _generateFakeData(13, 'tradingDay', 'unitNV', 0.125, 2.345);
				updateEChartsForFundNetWorthTrend(eChartFundNetWorthTrend, data);
				break;

			default:
		}
	}



	function createEChartsForFundUnitNetWorth(rootElement) {
		if (!window.echarts) return false;
		var echart = window.echarts.init(rootElement);
		// C.l(rootElement);

		var chartColors = {
			corssHair: '#ff6600',
			axesLabels: '#cccccc',
			axesLines: '#f1f1f1',
			graph: '#4285f4'
		};

		var axesLabelsFont = {
			size: 8,
			family: 'consolas'
		};

		var eChartOptions = {
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'cross',
					crossStyle: {
						color: chartColors.corssHair,
						type: 'solid',
						opacity: 0.4
					}
				}
			},
			toolbox: {
				feature: {
					saveAsImage: {}
				}
			},
			grid: {
				left: '10px',
				right: '0',
				top: '10px',
				bottom: '10px',
				containLabel: true
			},
			xAxis: [
				{
					type: 'category',
					boundaryGap: false,
					data: [], // required
					axisLabel: {
						textStyle: {
							fontSize: axesLabelsFont.size,
							fontFamily: axesLabelsFont.family,
							color: chartColors.axesLabels
						}
					},
					axisLine: {
						show: true,
						lineStyle: {
							color: chartColors.axesLines
						}
					},
					splitLine: {
						show: true,
						lineStyle: {
							color: chartColors.axesLines
						}
					}
				}
			],
			yAxis: [
				{
					type: 'value',
					axisLabel: {
						textStyle: {
							fontSize: axesLabelsFont.size,
							fontFamily: axesLabelsFont.family,
							color: chartColors.axesLabels
						}
					},
					axisLine: {
						show: true,
						lineStyle: {
							color: chartColors.axesLines
						}
					},
					splitLine: {
						show: true,
						lineStyle: {
							color: chartColors.axesLines
						}
					}
				}
			],
			series: [
				{
					type:'line',
					label: {
						normal: {
							show: false,
						}
					},
					symbolSize: 8,
					hoverAnimation: false,
					itemStyle: {
						normal: {
							opacity: 0
						},
						emphasis: {
							borderColor: chartColors.graph,
							opacity: 1
						}
					},
					lineStyle: {
						normal: {
							width: 1,
							color: chartColors.graph
						}
					},
					areaStyle: {
						normal: {
							color: chartColors.graph,
							opacity: 0.4
						}
					}
				}
			]
		};


		echart.setOption(eChartOptions);

		return echart;
	}

	function updateEChartsForFundUnitNetWorth(echart, data) {
		if (!echart || !data) return;

		var xAxisLabels = [];
		var yData = [];

		for (var i = 0; i < data.length; i++) {
			xAxisLabels[i] = data[i].tradingDay.slice(5);
			yData[i] = data[i].unitNV;
		}

		var eChartOptions = {
			xAxis: [{
				data: xAxisLabels
			}],
			series: [{
				data: yData
			}]
		};

		echart.setOption(eChartOptions);
	}



	function createEChartsForFundNetWorthTrend(rootElement) {
		if (!window.echarts) return false;
		var echart = window.echarts.init(rootElement);
		// C.l(rootElement);

		var chartColors = {
			corssHair: '#ff6600',
			axesLabels: '#cccccc',
			axesLines: '#f1f1f1',
			graph1: '#4285f4',
			graph2: '#ff6600',
		};

		var axesLabelsFont = {
			size: 8,
			family: 'consolas'
		};

		var eChartOptions = {
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'cross',
					crossStyle: {
						color: chartColors.corssHair,
						type: 'solid',
						opacity: 0.4
					}
				}
			},
			toolbox: {
				feature: {
					saveAsImage: {}
				}
			},
			grid: {
				left: '10px',
				right: '0',
				top: '10px',
				bottom: '10px',
				containLabel: true
			},
			xAxis: [
				{
					type: 'category',
					boundaryGap: false,
					data: [], // required
					axisLabel: {
						textStyle: {
							fontSize: axesLabelsFont.size,
							fontFamily: axesLabelsFont.family,
							color: chartColors.axesLabels
						}
					},
					axisLine: {
						show: true,
						lineStyle: {
							color: chartColors.axesLines
						}
					},
					splitLine: {
						show: true,
						lineStyle: {
							color: chartColors.axesLines
						}
					}
				}
			],
			yAxis: [
				{
					type: 'value',
					axisLabel: {
						textStyle: {
							fontSize: axesLabelsFont.size,
							fontFamily: axesLabelsFont.family,
							color: chartColors.axesLabels
						}
					},
					axisLine: {
						show: true,
						lineStyle: {
							color: chartColors.axesLines
						}
					},
					splitLine: {
						show: true,
						lineStyle: {
							color: chartColors.axesLines
						}
					}
				}
			],
			series: [
				{
					type:'line',
					label: {
						normal: {
							show: false,
						}
					},
					symbolSize: 8,
					hoverAnimation: false,
					itemStyle: {
						normal: {
							opacity: 0
						},
						emphasis: {
							borderColor: chartColors.graph1,
							opacity: 1
						}
					},
					lineStyle: {
						normal: {
							width: 1,
							color: chartColors.graph1
						}
					}
				},
				{
					type:'line',
					label: {
						normal: {
							show: false,
						}
					},
					symbolSize: 8,
					hoverAnimation: false,
					itemStyle: {
						normal: {
							opacity: 0
						},
						emphasis: {
							borderColor: chartColors.graph2,
							opacity: 1
						}
					},
					lineStyle: {
						normal: {
							width: 1,
							color: chartColors.graph2
						}
					}
				}
			]
		};


		echart.setOption(eChartOptions);

		return echart;
	}

	function updateEChartsForFundNetWorthTrend(echart, data) {
		if (!echart || !data) return;

		var xAxisLabels = [];
		var yData1 = [];
		var yData2 = [];

		for (var i = 0; i < data.length; i++) {
			xAxisLabels[i] = data[i].tradingDay.slice(5);
			yData1[i] = data[i].accumulateIncome;
			yData2[i] = data[i].huShen;
		}

		var eChartOptions = {
			xAxis: [{
				data: xAxisLabels
			}],
			series: [{
				data: yData1
			},{
				data: yData2
			}]
		};

		echart.setOption(eChartOptions);
	}




	function Ruler(rootElement, initOptions) {
		rootElement = wlc.DOM.validateRootElement(rootElement, this);
		var OT = WCU.objectToolkit;

		var status = {};

		var elements = {
			root: rootElement,
			allLabels: []
		};

		this.rebuild = function () {
			console.log('Rebuilding an existing {'+this.constructor.name+'}...');
			config.call(this);
		};

		init.call(this);
		OT.destroyInstanceIfInitFailed.call(this, status, function () {
			rootElement.virtualForm = this;
		});

		function init() {
			status.isInitializing = true;
			status.noNeedToReconstruct = false;

			if (rootElement.virtualForm instanceof UI.VirtualForm) {
				rootElement.virtualForm.rebuild();
				status.noNeedToReconstruct = true;
				return;
			}

			if (!config.call(this)) return;

			delete status.isInitializing;
			delete status.noNeedToReconstruct;
		}

		function config() {
			var isFirstTime = !!status.isInitializing;

			var oldRequiredFields = elements.requiredFields;
			// var oldButtonsForSubmission = this.elements.buttonsForSubmission;

			// requiredFieldsChanged does not mean the value of these elements changed, but addition or deletion of them instead
			var requiredFieldsChanged = oldRequiredFields.length !== elements.requiredFields.length; // fake implementation

			collectElements.call(this);


			if (isFirstTime && elements.requiredFields.length < 1) {
				status.noNeedToConstruct = true;
				return false;
			}


			if (isFirstTime || requiredFieldsChanged) {
				this.elements.root = rootElement; // just for safety
				this.elements.allFields            = [].concat(elements.allFields);
				this.elements.requiredFields       = [].concat(elements.requiredFields);
				this.elements.buttonsForSubmission = [].concat(elements.buttonsForSubmission);

				buildAllVirtualFieldsAsNeeded.call(this);

				if (status.rootElementIsAForm) {
					$(rootElement).on('reset', function (/*event*/) {
						// event.preventDefault();
						var fields = elements.allFields;
						for (var i = 0; i < fields.length; i++) {
							fields[i].virtualField.clearValue();
						}
					});
				}
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

			var $allInputs = $allInvolvedElements.filter(function (index, el) {
				var tnlc = el.tagName.toLowerCase();

				if (tnlc === 'input' || tnlc === 'textarea' || tnlc === 'select') {
					return true;
				}

				var ce = el.getAttribute('contentEditable');
				if (typeof ce === 'string') ce = ce.toLowerCase();

				return ce === 'true';
			});

			var $allRequiredInputs = $allInputs.filter(function (index, el) {
				return el.hasAttribute('required');
			});


			var $buttonsForSubmission = $allInvolvedElements.filter(function (index, el) {
				var attr =  el.getAttribute('button-action');
				if (attr) attr = attr.toLowerCase();
				return attr==='submit';
			});

			elements.allFields            = Array.prototype.slice.apply($allInputs);
			elements.requiredFields       = Array.prototype.slice.apply($allRequiredInputs);
			elements.buttonsForSubmission = Array.prototype.slice.apply($buttonsForSubmission);
		}

		function buildAllVirtualFieldsAsNeeded() {
			var i;
			var atLeastOneNewVirtualFieldCreated = false;
			var fieldElements = elements.allFields;
			for (i = 0; i < fieldElements.length; i++) {
				var thisOneCreated = createNewVirtualFieldAsNeeded.call(this, i);
				atLeastOneNewVirtualFieldCreated = atLeastOneNewVirtualFieldCreated || thisOneCreated;
			}

			// if (atLeastOneNewVirtualFieldCreated) {
			// 	C.t('validating virtualForm after building virtualFields...');
			// 	this.validate();
			// }
		}

		function createNewVirtualFieldAsNeeded(index) {
			// index = parseInt(index);
			// if (isNaN(index) || index <0 || index >= elements.requiredFields.length) return false;
			var field = elements.requiredFields[index];
			// if (!(field instanceof Node)) return;
			var virtualField = new UI.VirtualField(field, {
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
			if (!field || !(field.virtualField instanceof UI.VirtualField)) return null;

			return field;
		}

		// function getVirtualField(index) {
		// 	var field = getField.call(this, index);
		// 	if (field) {
		// 		return field.virtualField;
		// 	}

		// 	return;
		// }

		function validate() {
			// C.t('validating virtualForm');
			for (var i = 0; i < elements.requiredFields.length; i++) {
				validateFieldByIndex.call(this, i);
			}

			// C.t('CHECKING AFTER VALIDATING VIRTUALFORM...');
			checkValidities.call(this);
		}

		function checkValidities(options) {
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

				for (var i = 0; i < publicStatus.allFieldsValidities.length; i++) {
					if (!publicStatus.allFieldsValidities[i]) {
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
			var field = getField.call(this, index);
			if (field) {
				field.virtualField.validate(true);
			}
		}

		function setFieldValidityByIndex(index, isValid, holdOnCheckingFormOverallValidities) {
			// C.l('recieving field status: ', index, isValid);
			var field = getField.call(this, index);
			if (field && typeof isValid === 'boolean') {
				publicStatus.allFieldsValidities[index] = isValid;

				if (!holdOnCheckingFormOverallValidities) {
					// C.l('\t ==> CHECKING on VirtualField Callback...');
					checkValidities.call(this);
				}
			}

		}
	};
});
