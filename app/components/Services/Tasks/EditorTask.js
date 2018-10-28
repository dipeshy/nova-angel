// @flow
import React, { Component } from 'react';
import styles from './Task.css';
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
      <section className={styles.container} id={task.id}>
        <img
          style={{
            width: '15px',
            height: '15px'
          }}
          src={vscodeLogo}
          alt="vscode"
        />
        <span
          style={{
            marginLeft: '7px',
            fontSize: '1.2em',
            color: 'green',
            cursor: 'pointer'
          }}
          role="presentation"
          onClick={this.handleClick}
          className="icon icon-export"
        />
      </section>
    );
  }
}
