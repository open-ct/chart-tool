import React from "react";
import ReactEcharts from 'echarts-for-react';
import * as Setting from "./Setting";
import { Select } from 'antd';
const { Option } = Select;
function getScopeId(scope) {
  return scope.text;
}

function getScopeId2(scope) {
  return `${scope.text} - ${scope.type}`;
}

function PieDataProcess(legendData, data) {
  let res = [];
  for (var i = 0; i < legendData.length; i++) {
    var item = { value: data[i], name: legendData[i] };
    res.push(item);
  }
  return res
}

function getindicatorData(indicatorname) {
  let res = [];
  indicatorname.forEach(value => {
    res.push({ name: value, max: 100 });
  });
  res[0].axisLabel = { show: true };
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

  if (isChartTypeBarBasic(chart)) {
    const options = chart.scopes.map(scope => getScopeLabel(scope));
    isY = chart.subType === "bar-basic-y";
    yData = options;
    data = data.length !== 0 ? data.map(row => row[0]) : Setting.randomsBetween(2, 5, chart.scopes.length);
    data = getDefaultData(chart, data);
    series.push(
      {
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
      }
    );
  } else if (isChartTypePieBasic(chart)) {
    const options = chart.scopes.map((scope) => getScopeLabel(scope));
    ispie = chart.subType === "pie-basic-simple";
    legendData = options;
    data = data.length !== 0 ? data.map((row) => row[0]) : [[0.03], [0.2994], [0.32845], [0.2001], [0.083314], [0.060899]].map((row) => row[0]);
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
    data = data.length !== 0 ? data : [[30.5, 45.7], [69.5, 54.3]];
    data = getDefaultData(chart, data);
    legendData = options;
    const transposedData = Setting.transpose2dArray(data);
    options.forEach((option, i) => {
      series.push(
        {
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
        }
      );
    });
  } else if (isChartTypeBarTypical(chart)) {
    const options = chart.options;
    const ranges = scopes.map(scope => scope.range);
    const uniqueRanges = ranges.filter((range, i) => {
      return ranges.indexOf(range) === i;
    });
    isY = chart.subType === "bar-typical-y";
    yData = uniqueRanges;
    data = data.length !== 0 ? data : [[0.07560, 0.09690],
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
      series.push(
        {
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
        }
      );
    });
  } else if (isChartTypeRadar(chart)) {
    const options = chart.options;
    const ranges = scopes.map(scope => scope.range);
    const uniqueRanges = ranges.filter((range, i) => {
      return ranges.indexOf(range) === i;
    });
    console.log(uniqueRanges);
    isradar = chart.subType === "radar";
    console.log(options)
    legendData = options
    data = data.length !== 0 ? data.map((row) => row[0]) : [[30, 33, 55],
    [35, 38, 65],
    [45, 49, 50],
    [55, 51, 66],
    [60, 67, 69],
    [65, 78, 78],
    [70, 90, 94],
    [75, 75, 85]
    ];
    data = getDefaultData(chart, data);
    console.log(data);
    indicatorData = getindicatorData(uniqueRanges);
    const transposedData = Setting.transpose2dArray(data);
    console.log(transposedData)
    options.forEach((option, i) => {
      series.push(
        {
          type: "radar",
          data: [{
            name: option,
            value: transposedData[i]
          }]
        })
    }
    );
  } else if (isChartTypeBarFull(chart)) {
    const options = chart.options;
    isY = chart.subType === "bar-full-y";
    const dummyData = isY ? [[0.38, 0.62], [0.32, 0.68]] : [[0, 0, 0, 1, 0], [0, 0, 0, 1, 0], [1, 0, 0], [0, 0.04979, 0.06649, 0.28361, 0.60011], [0.01754, 0.03319, 0.10494, 0.19853, 0.6458], [0.70095, 0.21471, 0.08435], [0.03627, 0.05651, 0.13136, 0.21623, 0.55964], [0.03974, 0.06579, 0.15573, 0.20702, 0.53173], [0.56695, 0.28612, 0.14693], [0, 0.04979, 0.06649, 0.28361, 0.60011], [0.01754, 0.03319, 0.10494, 0.19853, 0.6458], [0.70095, 0.21471, 0.08435], [0.03627, 0.05651, 0.13136, 0.21623, 0.55964], [0.03974, 0.06579, 0.15573, 0.20702, 0.53173], [0.56695, 0.28612, 0.14693], [0, 0.04979, 0.06649, 0.28361, 0.60011], [0.01754, 0.03319, 0.10494, 0.19853, 0.6458], [0.70095, 0.21471, 0.08435], [0.03627, 0.05651, 0.13136, 0.21623, 0.55964], [0.03974, 0.06579, 0.15573, 0.20702, 0.53173], [0.56695, 0.28612, 0.14693]];
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
      yAxisNew.push(
        {
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
        }
      );
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
      series.push(
        {
          name: option,
          stack: "all",
          type: 'bar',
          barWidth: chart.subType === "bar-full-x" ? 20 : 100,
          barGap: '80%', /*多个并排柱子设置柱子之间的间距*/
          barCategoryGap: '50%', /*多个并排柱子设置柱子之间的间距*/
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
        }
      );
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
    grid: {
      // top: "30%",
      right: isChartTypeBarFull(chart) ? "5%" : isChartTypeBarVertical(chart) ? "10%" : isChartTypeBarTypical(chart) ? "10%" : "5%",
      containLabel: true,
      top: chart.title !== "" ? 60 : 30,
      bottom: (chart.subType === "bar-full-x" && getOptionLength(chart) > 40) ? 60 : 40,
    },
    title: {
      text: chart.title,
      // text: getOptionLength(chart),
      x: "center",
    },
    tooltip: {
      // formatter: "{c}%",
      show: true,
      trigger: isChartTypeRadar(chart) ? 'item':null,
      formatter: function (params) {
        if (isChartTypeBarBasic(chart)) {
          return toFixed(params.value);
        } else if (isChartTypePieBasic(chart)) {
          return toFixed(params.value * 100) + "%";
        } else if (isChartTypeBarVertical(chart)) {
          return toFixed(params.value) + "%";
        } else if (isChartTypeBarTypical(chart)) {
          return toFixed(params.value) + "%";
        } else if(isChartTypeRadar(chart)){
          return toFixed(params.value);
        }
        else {
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
      data: legendData,
      // top: "10%",
      orient: isChartTypeBarBasic(chart) ? "horizontal" : isChartTypePieBasic(chart) ? "vertical" : isChartTypeBarVertical(chart) ? "vertical" : isChartTypeBarTypical(chart) ? "vertical" : isChartTypeRadar(chart) ? "vertical" : "horizontal",
      x: isChartTypeBarBasic(chart) ? "center" : isChartTypePieBasic(chart) ? "right" : isChartTypeBarVertical(chart) ? "right" : isChartTypeBarTypical(chart) ? "right" : isChartTypeRadar(chart) ? "right" : "center",
      y: isChartTypeBarBasic(chart) ? "bottom" : isChartTypePieBasic(chart) ? "center" : isChartTypeBarVertical(chart) ? "center" : isChartTypeBarTypical(chart) ? "center" : isChartTypeRadar(chart) ? "center" : "bottom",
    },
    radar: !isChartTypeRadar(chart) ? null : {
      name:{
        show:true,
        fontSize:13,
      },
      nameGap:0,
      radius:'88%',
      indicator: indicatorData, 
    },
    xAxis: {
      name: isChartTypeBarBasic(chart) ? chart.scopes[0].text.split("").join("\n\n") : isChartTypeBarVertical(chart) ? chart.scopes[0].text.split("").join("\n\n") : isChartTypeBarTypical(chart) ? chart.scopes[0].text.split("").join("\n\n") : null,
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
        formatter: isChartTypeBarBasic(chart) ? '{value}' : isChartTypeBarVertical(chart) ? '{value}' : isChartTypeBarTypical(chart) ? '{value}' : '{value}%',
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
      min: isChartTypeBarBasic(chart) ? 0 : isChartTypeBarVertical(chart) ? 0 : isChartTypeBarTypical(chart) ? 0 : 0,
      max: isChartTypeBarBasic(chart) ? 5 : isChartTypeBarVertical(chart) ? 100 : isChartTypeBarTypical(chart) ? 100 : 100,
      interval: isChartTypeBarBasic(chart) ? 1 : isChartTypeBarVertical(chart) ? 20 : isChartTypeBarTypical(chart) ? 10 : 10,
    },
    yAxis: [{
      data: yData,
      name: isChartTypeBarTypical(chart) ? chart.datatype : null,
      nameLocation: "middle",
      nameRotate: 0,
      nameGap: 30,
      nameTextStyle: {
        fontSize: isChartTypeBarTypical(chart) ? 13 : null,
      },
      inverse: isChartTypeBarY(chart) ? (chart.order === "down-right") : isChartTypeBarVertical(chart) ? (chart.order === "down-right") : isChartTypeBarTypical(chart) ? (chart.order === "down-right") : ((chart.order !== "down-right")),
      axisLabel: {
        show: true,
        fontSize: fontSize,
        textStyle: {
          color: "black",
          // fontSize: 14,
        }
      },
      axisLine: {
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
      classes: props,//数据源
    };
    // console.log(props);
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(value) {
    switch (parseInt(value)) {
      case 0:
        {
          const chart = this.props.chart;
          chart.type = 'pie';
          chart.subType = 'pie-basic-simple';
          chart.scopes = [
            {
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
      case 1:
        {
          const chart = this.props.chart;
          chart.type = 'bar';
          chart.subType = 'bar-vertical-y';
          chart.scopes = [
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
        chart.scopes = [
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
      case 3:
        {
          const chart = this.props.chart;
          chart.type = 'radar';
          chart.subType = 'radar';
          chart.scopes = [
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
        default:
           alert("请选择正确的图例");
    }
  }

  renderData() {
    if (this.props.data.length === 0) {
      return null;
    }

    return (
      <div style={{ marginBottom: "20px" }}>
        服务器回传数据：
        {
          JSON.stringify(this.props.data)
        }
      </div>
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
      return (
        <div>
          {
            this.renderData()
          }
          {
            getChartText(chart, data)
          }
        </div>
      )
    }
    console.log(chart);

    const option = getChartOption(chart, data, false);
    return (
      <div>
        {
          <Select defaultValue="default" style={{ width: 120 }} onChange={this.handleChange} >
            <Option value='default'>请选择图例</Option>
            <Option value="0">饼状图</Option>
            <Option value="1">纵向直方图</Option>
            <Option value="2">典型直方图</Option>
            <Option value="3">雷达图</Option>
            <Option value="4">盒型图1</Option>
            <Option value="5">盒型图2</Option>
            <Option value="6">复杂饼状图</Option>
            <Option value="7">纵向多种条形图</Option>
            <Option value="8">横向多种条形图</Option>
          </Select>
        }
        {
          this.renderData()
        }
        <ReactEcharts style={{ width: chart.width, height: chart.height, border: '2px solid rgb(217,217,217)' }} option={option} notMerge={true} onEvents={this.onEvents} />
      </div>
    )
  }

  render() {
    return this.renderChart(this.props.chart, this.props.data)
  }
}

export default Chart;
