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
		var yData = [];

		for (var i = 0; i < data.length; i++) {
			xAxisLabels[i] = data[i].tradingDay.slice(5);
			yData[i] = data[i].accumulateIncome;
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
});
