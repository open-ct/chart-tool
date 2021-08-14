import React from "react";
import ReactEcharts from 'echarts-for-react';
import * as Setting from "./Setting";

function getScopeId(scope) {
  return scope.text;
}

function getScopeId2(scope) {
  return `${scope.text} - ${scope.type}`;
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
export function isChartTypePieBasic(chart){
  return chart.subType === "pie-basic"|| chart.subType==="pie-rose"|| chart.subType==="pie-ring";
}
export function isChartTypeBarTypical(chart){
  return chart.subType === "bar-typical-y" || chart.subType ==="bar-typical-x";
}
export function isChartTypeRadar(chart) {
  return chart.subType==="radar-basic";
}
export function getChartOption(chart, data, isPdf) {
  const fontSize = chart.fontSize;
  const scopes = chart.scopes.filter(scope => scope.type !== "标记");

  let yAxisNew = [];
  let yData = [];
  let legendData = [];
  let series = [];
  let isY = false;
  let isPie=false;
  let isradar=false;
  let nametext1=[];
  let nametext2=[];
  let index=[];
  let radardata = [];
  let indicatorData;
  let indicatorname
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
  } else if (isChartTypePieBasic(chart)) {
    const options = chart.scopes.map(scope => getScopeLabel(scope));
    isPie = chart.subType === "pie-basic";//数值轴是y轴，isY=true
    legendData = options;
    data = data.length !== 0 ? data.map(row => row[0]) : Setting.randomsfloorBetween(chart.scopes.length);
    data=  Setting.pieDataProcess(legendData,data);
    series.push(
      {
        name: '百分比',
        type: 'pie',
        radius: '50%',
        label: {
          formatter: function(params) {
            // return `${params.value}`;
            if (params.value < 0) {
              return "你在本题上没有作答";
            } else if (params.value === 0) {
              return "贵校在该题上缺乏有效数据";
            }
            return toFixed(params.value);
          },
        },
        data: data,
      }
    );
    if(chart.subType === "pie-rose"){
    series[0].roseType="radius";
  }
   if(chart.subType === "pie-ring"){
 series[0].radius=[50,140];
  }
}else if(isChartTypeRadar(chart)){
    const options = chart.scopes.map(scope => getScopeLabel(scope));
    isradar = chart.subType === "radar-basic";//数值轴是y轴，isY=true
    indicatorname = options;
    indicatorname=Setting.SetDuplicateRemoval(indicatorname);
    data = data.length !== 0 ? data.map(row => row[0]) : Setting.randomsBetween(0, 100, chart.scopes.length);
    //ranges是雷达图的角点
    nametext1=chart.scopes.map(scope => getScopeId(scope));
    nametext2=Setting.SetDuplicateRemoval(nametext1);
    legendData=nametext2;//雷达图的维度
    indicatorData=Setting.getindicatorData(indicatorname);
    legendData.forEach(value=>{
      index=Setting.findall(nametext1,value);
      var namedata=Setting.findvalue(data,index);
    radardata.push(
      {
        value:namedata,
        name:value,
      }
    );
    series.push({
      type:"radar",
      data:radardata,
    })
  })
 }
else if(isChartTypeBarTypical(chart)){
  const options = chart.scopes.map(scope => getScopeLabel(scope));
  isY = chart.subType === "bar-typical-y";
  yData = options;
  data = data.length !== 0 ? data.map(row => row[0]) : Setting.randomsBetween(0, 100, chart.scopes.length);
  data = getDefaultData(chart, data);
  yData = Setting.SetDuplicateRemoval(yData);
  nametext1=chart.scopes.map(scope => getScopeId(scope));
  nametext2=Setting.SetDuplicateRemoval(nametext1);
  legendData=nametext2;
  nametext2.forEach(value=>{
  index=Setting.findall(nametext1,value);
  var namedata=Setting.findvalue(data,index);
  series.push(
     {
       name:value,
       type:'bar',
       barGap: 0,
       barMaxWidth:50,
       barMinWidth:20,
       label: {
        show: true,
        position: isY? "top" : "right",
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
      emphasis: {
              focus: 'series'
          },
    data:namedata
     }
   )
    })
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
     toolbox: {
      show: true,
      feature: {
          mark: {show: true},
          dataView: {show: true, readOnly: false},
          restore: {show: true},
          saveAsImage: {show: true}
      }
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
      orient:!(isChartTypePieBasic(chart)||isChartTypeBarTypical(chart)||isChartTypeRadar(chart))? "horizontal":"vertical",
      x: !(isChartTypePieBasic(chart)||isChartTypeBarTypical(chart)||isChartTypeRadar(chart))? "center":"right",
      y: !(isChartTypePieBasic(chart)||isChartTypeBarTypical(chart)||isChartTypeRadar(chart))? "bottom":"center",
    },
    radar:!isChartTypeRadar(chart)?null: {indicator:indicatorData},
    xAxis: {
      name: !isChartTypeBarBasic(chart) ? null : chart.scopes[0].text.split("").join("\n\n"),
      nameLocation: "middle",
      nameRotate: 0,
      nameGap: 50,
      axisLine: {
        show: false,
      },
      axisLabel: {
        fontSize: fontSize,
        formatter: (isChartTypeBarBasic(chart)||isChartTypeBarTypical(chart)) ? '{value}' : '{value}%',
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
      min: isChartTypeBarBasic(chart) ? 0 : 0,
      max: isChartTypeBarBasic(chart) ? 5 : 100,
      interval: isChartTypeBarBasic(chart) ? 1 : 10,
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
  }else if(isPie){
    delete option.xAxis;
    delete option.yAxis;
  }else if(isradar){
    delete option.xAxis;
    delete option.yAxis;
  };
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
