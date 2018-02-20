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

var cc;

@inject("store") @observer
class DataSourcesViewer extends Component {

  constructor(props) {
    super(props);
    cc = this.props.store.cc;
  }

  componentDidMount() {
    jQuery(".data-sources-button-return").button({
       icons: { primary: "ui-icon-arrowreturnthick-1-w" },
       label: "Back to tool",
       //text: false
    });
  }

  render() {
    const className = cc.popupStatus ? 'data-sources' : 'data-sources-display-none';
    const content = cc.dataSourcesContent
    return (
        <div className={className}>
           <div>
               <button className="data-sources-button-return" onClick={cc.updatePopupStatus}>return</button>
           </div>
           <div className="data-sources-content">
               <h2>Data sources and methods</h2>
               <h3>&bull; Temperature Data</h3>
               <p>
               Growing degree days are calculated using daily maximum and minimum temperatures obtained from a high-resolution (4km) gridded dataset constructed for the Northeast United States. These temperature grids are produced daily by the <a href="http://www.nrcc.cornell.edu" target="_blank">Northeast Regional Climate Center</a> using the documented procedure described in the following publication:
               </p>
               <p>
               Degaetano, Arthur & Belcher, Brian. (2007). Spatial Interpolation of Daily Maximum and Minimum Air Temperature Based on Meteorological Model Analyses and Independent Observations. Journal of Applied Meteorology and Climatology. 46.
               </p>
               <p>
               These data are available for use through the Applied Climate Information System (<a href="http://www.rcc-acis.org" target="_blank">ACIS</a>) web service.
               </p>
               <h3>&bull; Crop Models</h3>
               <p>
               We utilize crop models from the following sources below.
               </p>
               Buckwheat:
               <p>
               Björkman, Thomas & W. Shail, Joseph. (2013). Using a Buckwheat Cover Crop for Maximum Weed Suppression after Early Vegetables. HortTechnology. 23. 575-580. 
               </p>
               Mustard:
               <p>
               Björkman, Thomas. (2015). Mustard Cover Crops for Biomass Production and Weed Suppression in the Great Lakes Region. Agronomy Journal. 107. 1235-1249.
               </p>
               Rye:
               <p>
               Mirsky, Steven & S. Curran, William & Mortensen, David & R. Ryan, Matthew & L. Shumway, Durland. (2009). Control of Cereal Rye with a Roller/Crimper as Influenced by Cover Crop Phenology. Agronomy Journal. 101.<br/>
               Nuttonson, M.Y. 1958. Rye-climate relationships and use of phenology in ascertaining the thermal and photo-thermal requirements of rye. Ameri- can Institute of Crop Ecology, Washington, DC.<br/>
               </p>
           </div>
        </div>
    );
  }

}

export default DataSourcesViewer;
