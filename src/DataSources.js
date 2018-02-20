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

@inject("store") @observer
class DataSources extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    jQuery(".data-sources-button").button({
       icons: { primary: "ui-icon-info" },
       iconPosition: "end",
       label: "Data Info",
       //text: false
    });
  }

  render() {
        const element = document.getElementsByClassName('data-sources');
        return (
            <div className="data-sources-label">
                <button className="data-sources-button" onClick={this.props.store.cc.updatePopupStatus}>Data Sources</button>
            </div>
        )
  }

};

export default DataSources;
