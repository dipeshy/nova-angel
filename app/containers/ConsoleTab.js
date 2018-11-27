import React, { Component } from 'react';
import styles from './ConsoleTab.css';
import { decorateAnsiColours, decorateLinks } from '../utils/console-utils';

export default class ConsoleTab extends Component<Props> {
    constructor(props) {
        super(props);
        this.myRef = React.createRef();
    }

    componentDidMount() {
        this.scrollBottom();
    }

    componentDidUpdate() {
        this.scrollBottom();
    }

    scrollBottom() {
        const parent = this.myRef.current.parentElement.parentElement;
        const parentHeight = parent.getBoundingClientRect().height;
        const contentHeight = this.myRef.current.getBoundingClientRect().height;
        parent.scrollTop = contentHeight - parentHeight;
    }

    render() {
        const { myConsole } = this.props;
        const { logs } = myConsole;
        return (
            <div className={`${styles.container}`}>
                <div ref={this.myRef} className={`${styles.logs}`}>
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
