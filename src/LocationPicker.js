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
class LocationPicker extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.store.cc.initMapDialog()
    this.props.store.cc.initStorageManager()
    this.props.store.cc.initLocationState()
    jQuery(".change-location").button({
       icons: { primary: "ui-icon-pencil" },
       text: false
    });
  }

  render() {
        return (
            <div className="input-div">
              <div className="input-label">
                  <label><b>Location</b></label>
                  <button className="change-location" onClick={this.props.store.cc.mapInit}>Change Location</button>
              </div>
              <div className="location-text">
                <span className="csftool-location-text">{this.props.store.cc.getAddress}</span>
                <br/><span className="csftool-location-text">Lat/Lon: </span><span className="csftool-location-text">{parseFloat(this.props.store.cc.getLat).toFixed(2)}</span>
                <span className="csftool-location-text">, </span><span className="csftool-location-text">{parseFloat(this.props.store.cc.getLon).toFixed(2)}</span>
              </div>
            </div>
        )
  }

};

export default LocationPicker;
