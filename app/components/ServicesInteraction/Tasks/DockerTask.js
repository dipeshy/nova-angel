// @flow
import React, { Component } from 'react';
import styles from './Task.css';
import { DockerTaskType, TaskType } from '../../../types/task';
import {
    DOCKER_START,
    DOCKER_STOP,
    DOCKER_VIEWLOG
} from '../../../constants/tasks-constants';
import moby from '../../../assets/moby.png';
import { getClassname } from '../../../utils/utils';

type Props = {
    task: DockerTaskType,
    invokeTask: (taskName: string, task: TaskType) => void,
    active: boolean
};

export default class DockerTask extends Component<Props> {
    props: Props;

    handleClickStart = () => {
        const { task, invokeTask } = this.props;
        invokeTask(DOCKER_START, task);
    };

    handleClickStop = () => {
        const { task, invokeTask } = this.props;
        invokeTask(DOCKER_STOP, task);
    };

    handleClickViewLog = () => {
        const { task, invokeTask } = this.props;
        invokeTask(DOCKER_VIEWLOG, task);
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
                        width: '20px'
                    }}
                    src={moby}
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
                {/* { active && (
                     <span
                        style={{
                            marginLeft: '7px',
                            fontSize: '1.2em',
                            color: '#707080',
                            cursor: 'pointer'
                        }}
                        role="presentation"
                        onClick={this.handleClickViewLog}
                        className="icon icon-book"
                    />
                )}
                 */}
            </section>
        );
    }
}
