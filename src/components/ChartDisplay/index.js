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

import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Loader from 'react-loader-advanced';
import ReactHighcharts from 'react-highcharts';
import GaugeChart from '../../components/GaugeChart';

import '../../styles/ChartDisplay.css';
import '../../styles/loader.css';

var app;

const spinner = <div className="loader"></div>

@inject("store") @observer
class ChartDisplay extends Component {

  constructor(props) {
    super(props);
    app = this.props.store.app;
  }

  render() {
    if (app.getProbs15!=null && app.getGdd!=null && app.getDates!=null && app.getYears!=null) {
      return (
        <div>

          <div className="csftool-display-chart-top">

            <Loader message={spinner} show={app.getLoader} priority={10} backgroundStyle={{backgroundColor: null}} hideContentOnLoad={false}>

               <div className="csftool-display-chart-top-chart">
                   <ReactHighcharts config={ app.chartConfig } isPureConfig />
               </div>
               <div className="csftool-display-chart-top-gauge">
                  <GaugeChart config={ app.gaugeConfig_15yrNormal } />
               </div>
               <div className="csftool-display-chart-planting-date">
                  Planting Date: { app.getPlantingDate.slice(0,5).replace('-','/') }
               </div>
               <div className="csftool-display-chart-mouseover-message">
                  { app.getChartLabel }
               </div>

            </Loader>

          </div>

          <div className="csftool-display-chart-bottom">
            <ReactHighcharts config={ app.chartConfig_bar } isPureConfig />
          </div>

        </div>
      );
    } else {
      return (
        <div> 
          <div className="csftool-display-charts">
            <Loader message={spinner} show={app.getLoader} priority={10} backgroundStyle={{backgroundColor: null}} hideContentOnLoad={false}>
                <div></div>
            </Loader>
          </div>
        </div>
      )
    }
  }
}

export default ChartDisplay;
