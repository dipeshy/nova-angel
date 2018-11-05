// @flow
import React, { Component } from 'react';
import { EditorTaskType, TaskType } from '../../../types/task';
import vscodeLogo from '../../../assets/vscode-icon.png';

type Props = {
    task: EditorTaskType,
    invokeTask: (taskName: string, task: TaskType) => void
};

export default class EditorTask extends Component<Props> {
    props: Props;

    handleClick = () => {
        const { task, invokeTask } = this.props;
        invokeTask('editor:open', task);
    };

    render() {
        const { task } = this.props;
        return (
            <button
                type="button"
                className="btn btn-mini btn-default"
                id={task.id}
                onClick={this.handleClick}
            >
                <span className="icon">
                    <img
                        style={{
                            width: '14px'
                        }}
                        src={vscodeLogo}
                        alt="vscode"
                    />
                </span>
            </button>
        );
    }
}
