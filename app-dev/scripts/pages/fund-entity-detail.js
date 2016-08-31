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
		var tabPanelSetToot = this;
		var tabPanelSet = new wlc.UI.TabPanelSet(tabPanelSetToot, {
			initTab: app.data.URIParameters.tabLabel,
			onPanelShow: updateChart
		});

		app.controllers.tabPanelSets.push(tabPanelSet);

		$(tabPanelSetToot).find('.panel').each(function () {
			var panel = this;
			$('.ruler').each(function () {
				var $allScales = $(this).find('.ruler-scale-chief');

				$allScales.each(function () {
					var rulerScale = this;
					var $rulerScale = $(rulerScale);

					$rulerScale.find('> .label').on('click', function () {
						for (var i = 0; i < $allScales.length; i++) {
							var _rScale = $allScales[i];
							if (_rScale === rulerScale) {
								$rulerScale.addClass('current');
							} else {
								$(_rScale).removeClass('current');
							}
						}

						updateChart(panel);
					});
				});
			});
		});
	});





	function updateChart(panel) {
		// C.l('updateChart:\n\t"#'+panel.id+'"', panel);
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



	var $coveringLayer = $('#cl-funds-trading-notice');
	var $headerButtonNavBack            = $('.page-header #header-nav-back');
	var $headerButtonHideCoveringLayer = $('.page-header #hide-covering-layer');

	$('#row-show-funds-trading-notice-layer').on('click', function () {
		showOrHideCoveryingLayer($coveringLayer, true, $headerButtonNavBack, $headerButtonHideCoveringLayer);
	});

	$headerButtonHideCoveringLayer.on('click', function () {
		showOrHideCoveryingLayer($coveringLayer, false, $headerButtonNavBack, $headerButtonHideCoveringLayer);
	});

	$coveringLayer.find('.row').on('click', function () {
		var bankName = $(this).find('.left')[0];
		if (bankName) {
			bankName = bankName.dataset.value;
			var vf = fakeInputBankName.virtualField;
			if (vf) {
				vf.setValue(bankName);
			} else {
				// $fakeInputBankName.val(bankName).addClass('non-empty-field'); 
			}

		}

		showOrHideCoveryingLayer($coveringLayer, false, $headerButtonNavBack, $headerButtonHideCoveringLayer);
	});

	function showOrHideCoveryingLayer($cl, isToShow, $buttonToShowWithoutCl, $buttonToShowWithCl) {
		if (!!isToShow) {
			$cl.show();
			$buttonToShowWithCl.show();
			$buttonToShowWithoutCl.hide();
		} else {
			$cl.hide();
			$buttonToShowWithCl.hide();
			$buttonToShowWithoutCl.show();
		}
	}

});
