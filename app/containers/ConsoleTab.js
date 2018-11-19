import React, { Component } from 'react';
import styles from './ConsoleTab.css';
import { decorateAnsiColours, decorateLinks } from '../utils/console-utils';

export default class ConsoleTab extends Component<Props> {
    constructor(props) {
        super(props);
        this.myRef = React.createRef();
    }

    componentDidUpdate() {
        const { myConsole } = this.props;
        const { logs } = myConsole;
        const lineHeight = '16';
        this.myRef.current.parentElement.scrollTop = logs.length * lineHeight;
    }

    render() {
        const { myConsole } = this.props;
        const { logs } = myConsole;
        return (
            <div ref={this.myRef} className={`${styles.container}`}>
                <div className={`${styles.logs}`}>
                    {logs.map(({ id, log }) => (
                        <div
                            key={id}
                            dangerouslySetInnerHTML={getMarkup(log)}
                        />
                    ))}
                </div>
            </div>
        );
    }
}

function getMarkup(log) {
    return { __html: decorateAnsiColours(decorateLinks(log)) };
}
