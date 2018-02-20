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
import GaugeChart from './GaugeChart';

var cc;

const spinner = <div className="loader"></div>

@inject("store") @observer
class ChartDisplay extends Component {

  constructor(props) {
    super(props);
    cc = this.props.store.cc;
  }

  render() {
    if (cc.getProbs15!=null && cc.getGdd!=null && cc.getDates!=null && cc.getYears!=null) {
      return (
        <div>

          <div className="csftool-display-chart-top">

            <Loader message={spinner} show={cc.getLoader} priority={10} backgroundStyle={{backgroundColor: null}} hideContentOnLoad={false}>

               <div className="csftool-display-chart-top-chart">
                   <ReactHighcharts config={ cc.chartConfig } isPureConfig />
               </div>
               <div className="csftool-display-chart-top-gauge">
                  <GaugeChart config={ cc.gaugeConfig_15yrNormal } />
               </div>
               <div className="csftool-display-chart-planting-date">
                  Planting Date: { cc.getPlantingDate.slice(0,5).replace('-','/') }
               </div>
               <div className="csftool-display-chart-mouseover-message">
                  { cc.getChartLabel }
               </div>

            </Loader>

          </div>

          <div className="csftool-display-chart-bottom">
            <ReactHighcharts config={ cc.chartConfig_bar } isPureConfig />
          </div>

        </div>
      );
    } else {
      return (
        <div> 
          <div className="csftool-display-charts">
            <Loader message={spinner} show={cc.getLoader} priority={10} backgroundStyle={{backgroundColor: null}} hideContentOnLoad={false}>
                <div></div>
            </Loader>
          </div>
        </div>
      )
    }
  }
}

export default ChartDisplay;
