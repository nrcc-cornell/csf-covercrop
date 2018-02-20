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
import { string } from 'prop-types'
import Icon from 'react-icons-kit';
import { infoCircle } from 'react-icons-kit/fa/infoCircle';       
//import { horizontalCenter } from 'react-icons-kit';

import '../../styles/InfoButton.css';

@inject("store") @observer
class InfoButton extends Component {

  static propTypes = {
    button_label: string,
  }

  static defaultProps = {
    button_label: "Go",
  }

  render() {
        const className = this.props.store.app.popupStatus ? 'data-sources-button-active' : 'data-sources-button-inactive';
        return (
            <div className="data-sources-label">
              <div>
                <button className={className} onClick={this.props.store.app.updatePopupStatus}>
                    <Icon icon={infoCircle} className="info-icon" />
                    {this.props.button_label}
                </button>
              </div>
            </div>
        )
  }

};

export default InfoButton;
