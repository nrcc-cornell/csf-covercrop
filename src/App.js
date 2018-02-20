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
import { extendObservable } from 'mobx';
import { Provider } from 'mobx-react';
import { CC } from './CC-model';
import LocationPicker from './LocationPicker';
import ChartDisplay from './ChartDisplay';
import CropPicker from './CropPicker';
//import Prototype from './Prototype';
import DataSources from './DataSources';
import DataSourcesViewer from './DataSourcesViewer';
import './App.css';

export class MainStore {
    constructor() {
        extendObservable(this, {
            cc: null,
        });
        this.initCC();
    }

    initCC() {
        this.cc = new CC({
            location_id: 'default',
            lat: '42.45',
            lon: '-76.48',
            address: 'Cornell University, Ithaca, NY',
            crop: 'Rye',
            gdd_thresh: '300',
        });
    }
}

class App extends Component {
    constructor(props) {
        super(props);
        this.store = new MainStore();
    }

    render() {
        const store = this.store;
	//console.log(store);

        return (
            <Provider store={store}>
                <div className="App">
                    <div className="csftool-input">
                        <LocationPicker />
                        <CropPicker />
                        <DataSources />
                    </div>
                    <div className="csftool-display">
                        <ChartDisplay />
                        <DataSourcesViewer />
                    </div>
                    <div className="csftool-location-dialog">
                    </div>
                </div>
            </Provider>
        );
    }
}

export default App;
