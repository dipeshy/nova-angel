// @flow
import React, { Component } from 'react';
import styles from './Dashboard.css';
import { ServiceType } from '../types/service';
import ServiceComponent from './ServicesInteraction/ServiceComponent';
import ConsoleTabs from '../containers/ConsoleTabs';

const { shell } = require('electron');

type Props = {
    services: Array<ServiceType>,
    taskStates: { [key: string]: boolean }
};

export default class Dashboard extends Component<Props> {
    props: Props;

    constructor(props) {
        super(props);
        this.consoleContainerRef = React.createRef();
    }

    componentDidMount() {
        this.consoleContainerRef.current.addEventListener('click', event => {
            if (event.target && event.target.nodeName === 'A') {
                event.preventDefault();
                shell.openExternal(event.target.href);
            }
        });
    }

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
                <div className="window-content" ref={this.consoleContainerRef}>
                    <ConsoleTabs />
                </div>
            </React.Fragment>
        );
    }
}
