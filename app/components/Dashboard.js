// @flow
import React, { Component } from 'react';
import styles from './Dashboard.css';
import { ServiceType } from '../types/service';
import ServiceComponent from './ServicesInteraction/ServiceComponent';

type Props = {
  services: Array<ServiceType>
};

export default class Dashboard extends Component<Props> {
  props: Props;

  render() {
    const { services } = this.props;
    return (
      <div className="pane-group" data-tid="container">
        <div className={`pane ${styles['services-container']}`}>
          {services.map((service: ServiceType) => (
            <ServiceComponent key={service.id} service={service} />
          ))}
        </div>
      </div>
    );
  }
}
