import React from "react";
import ReactEcharts from 'echarts-for-react';
import * as Setting from "./Setting";

function getScopeId(scope) {
  return scope.text;
}

function getScopeId2(scope) {
  return `${scope.text} - ${scope.type}`;
}

function SetDuplicateRemoval(arr){
    let set=new Set(arr);    
    let res = [];
    res=Array.from(set);
    return res;
}
function findall(nametext1,value){
    let results=[],len=nametext1.length,pos=0;
    while(pos<len){
        pos=nametext1.indexOf(value,pos);
        if(pos===-1)break;
        results.push(pos);
        pos=pos+1; 
    }
    return results;
}
/* data是数据，value是每个维度下的对应数据的索引值,在data中寻找data中对应value索引的数值
将各种多维数据处理成可以直接使用的data
 */
function findvalue(data,value){
    let results=[];
    for (var i=0;i<value.length;i++){
        let value_index=value[i];
        results.push(data[value_index]);
    }
    return results;
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
export function isChartTypeBarLong(chart) {
  return chart.subType === "bar-Long-y";
}
export function getChartOption(chart, data, isPdf) {
  const fontSize = chart.fontSize;
  const scopes = chart.scopes.filter(scope => scope.type !== "标记");

  let yAxisNew = [];
  let yData = [];
  let legendData = [];
  let series = [];
  let isY = false;
  let nametext1 = [];
  let nametext2 = [];
  let index = [];
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
          formatter: function(params) {
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
  }else if (isChartTypeBarLong(chart)) {
    const options = chart.scopes.map((scope) => getScopeLabel(scope));
    isY = chart.subType === "bar-Long-y";
    yData = options; 
    //data随机生成数据在这边，由于data=[]传进来的，所以执行Setting.randomBetween
    //默认典型直方图的数据格式是[x,y,z,m,n]
    //要求用户在同一类目下按顺序输入完所有要添加的维度数据，不准类目数据交叉
    data =data.length !== 0 ? data.map((row) => row[0]): Setting.randomsBetween(0, 100, chart.scopes.length);
    data = getDefaultData(chart, data);
    yData = SetDuplicateRemoval(yData);
    nametext1 = chart.scopes.map((scope) => getScopeId(scope));
    nametext2 = SetDuplicateRemoval(nametext1);
    legendData = nametext2;
    nametext2.forEach((value) => {
      index = findall(nametext1, value);
      var namedata = findvalue(data, index);
      series.push({
        name: value,
        type: "bar",
        barGap: 0,
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
        data: namedata,
      });
    });
  } else if (isChartTypeBarFull(chart)) {
    const options = chart.options;
    isY = chart.subType === "bar-full-y";
    const dummyData = isY ? [[0.38,0.62],[0.32,0.68]] : [[0,0,0,1,0],[0,0,0,1,0],[1,0,0],[0,0.04979,0.06649,0.28361,0.60011],[0.01754,0.03319,0.10494,0.19853,0.6458],[0.70095,0.21471,0.08435],[0.03627,0.05651,0.13136,0.21623,0.55964],[0.03974,0.06579,0.15573,0.20702,0.53173],[0.56695,0.28612,0.14693],[0,0.04979,0.06649,0.28361,0.60011],[0.01754,0.03319,0.10494,0.19853,0.6458],[0.70095,0.21471,0.08435],[0.03627,0.05651,0.13136,0.21623,0.55964],[0.03974,0.06579,0.15573,0.20702,0.53173],[0.56695,0.28612,0.14693],[0,0.04979,0.06649,0.28361,0.60011],[0.01754,0.03319,0.10494,0.19853,0.6458],[0.70095,0.21471,0.08435],[0.03627,0.05651,0.13136,0.21623,0.55964],[0.03974,0.06579,0.15573,0.20702,0.53173],[0.56695,0.28612,0.14693]];
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
            formatter: function(params) {
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
        formatter: function(params) {
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
      right: isChartTypeBarFull(chart) ? "5%" : isChartTypeBarLong(chart)?"10%":"5%",
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
      formatter: function(params) {
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
      orient: isChartTypeBarLong(chart)?"vertical":"horizontal",
      x: isChartTypeBarLong(chart)?"right":"center",
      y: isChartTypeBarLong(chart)?"center":"bottom",
     },
    xAxis: {
      name: isChartTypeBarBasic(chart)? chart.scopes[0].text.split("").join("\n\n"):isChartTypeBarLong(chart)?"百\n分\n比\n(\n%\n)":null,
      nameLocation: "middle",
      nameRotate: 0,
      nameGap: 50, 
      axisLine: {
        show: true,
        lineStyle: {
          color:"rgb(217,217,217)",
          width:1,
        }
      },
      axisLabel: {
        fontSize: fontSize,
        formatter: isChartTypeBarBasic(chart) ? '{value}' :isChartTypeBarLong(chart)? '{value}':'{value}%',
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
      min: isChartTypeBarBasic(chart) ? 0 :isChartTypeBarLong(chart)? 0:0,
      max: isChartTypeBarBasic(chart) ? 5 : isChartTypeBarLong(chart)? 100:100,
      interval: isChartTypeBarBasic(chart) ? 1 :isChartTypeBarLong(chart)?20:10,
    },
    yAxis: [{
      data: yData,
      inverse: isChartTypeBarY(chart) ? (chart.order === "down-right") : ((chart.order !== "down-right")),
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
          color:"rgb(217,217,217)",
          width:1,
        }
      },
      axisTick: {
        show: false,
        lineStyle: {
          color:"rgb(217,217,217)",
          width:1,
        }
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

    return (
      <div style={{marginBottom: "20px"}}>
        服务器回传数据：
        {
          JSON.stringify(this.props.data)
        }
      </div>
    )
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

    const option = getChartOption(chart, data, false);
    return (
      <div>
        {
          this.renderData()
        }
        <ReactEcharts style={{width: chart.width, height: chart.height, border: '2px solid rgb(217,217,217)'}} option={option} notMerge={true}/>
      </div>
    )
  }

  render() {
    return this.renderChart(this.props.chart, this.props.data)
  }
}

export default Chart;
