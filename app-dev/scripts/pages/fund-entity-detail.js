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


	var eChartFundUnitNetWorthRootElement    = $('#panel-fund-unit-net-worth     .chart-block')[0];
	var eChartFundNetWorthTrendRootElement   = $('#panel-fund-net-worth-trend    .chart-block')[0];
	var eChartFundWeekToYearTrendRootElement = $('#panel-fund-week-to-year-trend .chart-block')[0];
	var eChartFund10kSharesTrendRootElement  = $('#panel-fund-10k-shares-trend   .chart-block')[0];
	var eChartFundUnitNetWorth     = createEChartsForFundUnitNetWorth   (eChartFundUnitNetWorthRootElement);
	var eChartFundNetWorthTrend    = createEChartsForFundNetWorthTrend  (eChartFundNetWorthTrendRootElement);
	var eChartFunddWeekToYearTrend = createEChartsForFundWeekToYearTrend(eChartFundWeekToYearTrendRootElement);
	var eChartFund10kSharesTrend   = createEChartsForFund10kSharesTrend (eChartFund10kSharesTrendRootElement);


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
				data = _generateFakeData(13, 'tradingDay', 'accumulateIncome', 0.888, 8.777, true, 27.333);
				_addFakeHuShenDataTo(data, 'huShen', 'accumulateIncome', -25, 45);
				updateEChartsForFundNetWorthTrend(eChartFundNetWorthTrend, data);
				break;

			case 'panel-fund-week-to-year-trend':
				data = _generateFakeData(13, 'tradingDay', 'unitNV', 0.125, 2.345);
				updateEChartsForFundWeekToYearTrend(eChartFunddWeekToYearTrend, data);
				break;

			case 'panel-fund-10k-shares-trend':
				data = _generateFakeData(13, 'tradingDay', 'unitNV', 0.125, 2.345);
				updateEChartsForFund10kSharesTrend(eChartFund10kSharesTrend, data);
				break;

			default:
		}
	}

	function _formatChartToolTip(label, value, date) {
		return [
			'<article class="echart-tooltip">',
				'<ul class="f-list">',
					'<li>',
						'<span class="label">'+label+' </span>',
						'<span class="value">'+value+'</span>',
					'</li>',
					'<li>',
						'<span class="label">时间: </span>',
						'<span class="value">'+date+'</span>',
					'</li>',
				'</ul>',
			'</article>'
		].join('');
	}
	function chartToolTipFormatterForFundUnitNetWorth(parameters) {
		var _o = parameters[0];
		return _formatChartToolTip('单位净值:', _o.value, _o.name);
	}
	function chartToolTipFormatterForFundWeekToYearTrend(parameters) {
		var _o = parameters[0];
		return _formatChartToolTip('七日年化(%):', _o.value, _o.name);
	}
	function chartToolTipFormatterForFund10kSharesTrend(parameters) {
		var _o = parameters[0];
		return _formatChartToolTip('万份年收益(元):', _o.value, _o.name);
	}




	function createEChartsForFundUnitNetWorth(rootElement) {
		if (!window.echarts || !rootElement) return false;
		var echart = window.echarts.init(rootElement);
		// C.l(rootElement);

		var chartColors = {
			corssHair: '#ff6600',
			axesLabels: '#cccccc',
			axesLines: '#f1f1f1',
			graph: '#e39f3d'
		};

		var axesLabelsFont = {
			size: 8,
			family: 'consolas'
		};

		var eChartOptions = {
			tooltip: {
				trigger: 'axis',
				// alwaysShowContent: false,
				// axisPointer: {
				//     type: 'shadow'
				// 	type: 'cross',
				// 	crossStyle: {
				// 		color: chartColors.corssHair,
				// 		type: 'solid',
				// 		opacity: 0.4
				// 	}
				// },
				formatter: chartToolTipFormatterForFundUnitNetWorth,
				backgroundColor: 'transparent',
				padding: 0
			},
			grid: {
				left: 16,
				right: 16,
				top: 10,
				bottom: 10,
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
					// label: {
					// 	normal: {
					// 		show: false,
					// 	}
					// },
					showAllSymbol: true,
					// symbolSize: 8,
					hoverAnimation: true,
					itemStyle: {
						normal: {
							borderColor: chartColors.graph,
							// opacity: 0
						},
						// emphasis: {
						// 	borderColor: chartColors.graph,
						// 	opacity: 1
						// }
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
			yData[i] = data[i].unitNV.toFixed(2);
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
		if (!window.echarts || !rootElement) return false;
		var echart = window.echarts.init(rootElement);
		// C.l(rootElement);

		var chartColors = {
			corssHair: '#ff6600',
			axesLabels: '#cccccc',
			axesLines: '#f1f1f1',
			graph1: '#e39f3d',
			graph2: '#ff6600',
		};

		var axesLabelsFont = {
			size: 8,
			family: 'consolas'
		};

		var eChartOptions = {
			tooltip: {
				show: false,
				// trigger: 'axis',
				// axisPointer: {
				// 	type: 'cross',
				// 	crossStyle: {
				// 		color: chartColors.corssHair,
				// 		type: 'solid',
				// 		opacity: 0.4
				// 	}
				// }
			},
			grid: {
				left: 16,
				right: 16,
				top: 10,
				bottom: 10,
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
			yData1[i] = data[i].accumulateIncome.toFixed(2);
			yData2[i] = data[i].huShen.toFixed(2);
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


	function createEChartsForFundWeekToYearTrend(rootElement) {
		if (!window.echarts || !rootElement) return false;
		var echart = window.echarts.init(rootElement);
		// C.l(rootElement);

		var chartColors = {
			corssHair: '#ff6600',
			axesLabels: '#cccccc',
			axesLines: '#f1f1f1',
			graph: '#e39f3d'
		};

		var axesLabelsFont = {
			size: 8,
			family: 'consolas'
		};

		var eChartOptions = {
			tooltip: {
				trigger: 'axis',
				// alwaysShowContent: false,
				// axisPointer: {
				//     type: 'shadow'
				// 	type: 'cross',
				// 	crossStyle: {
				// 		color: chartColors.corssHair,
				// 		type: 'solid',
				// 		opacity: 0.4
				// 	}
				// },
				formatter: chartToolTipFormatterForFundWeekToYearTrend,
				backgroundColor: 'transparent',
				padding: 0
			},
			grid: {
				left: 16,
				right: 16,
				top: 10,
				bottom: 10,
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
					// label: {
					// 	normal: {
					// 		show: false,
					// 	}
					// },
					showAllSymbol: true,
					// symbolSize: 8,
					hoverAnimation: true,
					itemStyle: {
						normal: {
							borderColor: chartColors.graph,
							// opacity: 0
						},
						// emphasis: {
						// 	borderColor: chartColors.graph,
						// 	opacity: 1
						// }
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
	function updateEChartsForFundWeekToYearTrend(echart, data) {
		if (!echart || !data) return;

		var xAxisLabels = [];
		var yData = [];

		for (var i = 0; i < data.length; i++) {
			xAxisLabels[i] = data[i].tradingDay.slice(5);
			yData[i] = data[i].unitNV.toFixed(2);
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


	function createEChartsForFund10kSharesTrend(rootElement) {
		if (!window.echarts || !rootElement) return false;
		var echart = window.echarts.init(rootElement);
		// C.l(rootElement);

		var chartColors = {
			corssHair: '#ff6600',
			axesLabels: '#cccccc',
			axesLines: '#f1f1f1',
			graph: '#e39f3d'
		};

		var axesLabelsFont = {
			size: 8,
			family: 'consolas'
		};

		var eChartOptions = {
			tooltip: {
				trigger: 'axis',
				// alwaysShowContent: false,
				// axisPointer: {
				//     type: 'shadow'
				// 	type: 'cross',
				// 	crossStyle: {
				// 		color: chartColors.corssHair,
				// 		type: 'solid',
				// 		opacity: 0.4
				// 	}
				// },
				formatter: chartToolTipFormatterForFund10kSharesTrend,
				backgroundColor: 'transparent',
				padding: 0
			},
			grid: {
				left: 16,
				right: 16,
				top: 10,
				bottom: 10,
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
					// label: {
					// 	normal: {
					// 		show: false,
					// 	}
					// },
					showAllSymbol: true,
					// symbolSize: 8,
					hoverAnimation: true,
					itemStyle: {
						normal: {
							borderColor: chartColors.graph,
							// opacity: 0
						},
						// emphasis: {
						// 	borderColor: chartColors.graph,
						// 	opacity: 1
						// }
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
	function updateEChartsForFund10kSharesTrend(echart, data) {
		if (!echart || !data) return;

		var xAxisLabels = [];
		var yData = [];

		for (var i = 0; i < data.length; i++) {
			xAxisLabels[i] = data[i].tradingDay.slice(5);
			yData[i] = data[i].unitNV.toFixed(2);
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




	var $coveringLayer = $('#cl-funds-trading-notice');
	var $headerButtonNavBack           = $('.page-header #header-nav-back');
	var $headerButtonHideCoveringLayer = $('.page-header #hide-covering-layer');

	$('#row-show-funds-trading-notice-layer').on('click', function () {
		showOrHideCoveryingLayer($coveringLayer, true, $headerButtonNavBack, $headerButtonHideCoveringLayer);
	});

	$headerButtonHideCoveringLayer.on('click', function () {
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
