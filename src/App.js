import React from 'react';
import {Col, Row} from 'antd';
import './App.css';

import {Controlled as CodeMirror} from 'react-codemirror2'
import "codemirror/lib/codemirror.css"
import Chart from "./Chart";
require('codemirror/theme/material-darker.css');
require("codemirror/mode/javascript/javascript");

const chart = {
    "owner": "xtzx_dg",
    "name": "你在“自主学习力”维度的得分：",
    "createdTime": "2021-01-02T22:01:25+08:00",
    "type": "pie",
    "subType": "compositepie",
    "title": "",
    "scopes":  [
        {
            "id": 0,
            "type": "默认",
            "range": "不知道",
            "text": "百分比",
            "askId": 395
        },
        {
            "id": 0,
            "type": "默认",
            "range": "无工作",
            "text": "百分比",
            "askId": 395
        },
        {
            "id": 0,
            "type": "默认",
            "range": "政府机构的高级行政人员",
            "text": "百分比",
            "askId": 395
        },
        {
            "id": 0,
            "type": "默认",
            "range": "企业管理人员",
            "text": "百分比",
            "askId": 395
        },
        {
            "id": 0,
            "type": "默认",
            "range": "教育、医务、科研人员、专业技术人员",
            "text": "百分比",
            "askId": 395
        },
        {
            "id": 0,
            "type": "默认",
            "range": "政府普通工作人员",
            "text": "百分比",
            "askId": 395
        },
        {
            "id": 0,
            "type": "默认",
            "range": "商业服务业人员",
            "text": "百分比",
            "askId": 395
        },
        {
            "id": 0,
            "type": "默认",
            "range": "私营或个体经营者",
            "text": "百分比",
            "askId": 395
        },
        {
            "id": 0,
            "type": "默认",
            "range": "工人",
            "text": "百分比",
            "askId": 395
        },
        {
            "id": 0,
            "type": "默认",
            "range": "农民，一直在农村种地或做其他事情",
            "text": "百分比",
            "askId": 395
        },
        ],
    "options": [],
    "width": 750,
    "height": 300,
    "order": "up-left",
    "fontSize": 16,
    "reportTemplate": "学生个体报告",
    "barColors": [
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
    ],
    "colorPin": "rgb(209,52,56)",
    "colorP0": "rgb(68,114,196)",
    "colorP1": "rgb(137,166,218)"
};

const App = () => (
    <div className="App">
        <Row>
            <Col span={12} >
                <CodeMirror
                    className="import-output"
                    value={JSON.stringify(chart, null, 4)}
                    // options={{mode: 'javascript', theme: "default"}}
                    options={{mode: 'javascript', theme: "material-darker"}}
                />
            </Col>
            <Col span={12} >
                <Chart chart={chart} data={[]} />
            </Col>
        </Row>
    </div>
);

export default App;