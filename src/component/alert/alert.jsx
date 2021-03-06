import React, { PureComponent } from 'react';
import { withTheme } from '@theemeraldtree/emeraldui';
import AlertManager from '../../manager/alertManager';
import Overlay from '../overlay/overlay';
import AlertObject from './alertobject';

export default withTheme(class Alert extends PureComponent {
  constructor() {
    super();
    this.state = {
      alerts: []
    };
  }

  componentDidMount() {
    AlertManager.registerHandler(this.updateAlerts);
  }

  updateAlerts = () => {
    this.setState(
      {
        alerts: AlertManager.alerts
      },
      () => {
        this.forceUpdate();
      }
    );
  };

  dismiss = id => {
    AlertManager.dismissAlert(id);
  };

  render() {
    return (
      <Overlay in={this.state.alerts.length >= 1} force>
        {this.state.alerts.map(alert => (
          <AlertObject key={alert.id} dismiss={this.dismiss} id={alert.id} buttons={alert.buttons}>
            {alert.html}
          </AlertObject>
        ))}
      </Overlay>
    );
  }
});
