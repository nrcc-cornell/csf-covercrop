///////////////////////////////////////////////////////////////////////////////
//
// Climate Smart Farming Apple Stage / Freeze Damage Probability Tool
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
import Icon from 'react-icons-kit';
import { mapMarker } from 'react-icons-kit/fa/mapMarker';       
import scriptLoader from 'react-async-script-loader'
import jQuery from 'jquery';
import 'jquery-ui/themes/base/core.css';
import 'jquery-ui/themes/base/theme.css';
import 'jquery-ui/themes/base/button.css';
import 'jquery-ui/themes/base/dialog.css';
import 'jquery-ui/ui/core';
import 'jquery-ui/ui/widgets/button';
import 'jquery-ui/ui/widgets/dialog';
import '../../styles/LocationPicker.css';
import '../../styles/location-dialog.css';

window.jQuery = jQuery;

const HOST = 'https://maps.google.com/maps/api/js';
const KEY = 'AIzaSyDv5pQYe9kRbolVUt0o8XSXSQl4g8BHrrQ';
const URL_google_api = `${HOST}?key=${KEY}`;

@scriptLoader(
  ['http://tools.climatesmartfarming.org/covercrop/js/location-dialog-min.js',
   URL_google_api,
   'http://tools.climatesmartfarming.org/covercrop/js/basil.min.js',
   'http://tools.climatesmartfarming.org/covercrop/js/manage-local-storage.js'
  ],
)
@inject("store") @observer
class LocationPicker extends Component {

  componentWillReceiveProps ({ isScriptLoaded, isScriptLoadSucceed }) {
    if (isScriptLoaded && !this.props.isScriptLoaded) { // load finished
      if (isScriptLoadSucceed) {
        this.props.store.app.initMapDialog()
        this.props.store.app.initStorageManager(this.props.namespace)
        this.props.store.app.initLocationState()
        // initial data download
        //this.props.store.app.downloadResultData(this.props.store.app.getLat, this.props.store.app.getLon, '2017')
        //this.props.store.app.downloadResultData()
      }
    }
  }

  //componentDidMount() {
  //  jQuery(".change-location").button({
  //     icons: { primary: "ui-icon-pencil" },
  //     text: false
  //  });
  //}

  render() {
        return (
            <div className="location-input-div">
              <div className="location-input-label">
                  <label><b>Current Location:</b></label>
              </div>
              <div className="location-text">
                <span className="address-text">{this.props.store.app.getAddress}</span>
                <br/><span className="csftool-coordinates-text">Lat/Lon: </span><span className="csftool-coordinates-text">{parseFloat(this.props.store.app.getLat).toFixed(2)}</span>
                <span className="csftool-coordinates-text">, </span><span className="csftool-coordinates-text">{parseFloat(this.props.store.app.getLon).toFixed(2)}</span>
              </div>
              <div className="location-button">
                  <button className="change-location" onClick={this.props.store.app.openMap}>
                      Change Location
                      <Icon size={14} icon={mapMarker} className="location-icon" />
                  </button>
              </div>
            </div>
        )
  }

};

export default LocationPicker;
