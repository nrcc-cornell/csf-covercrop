///////////////////////////////////////////////////////////////////////////////
//
// Climate Smart Farming Winter Cover Crop Planting Scheduler
// Copyright (c) 2018 Cornell Institute for Climate Smart Solutions
// All Rights Reserved
//
// This software is published under the provisions of the GNU General Public
// License <http://www.gnu.org/licenses/>. A text copy of the license can be
// found in the file 'LICENSE' included with this software.
//
// A text copy of the copyright notice, licensing conditions and disclaimers
// is available in the file 'COPYRIGHT' included with this software.
//
///////////////////////////////////////////////////////////////////////////////

import React from 'react';
import { Sector, Cell, PieChart, Pie } from 'recharts';

const GaugeChart = (props) => {
        const width = props.config.width;
        const chartTitle = props.config.chartTitle;
        const chartValue = props.config.chartValue;
        const colorData = props.config.colorData;

        const activeSectorIndex = colorData.map((cur, index, arr) => {
            const curMax = [...arr]
                .splice(0, index + 1)
                .reduce((a, b) => ({ value: a.value + b.value }))
                .value;
            return (chartValue > (curMax - cur.value)) && (chartValue <= curMax);
        })
        .findIndex(cur => cur);

        const sumValues = colorData
            .map(cur => cur.value)
            .reduce((a, b) => a + b);

        const arrowData = [
            { value: chartValue },
            { value: 0 },
            { value: sumValues - chartValue }
        ];

        const pieProps = {
            startAngle: 180,
            endAngle: 0,
            cx: width / 2.5,
            cy: width / 2.5,
        };

        const pieRadius = {
            innerRadius: (width / 2) * 0.35,
            outerRadius: (width / 2) * 0.4
        };

        const Arrow = ({ cx, cy, midAngle, outerRadius }) => { //eslint-disable-line react/no-multi-comp
            const RADIAN = Math.PI / 180;
            const sin = Math.sin(-RADIAN * midAngle);
            const cos = Math.cos(-RADIAN * midAngle);
            const sx = cx + (outerRadius - width * 0.03) * cos;
            const sy = cy + (outerRadius - width * 0.03) * sin;
            const mx = cx + (outerRadius + width * 0.03) * cos;
            const my = cy + (outerRadius + width * 0.03) * sin;
            return (
                <g>
                    <path d={`M${sx},${sy}L${mx},${my}`} strokeWidth="6" stroke="#000" fill="none" strokeLinecap="round"/>
                    <text x={cx} y={cy} dy={0} textAnchor="middle" fill="#000" fontSize="1.8rem">
                        {chartValue.toFixed(0)}%
                    </text>
                </g>
            );
        };

        const ActiveSectorMark = ({ cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill }) => { //eslint-disable-line react/no-multi-comp
            return (
                <g>
                    <Sector
                        cx={cx}
                        cy={cy}
                        innerRadius={innerRadius}
                        outerRadius={outerRadius}
                        startAngle={startAngle}
                        endAngle={endAngle}
                        fill={fill}
                    />
                </g>
            );
        };

    const renderCustomizedLabel = ({
      cx,
      cy,
      startAngle,
      midAngle,
      endAngle,
      innerRadius,
      outerRadius,
      percent,
      index,
      payload,
      fill
    }) => {
      const RADIAN = Math.PI / 180;
      const sin = Math.sin(-RADIAN * endAngle);
      const cos = Math.cos(-RADIAN * endAngle);
      const x = cx + (innerRadius + 20) * cos;
      const y = cy + (innerRadius + 20) * sin;

      const sx = cx + (innerRadius + 15) * cos;
      const sy = cy + (innerRadius + 15) * sin;
      const mx = cx + (innerRadius) * cos;
      const my = cy + (innerRadius) * sin;

      return (
        <g>
          <text
            x={x}
            y={y}
            fill="black"
            fontSize=".8rem"
            textAnchor={x > cx ? 'middle' : 'middle'}
            dominantBaseline="central"
          >
            {payload.valueLabel}
          </text>
          <path d={`M${sx},${sy} L${mx},${my}`} stroke={fill} fill="none" />
        </g>
      );
    };

        return (
            <div>
            <PieChart width={width} height={(width / 2) + 30}>
                <Pie
                    dataKey="value"
                    activeIndex={activeSectorIndex}
                    activeShape={ActiveSectorMark}
                    data={colorData}
                    fill="#8884d8"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    isAnimationActive={false}
                    { ...pieRadius }
                    { ...pieProps }
                >
                    {
                        colorData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colorData[index].color} />
                        ))
                    }
                </Pie>
                <Pie
                    dataKey="value"
                    stroke="none"
                    activeIndex={1}
                    activeShape={ Arrow }
                    data={ arrowData }
                    outerRadius={ pieRadius.innerRadius }
                    isAnimationActive={false}
                    fill="none"
                    { ...pieProps }
                />
            </PieChart>
            </div>
        );
};

export default GaugeChart;
