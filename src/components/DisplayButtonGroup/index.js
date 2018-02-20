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
//import ClimateChangeButton from '../../components/ClimateChangeButton';
import InfoButton from '../../components/InfoButton';

import '../../styles/DisplayButtonGroup.css';

class DisplayButtonGroup extends Component {

  render() {
        return (
            <div className="display-button-group">
                    <table><tbody>
                    <tr>
                    <td>
                      <InfoButton button_label="Info" />
                    </td>
                    </tr>
                    </tbody></table>
            </div>
        )
  }

};

export default DisplayButtonGroup;
