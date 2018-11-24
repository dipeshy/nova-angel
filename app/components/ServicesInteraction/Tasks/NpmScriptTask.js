// @flow
import React, { Component } from 'react';
import styles from './Task.css';
import { NpmTaskType, TaskType } from '../../../types/task';
import {
    NPMSCRIPT_START,
    NPMSCRIPT_STOP,
    NPMSCRIPT_VIEWLOG
} from '../../../constants/tasks-constants';
import npmLogo from '../../../assets/npm.png';
import { getClassname } from '../../../utils/utils';

type Props = {
    task: NpmTaskType,
    invokeTask: (taskName: string, task: TaskType) => void,
    active: boolean
};

export default class NpmScriptTask extends Component<Props> {
    props: Props;

    handleClickStart = () => {
        const { task, invokeTask } = this.props;
        invokeTask(NPMSCRIPT_START, task);
    };

    handleClickStop = () => {
        const { task, invokeTask } = this.props;
        invokeTask(NPMSCRIPT_STOP, task);
    };

    handleClickViewLog = () => {
        const { task, invokeTask } = this.props;
        invokeTask(NPMSCRIPT_VIEWLOG, task);
    };

    render() {
        const { task, active } = this.props;
        return (
            <section
                className={getClassname(styles.container, styles.npmscript)}
                id={task.id}
            >
                <img
                    style={{
                        width: '15px',
                        height: '15px'
                    }}
                    src={npmLogo}
                    alt="npm"
                />
                <span className={getClassname(styles.name)}> {task.name} </span>
                {!active && (
                    <span
                        style={{
                            marginLeft: 'auto',
                            fontSize: '1.2em',
                            color: 'green',
                            cursor: 'pointer'
                        }}
                        role="presentation"
                        onClick={this.handleClickStart}
                        className="icon icon-play"
                    />
                )}
                {active && (
                    <span
                        style={{
                            marginLeft: 'auto',
                            fontSize: '1.2em',
                            color: '#B02020',
                            cursor: 'pointer'
                        }}
                        role="presentation"
                        onClick={this.handleClickStop}
                        className="icon icon-stop"
                    />
                )}
            </section>
        );
    }
}
