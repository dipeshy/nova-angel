import React, { Component } from 'react';
import styles from './ConsoleTab.css';
import {
    decorateAnsiColours,
    decorateLinks 
} from '../utils/console-utils'

export default class ConsoleTab extends Component<Props> {
    render() {
        const { myConsole } = this.props;
        const { logs } = myConsole;
        return (
            <div className={`${styles.container}`}>
                <div className={`${styles.logs}`}>
                    { logs.map(({id, log}) => <div key={id} dangerouslySetInnerHTML={getMarkup(log)} />)}
                </div>
            </div>
        );
    }
}

function getMarkup(log) {
    return { __html: decorateAnsiColours(decorateLinks(log)) };
}