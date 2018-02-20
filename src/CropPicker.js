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
import Select from 'react-select';
import 'react-select/dist/react-select.css';

//const cropArray = ['Buckwheat','Hairy Vetch','Mustard','Rye']
const cropArray = ['Buckwheat','Mustard','Rye']

var disabled
var cropOptions = []
for (var v of cropArray) {
    disabled = false
    if (v=='Hairy Vetch') { disabled = true };
    cropOptions.push({ value: v.toString(), label: v.toString(), clearableValue: false, disabled: disabled })
}

@inject("store") @observer
class CropPicker extends Component {

  render() {
        return (
            <div className='input-div'>
            <div className='input-label'>
              <label><b>Cover Crop</b></label>
            </div>
            <div className='crop-select-div'>
                <table><tbody><tr>
                <td className='crop-select-td'>
                <Select
                    name="crop"
                    value={this.props.store.cc.getCrop}
                    clearable={false}
                    options={cropOptions}
                    onChange={this.props.store.cc.updateSelectedCrop}
                />
                </td>
                </tr></tbody></table>
            </div>
            </div>
        )
  }

};

export default CropPicker;
