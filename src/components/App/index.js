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
import { inject, observer} from 'mobx-react';

import LocationPicker from '../../components/LocationPicker';
import CropPicker from '../../components/CropPicker';
import DisplayButtonGroup from '../../components/DisplayButtonGroup';
import ChartDisplay from '../../components/ChartDisplay';
//import DisplayClimateChange from '../../components/DisplayClimateChange';
import InfoWindow from '../../components/InfoWindow';

// Styles
import '../../styles/App.css';

@inject('store') @observer
class App extends Component {

    render() {

        return (
            <div className="App">
                <div className="csftool-input">
                    <LocationPicker 
                      namespace='CSF-COVERCROP'
                    />
                    <CropPicker />
                    <DisplayButtonGroup />
                </div>
                <div className="csftool-display">
                    <ChartDisplay />
                    <InfoWindow
                      content={this.props.store.app.info_content}
                      button_label="Back to tool"
                    />
                </div>
                <div className="csftool-location-dialog">
                </div>
            </div>
        );
    }
}

export default App;
