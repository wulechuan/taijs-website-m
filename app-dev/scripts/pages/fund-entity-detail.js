$(function () {
	var eChartFundUnitNetWorth = createEChartsForFundUnitNetWorth($('#fund-chart-unit-net-worth')[0]);

	// var dataFuntUnitNetWorth = [
	// 	{ date: '2016-03-19', value: 0.195 }
	// ];
	var dataFuntUnitNetWorth = _generateFakeData();


	function _generateFakeData() {
		var startMonth = 4;
		var startDay = 23;

		var startDate = new Date();
		startDate = startDate.setFullYear(2016,startMonth,startDay);

		var data = [];
		var oneDay = 24 * 3600 * 1000;
		for (var i = 0; i < 16; i++) {
			var date = new Date(startDate + i * oneDay);
			var _M = date.getMonth();
			var _D = date.getDate();
			_M = (_M < 10 ? '0' : '') + _M;
			_D = (_D < 10 ? '0' : '') + _D;

			data[i] = {
				date: _M + '-' + _D,
				value: Math.random() * 3 + 0.123
			};
		}

		return data;
	}


	updateEChartsForFundUnitNetWorth(eChartFundUnitNetWorth, dataFuntUnitNetWorth);

	function createEChartsForFundUnitNetWorth(rootElement) {
		if (!window.echarts) return false;
		var echart = window.echarts.init(rootElement);

		var colors = {
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
					    color: colors.corssHair,
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
							color: colors.axesLabels
						}
					},
					axisLine: {
						show: true,
						lineStyle: {
							color: colors.axesLines
						}
					},
					splitLine: {
						show: true,
						lineStyle: {
							color: colors.axesLines
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
							color: colors.axesLabels
						}
					},
					axisLine: {
						show: true,
						lineStyle: {
							color: colors.axesLines
						}
					},
					splitLine: {
						show: true,
						lineStyle: {
							color: colors.axesLines
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
				            borderColor: colors.graph,
						    opacity: 1
						}
				    },
				    lineStyle: {
				        normal: {
					    	width: 1,
				            color: colors.graph
				        }
				    },
				    areaStyle: {
				        normal: {
				            color: colors.graph,
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
			xAxisLabels[i] = data[i].date;
			yData[i] = data[i].value;
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








var dataFuntUnitNetWorth = _generateFakeData();

function _generateFakeData() {
	var startMonth = 4;
	var startDay = 23;

	var startDate = new Date();
	startDate = startDate.setFullYear(2016,startMonth,startDay);

	var data = [];
	var oneDay = 24 * 3600 * 1000;
	for (var i = 0; i < 16; i++) {
		var date = new Date(startDate + i * oneDay);
		var _M = date.getMonth();
		var _D = date.getDate();
		_M = (_M < 10 ? '0' : '') + _M;
		_D = (_D < 10 ? '0' : '') + _D;

		data[i] = {
			date: _M + '-' + _D,
			value: Math.random() * 3 + 0.123
		};
	}

	return data;
}


var xAxisLabels = [];
var yData = [];

for (var i = 0; i < dataFuntUnitNetWorth.length; i++) {
	xAxisLabels[i] = dataFuntUnitNetWorth[i].date;
	yData[i] = dataFuntUnitNetWorth[i].value;
}



var colors = {
	axesLabels: '#ccc',
	axesLines: '#c1c1c1'
};

var axesLabelsFont = {
	size: 8,
	family: 'consolas'
};

option = {
	tooltip: {
		trigger: 'axis',
		axisPointer: {
			type: 'cross',
			crossStyle: {
			    color: '#ff6600',
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
    		data: xAxisLabels,
			axisLabel: {
				textStyle: {
					fontSize: axesLabelsFont.size,
					fontFamily: axesLabelsFont.family,
					color: colors.axesLabels
				}
			},
			axisLine: {
				show: true,
				lineStyle: {
					color: colors.axesLines
				}
			},
			splitLine: {
				show: true,
				lineStyle: {
					color: colors.axesLines
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
					color: colors.axesLabels
				}
			},
			axisLine: {
				show: true,
				lineStyle: {
					color: colors.axesLines
				}
			},
			splitLine: {
				show: true,
				lineStyle: {
					color: colors.axesLines
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
		    data: yData,
		    symbolSize: 8,
		    hoverAnimation: false,
		    itemStyle: {
		        normal: {
    		        opacity: 0
		        },
				emphasis: {
		            borderColor: '#4285f4',
				    opacity: 1
				}
		    },
		    lineStyle: {
		        normal: {
		            color: '#4285f4'
		        }
		    },
		    areaStyle: {
		        normal: {
		            color: '#4285f4',
		            opacity: 0.4
		        }
		    }
		}
	]
};
