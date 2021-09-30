import React from "react";
import ReactEcharts from 'echarts-for-react';
import * as Setting from "./Setting";
import {
  Select
} from 'antd';
import * as dataTool from "../node_modules/echarts/dist/extension/dataTool.js"
const {
  Option
} = Select;

function getScopeId(scope) {
  return scope.text;
}

function getScopeId2(scope) {
  return `${scope.text} - ${scope.type}`;
}

function PieDataSum(data) {
  data = data.flat();
  let sum = 0;
  for (var i = data.length - 1; i >= 0; i--) {
    sum += data[i];
  }
  return sum;
}

function otherPercent(data, sum) {
  data = data.slice(data.length - 4);
  data = data.flat();
  let percent = 0;
  let othersum = 0;
  for (var i = data.length - 1; i >= 0; i--) {
    othersum += data[i];
  }
  percent = ((othersum / sum) * 100)
  return [percent, othersum];
}

function CompositePieDataProcess(legendData, data, othersum, chart) {
  let res = [];
  for (var i = 0; i <= legendData.length - 4; i++) {
    if (i !== legendData.length - 4) {
      var item = {
        value: data[i],
        name: legendData[i],
        itemStyle: {
          color: chart.pieColors[i]
        }
      };
      res.push(item);
    } else {
      var otheritem = {
        value: othersum,
        name: "其它",
        itemStyle: {
          color: chart.pieColors[i]
        }
      };
      res.push(otheritem);
    }
  }
  return res
}

function Processcompositepie(data, lengend) {
  let res = [];
  data = data.slice(data.length - 4);
  lengend = lengend.slice(lengend.length - 4)
  for (var i = 0; i < lengend.length; i++) {
    let piedata = [];
    piedata.push(lengend[i]);
    piedata.push(data[i]);
    res.push(piedata);
  }
  return res;
}

function getMarkLineData(percent, height, width, otherdata) {
  let x0 = width * 0.2; // 圆心x轴坐标
  let x1 = x0 + (height * 0.45) * Math.cos((45 * 3.14) / 180);
  let y1 = height * 0.5 - (height * 0.45) * Math.sin((45 * 3.14) / 180); //先定死起始点坐标
  let ao = 360 * (percent / 100); // 扇形角度
  let ao1 = 0; // 用来计算的坐标角度
  ao1 = ao <= 45 ? 45 - ao : 360 - (ao - 45);
  let x2 = 0,
    y2 = 0;
  x2 = x0 + (height * 0.45) * Math.cos((ao1 * 3.14) / 180);
  y2 = height * 0.5 - (height * 0.45) * Math.sin((ao1 * 3.14) / 180);
  console.log(y2)
  return [
    [{
      x: x1,
      y: y1,
    },
    {
      coord: ["其它", otherdata],
      symbol: "none",
    },
    ],
    [{
      x: x2,
      y: y2,
    },
    {
      coord: ["其它", 0],
      symbol: "none",
    },
    ],
  ];
}

function PieDataProcess(legendData, data) {
  let res = [];
  for (var i = 0; i < legendData.length; i++) {
    var item = {
      value: data[i],
      name: legendData[i]
    };
    res.push(item);
  }
  return res
}

function toMin(yAxisData) {
  if ((Math.min.apply(null, yAxisData) >= 0) && (Math.min.apply(null, yAxisData) <= 10)) {
    return Math.min.apply(null, yAxisData);
  } else {
    return Math.min.apply(null, yAxisData) - 10;
  }
};

function toMax(yAxisData) {
  if ((Math.max.apply(null, yAxisData) >= 90) && (Math.max.apply(null, yAxisData) <= 100)) {
    return Math.max.apply(null, yAxisData);
  } else {
    return Math.max.apply(null, yAxisData) + 10;
  }
}

function getindicatorData(indicatorname) {
  let res = [];
  indicatorname.forEach(value => {
    res.push({
      name: value,
      max: 100
    });
  });
  res[0].axisLabel = {
    show: true
  };
  return res;
}

function getMarkPointsForBarFullY(chart, data) {
  let markPoints = [];
  chart.scopes.forEach((scope, i) => {
    if (scope.type === "分位数") {
      const dataRow = data[i];
      markPoints.push({
        name: `我 - ${getScopeId2(scope)}`,
        value: " 我",
        xAxis: i,
        yAxis: dataRow[0] * 100,
        symbolRotate: -90,
        symbolOffset: [50, 0],
        label: {
          offset: [2, 3],
        },
        tooltip: {
          show: false,
        },
      });
    }
  });
  return markPoints;
}

function getMarkPointsForBarFullX(chart, data) {
  let markMap = {};
  chart.scopes.forEach((scope, i) => {
    if (scope.type === "标记") {
      const dataRow = data[i];
      if (dataRow === undefined) {
        return;
      }

      markMap[getScopeId(scope)] = dataRow.indexOf(1);
    }
  });

  let markPoints = [];
  let index = 0;
  chart.scopes.forEach((scope, i) => {
    if (scope.type === "默认") {
      const optionIndex = markMap[getScopeId(scope)];
      if (optionIndex !== undefined) {
        const dataRow = data[i];
        const x = dataRow.slice(0, optionIndex).reduce((sum, current) => sum + current, 0) + dataRow[optionIndex] / 2;
        markPoints.push({
          name: `我 - ${getScopeId2(scope)}`,
          value: "我",
          xAxis: x * 100,
          yAxis: index,
          symbolOffset: [0, -10],
          tooltip: {
            show: false,
          },
        });
      }
      index += 1;
    }
  });
  return markPoints;
}

function getScopeRangeText(range) {
  if (range === "全校") {
    return "全校平均";
  } else if (range === "全市") {
    return "全市平均";
  } else {
    return range;
  }
}

function getScopeLabel(scope) {
  // return `${scope.text}—${getScopeRangeText(scope.range)}`;
  return `${getScopeRangeText(scope.range)}`;
}

function getScopeText(scope) {
  // return `${scope.text}—${getScopeRangeText(scope.range)}`;
  return `${getScopeRangeText(scope.text)}`;
}

function getScopeArea(scope) {
  // return `${scope.text}—${getScopeRangeText(scope.range)}`;
  return `${getScopeRangeText(scope.area)}`;
}

function xAxisprocess(length0, length1, length2, xdata, isY) {
  let xAxis = [];
  if (length0 !== 0) {
    xAxis.push({
      show: true,
      type: "category",
      data: xdata,
      gridIndex: 0,
      nameGap: 0,
      axisLabel: {
        fontSize: 10,
        color: "black",
        lineHeight: 0,
        rotate: isY ? 0 : 90,
      },
      axisLine: {
        lineStyle: {
          color: "black",
        },
      },
      axisTick: {
        lineStyle: {
          color: "balck",
          length: 20,
        },
      },
      zlevel: 2,
    });
  }
  if (length1 !== 0) {
    xAxis.push({
      type: "category",
      gridIndex: 1,
      axisLine: {
        show: false,
      },
      zlevel: 1,
    });

  }
  if (length2 !== 0) {
    xAxis.push({
      type: "category",
      gridIndex: 2,
      axisLine: {
        show: false,
      },
    });
  }
  return xAxis;
}

function yAxisprocess(length0, length1, length2) {
  let yAxis = [];
  if (length0 !== 0) {
    yAxis.push({
      type: "value",
      gridIndex: 0,
      max: 100,
      min: 0,
      interval: 10,
      axisLine: {
        show: true,
        lineStyle: {
          color: "black",
        },
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: "balck",
          length: 20,
        },
      },
    });
  };
  if (length1 !== 0) {
    yAxis.push({
      type: "value",
      gridIndex: 1,
      axisLabel: {
        show: false,
      },
      axisLine: {
        show: false,
      },
      splitLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
    });
  };
  if (length2 !== 0) {
    yAxis.push({
      type: "value",
      gridIndex: 2,
      axisLabel: {
        show: false,
      },
      axisLine: {
        show: false,
      },
      splitLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
    });
  }
  return yAxis;
}

function ygridbottomprocess(length0, length1, length2) {
  let grid = [];
  if (length0 !== 0) {
    grid.push({
      top: 35,
      left: 40,
      right: 30,
      bottom: 35,
    });
  }
  if (length1 !== 0) {
    grid.push({
      left: 40,
      right: 30,
      height: 20,
      bottom: 15,
    });
  }
  if (length2 !== 0) {
    grid.push({
      left: 40,
      right: 30,
      height: 10,
      bottom: 5,
    });
  }
  return grid;
}

function xgridbottomprocess(length0, length1, length2) {
  let grid = [];
  if (length0 !== 0) {
    grid.push({
      left: 40,
      top: 0,
      right: 300,
      bottom: 20
    });
  }
  if (length1 !== 0) {
    grid.push({
      left: 15,
      width: 25,
      top: 0,
      bottom: 20
    });
  }
  if (length2 !== 0) {
    grid.push({
      left: 5,
      width: 10,
      top: 0,
      bottom: 20
    });
  }
  return grid;
}

function DuplicateRemoval(arr) {
  var resultObj = {};
  var result = [];
  var result2 = [];
  for (var i = 0; i < arr.length; i++) {
    if (result.indexOf(arr[i]) === -1) {
      result.push(arr[i]);
    } else {
      if (result2.indexOf(arr[i]) === -1) {
        result2.push(arr[i]);
      }
    }
  }
  var obj = {}
  arr.forEach((v) => {
    if (obj[v]) {
      obj[v]++;
    } else {
      obj[v] = 1;
    }
  });
  resultObj.result = result;
  resultObj.result2 = result2;
  resultObj.obj = obj;
  return resultObj
}

function seriesprocess(length0, length1, length2, Data, option, xdata, x2data, x3data, isY) {
  let series = [];
  if (length0 !== 0) {
    option.forEach(function (value, index) {
      series.push({
        name: value,
        data: Data[index],
        type: 'bar',
        barGap: 0,
        xAxisIndex: 0,
        yAxisIndex: 0,
      })
    })
  }
  if (length1 !== 0) {
    let resultObj = DuplicateRemoval(x2data).obj;
    for (var key in resultObj) {
      series.push({
        data: [{
          name: key,
          value: 1,
        }],
        label: {
          show: true,
          position: 'inside',
          formatter: '{b}',
          offset: isY ? [0, 7] : [0, -5],
          fontSize: 10,
          color: 'black',
          rotate: isY ? null : 90,
        },
        type: 'bar',
        barGap: 0,
        // eslint-disable-next-line no-loop-func
        barWidth: (function () {
          return `${(100 / (xdata.length)) * resultObj[key]}%`;
        })(),
        itemStyle: {
          color: "rgba(255, 255, 255, 1)",
          borderColor: 'gray',
          borderWidth: 0.1,
        },
        xAxisIndex: 1,
        yAxisIndex: 1,
      })
    }
  }
  if (length2 !== 0) {
    let resultObj = DuplicateRemoval(x3data).obj;
    for (key in resultObj) {
      series.push({
        data: [{
          name: key,
          value: 1,
        }],
        label: {
          show: true,
          position: 'inside',
          formatter: '{b}',
          offset: [0, 1],
          fontSize: 10,
          color: 'black',
          rotate: isY ? null : 90,
        },
        type: 'bar',
        barGap: 0,
        // eslint-disable-next-line no-loop-func
        barWidth: (function () {
          return `${(100 / (xdata.length)) * resultObj[key]}%`;
        })(),
        itemStyle: {
          color: "rgba(255, 255, 255, 1)",
          borderColor: 'gray',
          borderWidth: 0.1,
        },
        xAxisIndex: 2,
        yAxisIndex: 2,
      })
    }
  }
  return series;
}

function getDefaultData(chart, data) {
  let res = [];
  chart.scopes.forEach((scope, i) => {
    if (scope.type !== "标记" && data[i] !== undefined) {
      res.push(data[i]);
    }
  });
  return res;
}

function get100Times(data) {
  return data.map(row => {
    return row.map(item => 100 * item);
  })
}

function getOptionLength(chart) {
  let res = 0;
  chart.options.forEach((option, i) => {
    res += option.length;
  });
  return res;
}

function getMaxScopeLength(chart, fontSize) {
  let res = 0;
  chart.scopes.forEach((scope, i) => {
    if (res < scope.text.length) {
      res = scope.text.length;
    }
  });
  return res * fontSize + 50;
}

function toFixed(value) {
  return `${(Math.round(value * 10) / 10).toFixed(1)}`;
}

function toPercent(value) {
  return `${Math.floor(value)}`;
}

export function isChartTypeBarBasic(chart) {
  return chart.subType === "bar-basic-y" || chart.subType === "bar-basic-x";
}

export function isChartTypeBarFull(chart) {
  return chart.subType === "bar-full-y" || chart.subType === "bar-full-x";
}

export function isChartTypeBarY(chart) {
  return chart.subType === "bar-basic-y" || chart.subType === "bar-full-y";
}

export function isChartTypePieBasic(chart) {
  return chart.subType === "pie-basic-simple";
}

export function isChartTypeBarVertical(chart) {
  return chart.subType === "bar-vertical-y";
}

export function isChartTypeBarTypical(chart) {
  return chart.subType === "bar-typical-y";
}

export function isChartTypeRadar(chart) {
  return chart.subType === "radar";
}

export function isChartTypeBoxplot(chart) {
  return chart.subType === "boxplot-basic-y";
}

export function isChartTypeBoxplot2(chart) {
  return chart.subType === "boxplot2-basic-y";
}

export function isChartTypeCompositePie(chart) {
  return chart.subType === "compositepie";
}

export function isChartTypeBarMutiple(chart) {
  return chart.subType === "bar-mutiple-y" || chart.subType === "bar-mutiple-x";
}

export function getChartOption(chart, data, isPdf) {
  const fontSize = chart.fontSize;
  const scopes = chart.scopes.filter(scope => scope.type !== "标记");

  let yAxisNew = [];
  let yData = [];
  let legendData = [];
  let series = [];
  let isY = false;
  let ispie = false;
  let isradar = false;
  let indicatorData = [];
  let dataset = [];
  let datamin;
  let datamax;
  let markdata = [];
  let NewxAxis = [];
  let NewyAxis = [];
  let Newgrid = [];

  if (isChartTypeBarBasic(chart)) {
    const options = chart.scopes.map(scope => getScopeLabel(scope));
    isY = chart.subType === "bar-basic-y";
    yData = options;
    data = data.length !== 0 ? data.map(row => row[0]) : Setting.randomsBetween(2, 5, chart.scopes.length);
    data = getDefaultData(chart, data);
    series.push({
      name: '百分比',
      type: 'bar',
      barWidth: 50,
      label: {
        show: true,
        position: isY ? "top" : "right",
        // formatter: '{c}%',
        formatter: function (params) {
          // return `${params.value}`;
          if (params.value < 0) {
            return "你在本题上没有作答";
          } else if (params.value === 0) {
            return "贵校在该题上缺乏有效数据";
          }
          return toFixed(params.value);
        },
        color: "#000000",
      },
      data: data,
    });
  } else if (isChartTypePieBasic(chart)) {
    const options = chart.scopes.map((scope) => getScopeLabel(scope));
    ispie = chart.subType === "pie-basic-simple";
    legendData = options;
    data = data.length !== 0 ? data.map((row) => row[0]) : [
      [0.03],
      [0.2994],
      [0.32845],
      [0.2001],
      [0.083314],
      [0.060899]
    ].map((row) => row[0]);
    data = getDefaultData(chart, data);
    data = PieDataProcess(legendData, data);
    series.push({
      name: "百分比",
      type: "pie",
      radius: "90%",
      colorBy: 'data',
      label: {
        show: true,
        position: 'inside',
        avoidLabelOverlap: true,
        fontSize: 12,
        minShowLabelAngle: 5,
        formatter: function (params) {
          if (params.value < 0) {
            return "你在本题上没有作答";
          } else if (params.value === 0) {
            return "贵校在该题上缺乏有效数据";
          }
          return toFixed(params.value * 100) + "%";
        },
        color: "#000000",
      },
      data: data,
    });
  } else if (isChartTypeBarVertical(chart)) {
    const options = chart.options;
    const ranges = scopes.map(scope => scope.range);
    const uniqueRanges = ranges.filter((range, i) => {
      return ranges.indexOf(range) === i;
    });
    isY = chart.subType === "bar-vertical-y";
    yData = uniqueRanges;
    data = data.length !== 0 ? data : [
      [30.5, 45.7],
      [69.5, 54.3]
    ];
    data = getDefaultData(chart, data);
    legendData = options;
    const transposedData = Setting.transpose2dArray(data);
    options.forEach((option, i) => {
      series.push({
        name: option,
        type: 'bar',
        barGap: 0,
        label: {
          show: true,
          position: isY ? "top" : "right",
          formatter: function (params) {
            if (params.value < 0) {
              return "你在本题上没有作答";
            } else if (params.value === 0) {
              return "贵校在该题上缺乏有效数据";
            }
            return toFixed(params.value);
          },
          color: "#000000",
        },
        data: transposedData[i],
      });
    });
  } else if (isChartTypeBarTypical(chart)) {
    const options = chart.options;
    const ranges = scopes.map(scope => scope.range);
    const uniqueRanges = ranges.filter((range, i) => {
      return ranges.indexOf(range) === i;
    });
    isY = chart.subType === "bar-typical-y";
    yData = uniqueRanges;
    data = data.length !== 0 ? data : [
      [0.07560, 0.09690],
      [0.05380, 0.06140],
      [0.17320, 0.16030],
      [0.21420, 0.24030],
      [0.24180, 0.23310],
      [0.19350, 0.16990],
      [0.04790, 0.03440]
    ];
    data = getDefaultData(chart, data);
    data = get100Times(data)
    legendData = options;
    const transposedData = Setting.transpose2dArray(data);
    options.forEach((option, i) => {
      series.push({
        name: option,
        type: 'bar',
        barGap: 0,
        label: {
          show: true,
          position: isY ? "top" : "right",
          formatter: function (params) {
            if (params.value < 0) {
              return "你在本题上没有作答";
            } else if (params.value === 0) {
              return "贵校在该题上缺乏有效数据";
            }
            return toFixed(params.value);
          },
          color: "#000000",
        },
        data: transposedData[i],
      });
    });
  } else if (isChartTypeRadar(chart)) {
    const options = chart.options;
    const ranges = scopes.map(scope => scope.range);
    const uniqueRanges = ranges.filter((range, i) => {
      return ranges.indexOf(range) === i;
    });
    isradar = chart.subType === "radar";
    legendData = options
    data = data.length !== 0 ? data.map((row) => row[0]) : [
      [30, 33, 55],
      [35, 38, 65],
      [45, 49, 50],
      [55, 51, 66],
      [60, 67, 69],
      [65, 78, 78],
      [70, 90, 94],
      [75, 75, 85]
    ];
    data = getDefaultData(chart, data);
    indicatorData = getindicatorData(uniqueRanges);
    const transposedData = Setting.transpose2dArray(data);
    console.log(transposedData)
    options.forEach((option, i) => {
      series.push({
        type: "radar",
        data: [{
          name: option,
          value: transposedData[i]
        }]
      })
    });
  } else if (isChartTypeBoxplot(chart)) {
    const options = chart.scopes.map((scope) => getScopeLabel(scope));
    isY = chart.subType === "boxplot-basic-y";
    yData = options;
    data =
      data.length !== 0 ?
        data.map((row) => row[0]) : [
          [446.4429432,
            512.8455151,
            381.1205591,
            346.2006511,
            645.2008944
          ],
          [422.1927263,
            525.5307233,
            492.2898466,
            356.5856599,
            658.8386935
          ],
          [422.1927263,
            520.6919662,
            339.5552561,
            309.3014429,
            663.3666584,
          ]
        ];
    data = getDefaultData(chart, data);
    data = dataTool.prepareBoxplotData(data);
    console.log(data);
    data.boxData.forEach((value, i) => {
      let sum = value[value.length - 1] - value[0];
      let percent = ((value[2] - value[0]) / sum).toFixed(2);
      dataset.push({
        value: value,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 1 - percent,
              color: 'red' // 0% 处的颜色
            }, {
              offset: 1 - percent,
              color: 'blue' // 100% 处的颜色
            }]
          }
        },
      });
    })
    series.push({
      type: "boxplot",
      data: dataset,
    })
  } else if (isChartTypeBoxplot2(chart)) {
    const options = chart.options;
    const ranges = scopes.map(scope => scope.range);
    const uniqueRanges = ranges.filter((range, i) => {
      return ranges.indexOf(range) === i;
    });
    isY = chart.subType === "boxplot2-basic-y";
    yData = uniqueRanges;
    data = data.length !== 0 ? data : [
      [72.22],
      [42.86, 76.93, 80.74, 86.18, 100.00],
      [46.68, 50.91, 56.89, 62.35, 69.98]
    ];
    data = getDefaultData(chart, data);
    let yAxisData = data.flat();
    datamax = toMax(yAxisData);
    datamin = toMin(yAxisData);
    data.forEach((value, index) => {
      if (value.length === 1) {
        markdata.push({
          value: yData[index],
          coord: [yData[index], value[0]],
          symbol: 'circle',
          symbolSize: 10,
          itemStyle: {
            color: 'red',
          },
          label: {
            show: true,
            position: 'right',
            fontSize: 10,
            fontWeight: 'bold',
            fontFamily: '楷体',
          }
        });
      } else {
        value.forEach((i, j) => {
          markdata.push({
            value: options[j],
            coord: [yData[index], i],
            symbol: 'rect',
            symbolSize: [20, 5],
            itemStyle: {
              color: 'gray',
              borderColor: 'black',
              borderWidth: 1,
            },
            label: {
              show: true,
              position: 'right',
              fontSize: 10,
              fontWeight: 'bold',
              fontFamily: '楷体',
            }
          })
        })
      }
    });
    series.push({
      data: (new Array(yData.length)).fill(100), //变数据
      type: 'bar',
      barWidth: 30,
      itemStyle: {
        color: "gray",
        opacity: 0.5,
      },
      markPoint: {
        data: markdata,
      }
    });
  } else if (isChartTypeCompositePie(chart)) {
    const options = chart.scopes.map((scope) => getScopeLabel(scope));
    isY = chart.subType === "compositepie";
    legendData = options;
    data = data.length !== 0 ? data.map((row) => row[0]) : [
      [7.672883918],
      [11.98304674],
      [0.240770104],
      [7.291883219],
      [4.275029987],
      [3.846806493],
      [9.708357257],
      [35.76251798],
      [18.51224522],
      [0.706459077]
    ].map((row) => row[0]);
    let endData = Processcompositepie(data, legendData)
    let sum = PieDataSum(data);
    let other = otherPercent(data, sum);
    let percent = other[0];
    let otherdata = other[1];
    let Piedata = CompositePieDataProcess(legendData, data, otherdata, chart);
    let height = chart.height;
    let width = chart.width;
    let markLineData = getMarkLineData(percent, height, width, otherdata);
    series.push({
      type: "pie",
      radius: "90%",
      center: ["20%", "50%"],
      minShowLabelAngle: 5,
      label: {
        show: true,
        position: 'inside',
        formatter: function (params) {
          console.log(params);
          if (params.value < 0) {
            return "你在本题上没有作答";
          } else if (params.value === 0) {
            return "贵校在该题上缺乏有效数据";
          }
          return ((params.value / sum) * 100).toFixed(1);
        },
        fontSize: 12,
      },
      startAngle: 45, // 起始角度 45
      clockwise: false, // 逆时针
      data: Piedata,
    })
    console.log(endData);
    endData.forEach((value, index) => {
      let name = value[0];
      let data = value[1];
      series.push({
        name: name,
        type: "bar",
        stack: "其它",
        barWidth: 60,
        center: ["0%", "50%"],
        label: {
          show: true,
          position: 'right',
          formatter: function (params) {
            console.log(params);
            if (params.value < 0) {
              return "你在本题上没有作答";
            } else if (params.value === 0) {
              return "贵校在该题上缺乏有效数据";
            }
            return ((params.value / sum) * 100).toFixed(1);
          },
          fontSize: 12,
        },
        data: [data],
        itemStyle: {
          color: chart.stackColors[index]
        },
        markLine: {
          lineStyle: {
            type: "solid",
            width: 1,
            color: "black",
          },
          symbol: "none",
          data: markLineData,
        },
      })
    })
  } else if (isChartTypeBarMutiple(chart)) {
    const options = chart.options;
    legendData = options;
    isY = chart.subType === "bar-mutiple-y";
    const dummyData = isY ? [
      [42.85714286, 42.85714286, 14.28571429, 42.85714286, 42.85714286, 14.28571429, 42.85714286, 42.85714286, 14.28571429,],
      [66.66666667, 33.33333333, 14.28571429, 42.85714286, 55.32762, 14.28571429, 14.28571429, 42.85714286, 14.28571429,],
      [31.26223, 53.33333333, 14.28571429, 42.85714286, 35.32762, 14.28571429, 81.28571429, 42.85714286, 14.28571429,],
      [31.26223, 53.33333333, 14.28571429, 42.85714286, 35.32762, 14.28571429, 81.28571429, 42.85714286, 14.28571429,]
    ] : [
      [42.85714286, 42.85714286, 14.28571429, 42.85714286, 42.85714286, 14.28571429, 42.85714286, 42.85714286,],
      [66.66666667, 33.33333333, 14.28571429, 42.85714286, 55.32762, 14.28571429, 14.28571429, 42.85714286,],
      [31.26223, 53.33333333, 14.28571429, 42.85714286, 35.32762, 14.28571429, 81.28571429, 42.85714286,]
    ]
    data = data.length !== 0 ? data : dummyData;

    data = getDefaultData(chart, data);
    let x3data = chart.scopes.map((scope) => getScopeLabel(scope));
    let x2data = chart.scopes.map((scope) => getScopeArea(scope));
    let xdata = chart.scopes.map((scope) => getScopeText(scope));
    let length0 = xdata.length;
    let length1 = x2data.length;
    let length2 = x3data.length;
    const transposedData = Setting.transpose2dArray(data);
    // eslint-disable-next-line no-unused-vars
    NewxAxis = xAxisprocess(length0, length1, length2, xdata, isY);
    // eslint-disable-next-line no-unused-vars
    NewyAxis = yAxisprocess(length0, length1, length2);
    // eslint-disable-next-line no-unused-vars
    Newgrid = isY ? ygridbottomprocess(length0, length1, length2) : xgridbottomprocess(length0, length1, length2);
    series = seriesprocess(length0, length1, length2, transposedData, options, xdata, x2data, x3data, isY);
  } else if (isChartTypeBarFull(chart)) {
    const options = chart.options;
    isY = chart.subType === "bar-full-y";
    const dummyData = isY ? [
      [0.38, 0.62],
      [0.32, 0.68]
    ] : [
      [0, 0, 0, 1, 0],
      [0, 0, 0, 1, 0],
      [1, 0, 0],
      [0, 0.04979, 0.06649, 0.28361, 0.60011],
      [0.01754, 0.03319, 0.10494, 0.19853, 0.6458],
      [0.70095, 0.21471, 0.08435],
      [0.03627, 0.05651, 0.13136, 0.21623, 0.55964],
      [0.03974, 0.06579, 0.15573, 0.20702, 0.53173],
      [0.56695, 0.28612, 0.14693],
      [0, 0.04979, 0.06649, 0.28361, 0.60011],
      [0.01754, 0.03319, 0.10494, 0.19853, 0.6458],
      [0.70095, 0.21471, 0.08435],
      [0.03627, 0.05651, 0.13136, 0.21623, 0.55964],
      [0.03974, 0.06579, 0.15573, 0.20702, 0.53173],
      [0.56695, 0.28612, 0.14693],
      [0, 0.04979, 0.06649, 0.28361, 0.60011],
      [0.01754, 0.03319, 0.10494, 0.19853, 0.6458],
      [0.70095, 0.21471, 0.08435],
      [0.03627, 0.05651, 0.13136, 0.21623, 0.55964],
      [0.03974, 0.06579, 0.15573, 0.20702, 0.53173],
      [0.56695, 0.28612, 0.14693]
    ];
    data = data.length !== 0 ? data : dummyData;
    const markPoints = isY ? getMarkPointsForBarFullY(chart, data) : getMarkPointsForBarFullX(chart, data);
    data = getDefaultData(chart, data);
    data = get100Times(data);

    if (chart.subType === "bar-full-x" && scopes.length !== 0) {
      const ranges = scopes.map(scope => scope.range);
      const uniqueRanges = ranges.filter((range, i) => {
        return ranges.indexOf(range) === i;
      });
      const offset = getMaxScopeLength(chart, fontSize);
      yAxisNew.push({
        position: 'left',
        offset: offset,
        axisLine: {
          show: false,
        },
        axisTick: {
          length: offset,
          inside: true,
          lineStyle: {
            color: "rgb(217,217,217)",
          }
        },
        axisLabel: {
          inside: true,
          fontSize: fontSize,
          formatter: function (value) {
            return value.split("").join("\n")
          },
        },
        inverse: true,
        data: uniqueRanges,
      });
    }
    yData = scopes.map(scope => {
      if (chart.subType === "bar-full-x") {
        return scope.text !== "" ? scope.text : scope.range
      } else {
        return scope.range;
      }
    });
    if (chart.subType === "bar-full-x") {
      legendData = options;
    }
    const transposedData = Setting.transpose2dArray(data);
    options.forEach((option, i) => {
      series.push({
        name: option,
        stack: "all",
        type: 'bar',
        barWidth: chart.subType === "bar-full-x" ? 20 : 100,
        barGap: '80%',
        /*多个并排柱子设置柱子之间的间距*/
        barCategoryGap: '50%',
        /*多个并排柱子设置柱子之间的间距*/
        label: {
          show: isPdf,
          position: 'inside',
          // formatter: '{c}%',
          formatter: function (params) {
            if (params.value < 5) {
              return "";
            }
            return toPercent(params.value) + "%";
          },
        },
        data: transposedData[i],
        markPoint: {
          symbolSize: 35,
          data: markPoints,
          // data: [
          //   {name: '年最低', value: "我", xAxis: 20, yAxis: 4}
          // ]
          itemStyle: {
            color: chart.colorPin,
          },
        },
      });
    });

    if (chart.subType === "bar-full-y") {
      series[0].label = {
        show: true,
        // formatter: '{c}%',
        formatter: function (params) {
          if (params.value < -1) {
            return "你在本题上没有作答";
          } else if (params.value < 0) {
            return "贵校在该题上缺乏有效数据";
          }
          return toPercent(params.value) + "%";
        },
      };
      series[0].color = chart.colorP0;
      series[1].color = chart.colorP1;
    }
  }

  const option = {
    color: chart.barColors,
    grid: isChartTypeCompositePie(chart) ? {} : isChartTypeBarMutiple(chart) ? Newgrid : {
      // top: "30%",
      right: isChartTypeBarFull(chart) ? "5%" : isChartTypeBarVertical(chart) ? "10%" : isChartTypeBarTypical(chart) ? "10%" : isChartTypeBoxplot2(chart) ? "10%" : "5%",
      containLabel: true,
      top: chart.title !== "" ? 30 : 25,
      bottom: (chart.subType === "bar-full-x" && getOptionLength(chart) > 40) ? 60 : isChartTypeBoxplot2(chart) ? 20 : 40,
    },
    title: isChartTypePieBasic(chart) ? {} : isChartTypeCompositePie(chart) ? {} : isChartTypeBarMutiple(chart) ? {} : isChartTypeRadar(chart) ? {} : isChartTypeBarBasic(chart) ? {} : isChartTypeBarVertical(chart) ? {} : isChartTypeBarVertical(chart) ? {} : isChartTypeBarTypical(chart) ? {} : isChartTypeBoxplot(chart) ? {} : {
      text: chart.title,
      // text: getOptionLength(chart),
      x: "center",
    },
    tooltip: isChartTypeCompositePie(chart) ? {} : {
      // formatter: "{c}%",
      show: true,
      trigger: isChartTypeRadar(chart) ? 'item' : null,
      formatter: function (params) {
        if (isChartTypeBarBasic(chart)) {
          return toFixed(params.value);
        } else if (isChartTypePieBasic(chart)) {
          return toFixed(params.value * 100) + "%";
        } else if (isChartTypeBarVertical(chart)) {
          return toFixed(params.value) + "%";
        } else if (isChartTypeBarTypical(chart)) {
          return toFixed(params.value) + "%";
        } else if (isChartTypeRadar(chart)) {
          return toFixed(params.value);
        } else if (isChartTypeBoxplot2(chart)) {
          return toFixed(params.value);
        } else if (isChartTypeCompositePie(chart)) {
          return toFixed(params.value);
        } else if (isChartTypeBarMutiple(chart)) {
          return toFixed(params.value) + "%";
        } else if (isChartTypeBoxplot(chart)) {
          return toFixed(params.value);
        } else {
          if (chart.subType === "bar-full-y") {
            return toPercent(params.value) + "%";
          } else {
            return toFixed(params.value) + "%";
          }
        }
      },
      // formatter: function(params) {
      //   var result = '';
      //   params.forEach(function (item) {
      //     result += item.marker + " " + item.seriesName + " : " + item.value +"</br>";
      //   });
      //   return result;
      // }
    },
    // legend: {
    //   data: legendData,
    //   // top: "10%",
    //   orient: "vertical",
    //   x: "right",
    //   y: "center",
    // },
    legend: {
      show: true,
      data: legendData,
      // top: "10%",
      orient: isChartTypeBarBasic(chart) ? "horizontal" : isChartTypePieBasic(chart) ? "vertical" : isChartTypeBarVertical(chart) ? "vertical" : isChartTypeBarTypical(chart) ? "vertical" : isChartTypeRadar(chart) ? "vertical" : isChartTypeCompositePie(chart) ? "vertical" : isChartTypeBarMutiple(chart) ? (isY ? "horizontal" : "vertical") : "horizontal",
      x: isChartTypeBarBasic(chart) ? "center" : isChartTypePieBasic(chart) ? "right" : isChartTypeBarVertical(chart) ? "right" : isChartTypeBarTypical(chart) ? "right" : isChartTypeRadar(chart) ? "right" : isChartTypeCompositePie(chart) ? "right" : isChartTypeBarMutiple(chart) ? (isY ? "center" : "right") : "center",
      y: isChartTypeBarBasic(chart) ? "bottom" : isChartTypePieBasic(chart) ? "center" : isChartTypeBarVertical(chart) ? "center" : isChartTypeBarTypical(chart) ? "center" : isChartTypeRadar(chart) ? "center" : isChartTypeCompositePie(chart) ? "center" : isChartTypeBarMutiple(chart) ? (isY ? "top" : "center") : "bottom",
      itemGap: isChartTypeBarMutiple(chart) ? 0 : 0,
      itemWidth: isChartTypeBarMutiple(chart) ? 10 : 10,
      itemHeight: isChartTypeBarMutiple(chart) ? 10 : 10,
      textStyle: isChartTypeBarMutiple(chart) ? {
        fontSize: 10,
      } : null,
      align: isChartTypeBarMutiple(chart) ? 'left' : 'left',
    },
    radar: !isChartTypeRadar(chart) ? null : {
      name: {
        show: true,
        fontSize: 13,
      },
      nameGap: 0,
      radius: '88%',
      indicator: indicatorData,
    },
    xAxis: isChartTypeBarMutiple(chart) ? NewyAxis : {
      show: isChartTypeCompositePie(chart) ? false : true,
      name: isChartTypeBarBasic(chart) ? chart.scopes[0].text.split("").join("\n\n") : isChartTypeBarVertical(chart) ? chart.scopes[0].text.split("").join("\n\n") : isChartTypeBarTypical(chart) ? chart.scopes[0].text.split("").join("\n\n") : isChartTypeBoxplot(chart) ? chart.scopes[0].text.split("").join("\n\n") : isChartTypeBoxplot2(chart) ? chart.scopes[0].text.split("").join("\n\n") : null,
      nameLocation: "middle",
      nameRotate: 0,
      nameGap: 50,
      nameTextStyle: {
        fontSize: isChartTypeBarTypical(chart) ? 13 : null,
        fontWeight: 'bold',
      },
      axisLine: {
        show: true,
      },
      axisLabel: {
        fontSize: fontSize,
        formatter: isChartTypeBarBasic(chart) ? '{value}' : isChartTypeBarVertical(chart) ? '{value}' : isChartTypeBarTypical(chart) ? '{value}' : isChartTypeBoxplot(chart) ? '{value}' : isChartTypeBoxplot2(chart) ? '{value}' : '{value}%',
      },
      axisTick: {
        show: true,
      },
      splitLine: {
        show: chart.subType === "bar-full-y" ? false : isChartTypeBarVertical(chart) ? true : true,
        // interval: function(param) {
        //   return param % 2 === 0;
        // }
      },
      min: isChartTypeBarBasic(chart) ? 0 : isChartTypeBarVertical(chart) ? 0 : isChartTypeBarTypical(chart) ? 0 : isChartTypeBoxplot(chart) ? null : isChartTypeBoxplot2(chart) ? datamin : isChartTypeCompositePie(chart) ? null : 0,
      max: isChartTypeBarBasic(chart) ? 5 : isChartTypeBarVertical(chart) ? 100 : isChartTypeBarTypical(chart) ? 100 : isChartTypeBoxplot(chart) ? null : isChartTypeBoxplot2(chart) ? datamax : isChartTypeCompositePie(chart) ? null : 100,
      interval: isChartTypeBarBasic(chart) ? 1 : isChartTypeBarVertical(chart) ? 20 : isChartTypeBarTypical(chart) ? 10 : isChartTypeBoxplot(chart) ? 50 : isChartTypeBoxplot2(chart) ? null : isChartTypeCompositePie(chart) ? null : 10,
      splitNumber: isChartTypeBoxplot2(chart) ? 13 : null,
    },
    yAxis: isChartTypeBarMutiple(chart) ? NewxAxis : [{
      show: isChartTypeCompositePie(chart) ? false : true,
      data: isChartTypeCompositePie(chart) ? ['其它'] : yData,
      name: isChartTypeBarTypical(chart) ? chart.datatype : null,
      nameLocation: "middle",
      nameRotate: 0,
      nameGap: 30,
      nameTextStyle: {
        fontSize: isChartTypeBarTypical(chart) ? 13 : null,
      },
      inverse: isChartTypeBarY(chart) ? (chart.order === "down-right") : isChartTypeBarVertical(chart) ? (chart.order === "down-right") : isChartTypeBarTypical(chart) ? (chart.order === "down-right") : isChartTypeBoxplot(chart) ? (chart.order === "down-right") : isChartTypeBoxplot2(chart) ? (chart.order === "down-right") : isChartTypeCompositePie(chart) ? (chart.order === "down-right") : ((chart.order !== "down-right")),
      axisLabel: isChartTypeCompositePie(chart) ? null : {
        show: true,
        fontSize: fontSize,
        textStyle: {
          color: "black",
          // fontSize: 14,
        }
      },
      axisLine: isChartTypeCompositePie(chart) ? null : {
        show: true,
        lineStyle: {
          color: "rgb(217,217,217)",
        }
      },
      axisTick: {
        show: true,
      }
    }].concat(yAxisNew),
    // animation: !isPdf,
    animationDuration: function (idx) {
      // https://github.com/hustcc/echarts-for-react/issues/252#issuecomment-510706917
      // delay for later data is larger
      return idx * 100 + 100;
    },
    textStyle: {
      color: "black",
      fontSize: fontSize,
    },
    series: series,
  };

  if (isY) {
    [option.xAxis, option.yAxis] = [option.yAxis, option.xAxis];
  } else if (ispie || isradar) {
    delete option.xAxis;
    delete option.yAxis;
  }
  return option;
}

export function getChartText(chart, data) {
  if (data.length === 0) {
    return null;
  }

  if (chart.options.length !== 0) {
    const index = data[0].indexOf(1);
    if (index === -1) {
      return "（缺乏数据）";
    }
    return chart.options[index];
  } else {
    if (chart.scopes.length > 0 && chart.scopes[0].type === "分位数") {
      if (data[0][0] < 0) {
        return "（缺乏数据）";
      }
      return `${toPercent(data[0][0] * 100)}%`;
    } else {
      if (data[0] < 0) {
        return "（缺乏数据）";
      }
      return toFixed(data[0]);
    }
  }
}

class Chart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props, //数据源
    };
    // console.log(props);
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(value) {
    switch (parseInt(value)) {
      case 0: {
        const chart = this.props.chart;
        chart.type = 'pie';
        chart.subType = 'pie-basic-simple';
        chart.scopes = [{
          "id": 0,
          "type": "默认",
          "range": "几乎没有",
          "text": "自主学习力",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "1小时以内",
          "text": "自主学习力",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "1-2小时",
          "text": "自主学习力",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "2-3小时",
          "text": "自主学习力",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "3-4小时",
          "text": "自主学习力",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "4小时级以上",
          "text": "自主学习力",
          "askId": 395
        }
        ];
        this.setState({
          chart,
        });
      };
        break;
      case 1: {
        const chart = this.props.chart;
        chart.type = 'bar';
        chart.subType = 'bar-vertical-y';
        chart.scopes = [{
          "id": 0,
          "type": "默认",
          "range": "父母参与子女学习少",
          "text": "百分比(%)",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "父母参与子女学习少",
          "text": "百分比(%)",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "父母参与子女学习多",
          "text": "百分比(%)",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "父母参与子女学习多",
          "text": "百分比(%)",
          "askId": 395
        }
        ];
        chart.options = ["四年级", "八年级"]
        this.setState({
          chart,
        });
      };
        break;
      case 2: {
        const chart = this.props.chart;
        chart.type = 'bar';
        chart.subType = 'bar-typical-y';
        chart.scopes = [{
          "id": 0,
          "type": "默认",
          "range": "0",
          "text": "所占人数百分比(%)",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "0",
          "text": "所占人数百分比(%)",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "1",
          "text": "所占人数百分比(%)",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "1",
          "text": "所占人数百分比(%)",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "2",
          "text": "所占人数百分比(%)",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "2",
          "text": "所占人数百分比(%)",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "3",
          "text": "所占人数百分比(%)",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "3",
          "text": "所占人数百分比(%)",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "4",
          "text": "所占人数百分比(%)",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "4",
          "text": "所占人数百分比(%)",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "5",
          "text": "所占人数百分比(%)",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "5",
          "text": "所占人数百分比(%)",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "6",
          "text": "所占人数百分比(%)",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "6",
          "text": "所占人数百分比(%)",
          "askId": 395
        },
        ];
        chart.options = ["本校", "株洲市"];
        chart.datatype = "分值";
        this.setState({
          chart,
        });
      };
        break;
      case 3: {
        const chart = this.props.chart;
        chart.type = 'radar';
        chart.subType = 'radar';
        chart.scopes = [{
          "id": 0,
          "type": "默认",
          "range": "生活素养",
          "text": "",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "生活素养",
          "text": "",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "生活素养",
          "text": "",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "信息素养",
          "text": "",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "信息素养",
          "text": "",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "信息素养",
          "text": "",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "审美素养",
          "text": "",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "审美素养",
          "text": "",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "审美素养",
          "text": "",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "国际素养",
          "text": "",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "国际素养",
          "text": "",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "国际素养",
          "text": "",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "创新素养",
          "text": "",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "创新素养",
          "text": "",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "创新素养",
          "text": "",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "学习素养",
          "text": "",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "学习素养",
          "text": "",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "学习素养",
          "text": "",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "身心素养",
          "text": "",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "身心素养",
          "text": "",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "身心素养",
          "text": "",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "品德素养",
          "text": "",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "品德素养",
          "text": "",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "品德素养",
          "text": "",
          "askId": 395
        },
        ];
        chart.options = ["四年级", "八年级", "十一年级"];
        this.setState({
          chart,
        });
      };
        break;
      case 4: {
        const chart = this.props.chart;
        chart.type = 'boxplot';
        chart.subType = 'boxplot-basic-y';
        chart.scopes = [{
          "id": 0,
          "type": "默认",
          "range": "识记",
          "text": "分数",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "理解",
          "text": "分数",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "运用",
          "text": "分数",
          "askId": 395
        }
        ];
        this.setState({
          chart,
        });
      };
        break;
      case 5: {
        const chart = this.props.chart;
        chart.type = 'boxplot2';
        chart.subType = 'boxplot2-basic-y';
        chart.scopes = [{
          "id": 0,
          "type": "默认",
          "range": "本校",
          "text": "亲子关系指数",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "本区",
          "text": "亲子关系指数",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "本区",
          "text": "亲子关系指数",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "本区",
          "text": "亲子关系指数",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "本区",
          "text": "亲子关系指数",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "本区",
          "text": "亲子关系指数",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "本市",
          "text": "亲子关系指数",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "本市",
          "text": "亲子关系指数",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "本市",
          "text": "亲子关系指数",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "本市",
          "text": "亲子关系指数",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "本市",
          "text": "亲子关系指数",
          "askId": 395
        }
        ];
        chart.options = [
          '95%的学校高于此点',
          '75%的学校高于此点',
          '50%的学校高于此点',
          '25%的学校高于此点',
          '5%的学校高于此点'
        ];
        chart.title = "本校在亲子关系指数上的表现";
        this.setState({
          chart,
        });
      };
        break;
      case 6: {
        const chart = this.props.chart;
        chart.type = 'pie';
        chart.subType = 'compositepie';
        chart.scopes = [{
          "id": 0,
          "type": "默认",
          "range": "不知道",
          "text": "",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "无工作",
          "text": "",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "政府机构的高级行政人员",
          "text": "",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "企业管理人员",
          "text": "",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "教育、医务、科研人员、专业技术人员",
          "text": "",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "政府普通工作人员",
          "text": "",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "商业服务业人员",
          "text": "",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "私营或个体经营者",
          "text": "",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "工人",
          "text": "",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "农民，一直在农村种地或做其他事情",
          "text": "",
          "askId": 395
        },
        ];
        chart.stackColors = [
          "rgb(0,191,255)",
          "black",
          "pink",
          "green"
        ];
        chart.pieColors = [
          "rgb(68,114,196)",
          "rgb(237,125,49)",
          "rgb(165,165,165)",
          "rgb(255,192,0)",
          "rgb(91,155,213)",
          "rgb(243,98,98)",
          "rgb(99,217,90)",
          "rgb(80,109,132)",
          "rgb(231,158,10)",
          "rgb(158,102,194)",
          "rgb(229,30,179)"
        ];
        this.setState({
          chart,
        });
      };
        break;
      case 7: {
        const chart = this.props.chart;
        chart.type = 'bar';
        chart.subType = 'bar-mutiple-y';
        chart.scopes = [{
          "id": 0,
          "type": "默认",
          "range": "四年级",
          "area": "濮阳县",
          "text": " ",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "四年级",
          "area": "学校地域",
          "text": "县镇",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "四年级",
          "area": "学校地域",
          "text": "农村",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "四年级",
          "area": "郊区地域",
          "text": "市区",
          "askId": 395
        }
        ];
        chart.options = ['其他',
          '通过互联网自己学习',
          '自己阅读期刊、杂志、书本学习',
          '参加远程继续教育学习（非学历教育）',
          '参加全国性的教师竞赛（如基本功大赛、名师赛等）',
          '参加省级或国家级的进修培训',
          '参加市教育部门组织的进修培训',
          '参加乡镇或县级教育部门组织的进修培训',
          '参加学校或学区组织的教研活动'
        ]
        this.setState({
          chart,
        });
      };
        break;
      // eslint-disable-next-line no-fallthrough
      case 8: {
        const chart = this.props.chart;
        chart.type = 'bar';
        chart.subType = 'bar-mutiple-x';
        chart.scopes = [{
          "id": 0,
          "type": "默认",
          "range": "四年级",
          "area": "濮阳县",
          "text": " ",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "四年级",
          "area": "学校地域",
          "text": "县镇",
          "askId": 395
        },
        {
          "id": 0,
          "type": "默认",
          "range": "四年级",
          "area": "学校地域",
          "text": "农村",
          "askId": 395
        },
        ];
        chart.options = ['给了我展示体育才能的舞台，满足了我对体育的兴趣',
          '学习到更多的体育知识',
          '我得到了更多了解我的同学朋友，与他们共同玩耍交流的机会',
          '我可以接触到更多的体育器材',
          '可以学会更多的体育活动',
          '对我上好的中学有用',
          '可以让我心情更愉快',
          '对我没什么用',
        ]
        this.setState({
          chart,
        });
      }
        break;
      // eslint-disable-next-line no-fallthrough
      default:
        alert("请选择正确的图例");
    }
  }

  renderData() {
    if (this.props.data.length === 0) {
      return null;
    }

    return (<
      div style={
        {
          marginBottom: "20px"
        }
      } >
      服务器回传数据： {
        JSON.stringify(this.props.data)
      } <
      /div>
      )
  }

      onEvents = {
        'select': this.handleChange
  }
      renderChart(chart, data) {
    if (chart.scopes.length === 0) {
      return Setting.wrapError("请至少添加一个范围");
    }

      if (chart.type === "text") {
      return ( <
        div > {
          this.renderData()
        } {
          getChartText(chart, data)
        } <
        /div>
        )
    }
        console.log(chart);

        const option = getChartOption(chart, data, false);
        return ( <
      div > {
            <
        Select defaultValue="default"
              style={
                {
                  width: 120
                }
              }
              onChange={
                this.handleChange
              } >
              <
        Option value='default' > 请选择图例 < /Option> <
        Option value="0" > 饼状图 < /Option> <
        Option value="1" > 纵向直方图 < /Option> <
        Option value="2" > 典型直方图 < /Option> <
        Option value="3" > 雷达图 < /Option> <
        Option value="4" > 盒型图1 < /Option> <
        Option value="5" > 盒型图2 < /Option> <
        Option value="6" > 复合饼状图 < /Option> <
        Option value="7" > 纵向多种条形图 < /Option> <
        Option value="8" > 横向多种条形图 < /Option> < /
        Select >
      } {
                                    this.renderData()
                                  } <
                                    ReactEcharts style={
                                      {
                                        width: chart.width,
                                        height: chart.height,
                                        border: '2px solid rgb(217,217,217)'
                                      }
                                    }
                                    option={
                                      option
                                    }
                                    notMerge={
                                      true
                                    }
                                    onEvents={
                                      this.onEvents
                                    }
                                  /> < /
      div >
                                  )
  }

                                  render() {
    return this.renderChart(this.props.chart, this.props.data)
  }
}

                                  export default Chart;