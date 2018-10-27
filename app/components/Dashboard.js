// @flow
import React, { Component } from 'react';
import styles from './Dashboard.css';

type Props = {
  services: Array<any>
};

export default class Dashboard extends Component<Props> {
  props: Props;

  render() {
    const { services } = this.props;
    console.log(services);
    return (
      <div className={`pane-group ${styles.container}`} data-tid="container">
        <div className="pane-sm sidebar">...</div>
        <div className="pane">Dashboard</div>
      </div>
    );
  }
}
