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
import { string, any } from 'prop-types'
import jQuery from 'jquery';
import 'jquery-ui/themes/base/core.css';
import 'jquery-ui/themes/base/theme.css';
import 'jquery-ui/themes/base/button.css';
import 'jquery-ui/ui/core';
import 'jquery-ui/ui/widgets/button';

import '../../styles/InfoWindow.css';

@inject("store") @observer
class InfoWindow extends Component {

  static propTypes = {
    content: any,
    button_label: string,
  }

  static defaultProps = {
    content: <h2>Popup Content</h2>,
    button_label: "Back",
  }

  componentDidMount() {
    jQuery(".data-sources-button-return").button({
       icons: { primary: "ui-icon-arrowreturnthick-1-w" },
       label: this.props.button_label,
    });
  }

  render() {
    const className = this.props.store.app.popupStatus ? 'data-sources' : 'data-sources-display-none';
    return (
        <div className={className}>
           <div>
               <button className="data-sources-button-return" onClick={this.props.store.app.updatePopupStatus}>return</button>
           </div>
           <div className="data-sources-content">
               {this.props.content}
           </div>
        </div>
    );
  }

}

export default InfoWindow;
