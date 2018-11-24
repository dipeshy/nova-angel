// @flow
import React, { Component } from 'react';
import styles from './Dashboard.css';
import { ServiceType } from '../types/service';
import ServiceComponent from './ServicesInteraction/ServiceComponent';
import ConsoleTabs from '../containers/ConsoleTabs';

type Props = {
    services: Array<ServiceType>,
    taskStates: { [key: string]: boolean }
};

export default class Dashboard extends Component<Props> {
    props: Props;

    render() {
        const { services, taskStates } = this.props;
        return (
            <React.Fragment>
                <div className="window-content">
                    <div className="pane-group" data-tid="container">
                        <div className={`pane ${styles['services-container']}`}>
                            {services.map((service: ServiceType) => (
                                <ServiceComponent
                                    key={service.id}
                                    service={service}
                                    taskStates={taskStates}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="window-content">
                    <ConsoleTabs />
                </div>
            </React.Fragment>
        );
    }
}
