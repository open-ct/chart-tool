import React from "react";
import ReactEcharts from 'echarts-for-react';
import * as Setting from "./Setting";

function getScopeId(scope) {
  return scope.text;
}

function getScopeId2(scope) {
  return `${scope.text} - ${scope.type}`;
}

function processcompositepie(data, lengend) {
  let res = [];
  for (var i = 0; i < lengend.length; i++) {
    let piedata = [];
    piedata.push(lengend[i]);
    piedata.push(data[i]);
    res.push(piedata);
  }
  return res;
}

function addOtherData(datasetSource, len) {
  let percent = 0; //百分比
  let sum = 0; // 总计
  //遍历
  datasetSource.forEach((data) => {
    let count = 0;
    for (let key of data) {
      let value = isNaN(key) ? 0 : Number(key); //过滤每一行数据中的字符串
      if (count === 1) sum += value;
      count++;
    }
  }); //计算sum

  let endData = datasetSource.slice(datasetSource.length - len); //9-3，从索引6开始切片，默认切到最后一个元素
  let other = ["其它"]; //定义一个其它字符串数组
  for (let i = 0; i < endData.length; i++) {
    let j = 0; //遍历其它数组中：也即要分出去表示的数据
    for (let key of endData[i]) {
      let value = isNaN(key) ? 0 : key; //判断数据是否是NaN，是为0，不是为原值
      if (j) other[j] ? (other[j] += value) : other.push(value); //从j=1开始if判断循环
      j++;
    }
    endData[i].splice(1, 0, "");
  }
  datasetSource.push(other);
  // "其他"占比
  percent = sum ? ((other[1] / sum) * 100).toFixed(2) : 100; //四舍五入两位小数
  return [percent, other[1],sum];

}

function getMarkLineData(percent, height, width, otherdata) {
  // 2.根据 series[0].center 获取圆心坐标

  let x0 = width * 0.2; // 圆心x轴坐标
  //3.圆边上点坐标
  // let x1   =   x0   +   r   *   cos(ao   *   3.14   /180   )
  // let y1   =   y0   +   r   *   sin(ao   *   3.14   /180   )
  // “其他” 终点坐标series[0].startAngle 45
  let x1 = x0 + (height * 0.4) * Math.cos((45 * 3.14) / 180);
  let y1 = height * 0.5 - (height * 0.4) * Math.sin((45 * 3.14) / 180); //先定死起始点坐标
  let ao = 360 * (percent / 100); // 扇形角度
  let ao1 = 0; // 用来计算的坐标角度
  ao1 = ao <= 45 ? 45 - ao : 360 - (ao - 45);
  let x2 = 0,
    y2 = 0;
  x2 = x0 + (height * 0.4) * Math.cos((ao1 * 3.14) / 180);
  y2 = height * 0.5 - (height * 0.4) * Math.sin((ao1 * 3.14) / 180);
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
export function isChartTypeCompositePie(chart) {
  return chart.subType === "compositepie";
}
export function getChartOption(chart, data, isPdf) {
  const fontSize = chart.fontSize;
  const scopes = chart.scopes.filter(scope => scope.type !== "标记");

  let yAxisNew = [];
  let yData = [];
  let legendData = [];
  let series = [];
  let isY = false;
  let PieDataset = {};

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
  } else if (isChartTypeCompositePie(chart)) {
    const options = chart.scopes.map((scope) => getScopeLabel(scope));
    isY = chart.subType === "compositepie"; //数值轴是y轴，isY=true
    legendData = options;
    data = data.length !== 0 ? data.map((row) => row[0]) : Setting.randomsBetween(0, 100, chart.scopes.length);
    data = processcompositepie(data, legendData);
    let endData = data.slice(data.length - 4);
    let other = addOtherData(data, 4);
    let percent = other[0];
    let otherdata = other[1];
    let sum = other[2];
    let height = chart.height;
    let width = chart.width;
    let markLineData = getMarkLineData(percent, height, width, otherdata);
    PieDataset = {
      source: data
    };
    series.push({
      type: "pie",
      radius: "80%",
      center: ["20%", "50%"],
      label: {
        show: true,
        position: 'inside',
        formatter: function (params) {
          if (params.value[1] < 0) {
            return "你在本题上没有作答";
          } else if (params.value[1] === 0) {
            return "贵校在该题上缺乏有效数据";
          }
          return params.percent;
          },
        fontSize:12,
      },
      itemlStyle: {
        color: '自适应'
      },
      startAngle: 45, // 起始角度 45
      clockwise: false, // 逆时针
    }, )
    endData.forEach((value) => {
      console.log(value);
      let name = value[0];
      let data = value[2];
      series.push({
        name: name,
        type: "bar",
        stack: "其它",
        barWidth: 100,
        center: ["0%", "50%"],
        label: {
          show: true,
          position: 'inside',
           formatter: function (params) {
             if (params.value[1] < 0) {
            return "你在本题上没有作答";
          } else if (params.value[1] === 0) {
            return "贵校在该题上缺乏有效数据";
          }
          return ((params.value/sum) * 100).toFixed(2);
          },
          fontSize:12,
        },
        itemlStyle: {
          color: "自适应",
        },
        data: [data],
        markLine: {
          lineStyle: {
            type: "solid",
            width: 2,
            color: "red",
          },
          symbol: "none",
          data: markLineData,
        },
      })
    })
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
    grid: isChartTypeCompositePie(chart) ? {} : {
      // top: "30%",
      right: isChartTypeBarFull(chart) ? "5%" : "5%",
      containLabel: true,
      top: chart.title !== "" ? 60 : 30,
      bottom: (chart.subType === "bar-full-x" && getOptionLength(chart) > 40) ? 60 : 40,
    },
    title: {
      text: chart.title,
      // text: getOptionLength(chart),
      x: "center",
    },
    dataset: !isChartTypeCompositePie(chart) ? null : PieDataset,
    tooltip: isChartTypeCompositePie(chart) ? {} : {
      // formatter: "{c}%",
      formatter: function (params) {
        if (isChartTypeBarBasic(chart)) {
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
      data: legendData,
      // top: "10%",
      orient: isChartTypeCompositePie(chart) ? "vertical" : "horizontal",
      x: isChartTypeCompositePie(chart) ? "right" : "center",
      y: isChartTypeCompositePie(chart) ? "center" : "bottom",
    },
    xAxis: {
      show: !isChartTypeCompositePie(chart) ? true : false,
      name: !isChartTypeBarBasic(chart) ? null : chart.scopes[0].text.split("").join("\n\n"),
      nameLocation: "middle",
      nameRotate: 0,
      nameGap: 50,
      axisLine: {
        show: false,
      },
      type: "value",
      axisLabel: {
        fontSize: fontSize,
        formatter: isChartTypeBarBasic(chart) ? '{value}' : '{value}%',
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        show: chart.subType === "bar-full-y" ? false : true,
        // interval: function(param) {
        //   return param % 2 === 0;
        // }
      },
      min: isChartTypeBarBasic(chart) ? 0 : isChartTypeCompositePie(chart) ? null : 0,
      max: isChartTypeBarBasic(chart) ? 5 : isChartTypeCompositePie(chart) ? null : 100,
      interval: isChartTypeBarBasic(chart) ? 1 : isChartTypeCompositePie(chart) ? null : 10,
    },
    yAxis: [{
      show: !isChartTypeCompositePie(chart) ? true : false,
      data:!isChartTypeCompositePie(chart)? yData:["其它"],
      type: "category",
      inverse: isChartTypeBarY(chart) ? (chart.order === "down-right") : isChartTypeCompositePie ? null : ((chart.order !== "down-right")),
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
        show: false,
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
  }
  console.log(option);
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
      classes: props,
    };
  }

  renderData() {
    if (this.props.data.length === 0) {
      return null;
    }

    return ( <div style = {
        {
          marginBottom: "20px"
        }
      } >
      服务器回传数据： {
        JSON.stringify(this.props.data)
      } </div>
    )
  }

  renderChart(chart, data) {
    if (chart.scopes.length === 0) {
      return Setting.wrapError("请至少添加一个范围");
    }

    if (chart.type === "text") {
      return ( <div > {
          this.renderData()
        } {
          getChartText(chart, data)
        } </div>
      )
    }

    const option = getChartOption(chart, data, false);
    return ( <div > {
        this.renderData()
      } <
      ReactEcharts style = {
        {
          width: chart.width,
          height: chart.height,
          border: '2px solid rgb(217,217,217)'
        }
      }
      option = {
        option
      }
      notMerge = {
        true
      }
      /> </div>
    )
  }

  render() {
    return this.renderChart(this.props.chart, this.props.data)
  }
}export default Chart;