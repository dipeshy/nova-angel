// @flow
import React, { Component } from 'react';
import styles from './NodeServiceCreate.css';
import npmPackageParser from '../../utils/npm-package-parser';
import { ServiceType } from '../../types/service';
import { TaskType } from '../../types/task';
import createNpmTasks from '../../utils/npmtasks';

const { dialog } = require('electron').remote;

type Props = {
  service: ServiceType,
  setProjectDir: (projectDir: string) => void,
  addTask: (task: TaskType) => void,
  removeTask: (taskId: string) => void
};

export default class NodeServiceCreate extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.dialog = dialog;
    this.state = {
      npmtasks: []
    };
  }

  setProjectDirWithDialog = () => {
    const { service, setProjectDir } = this.props;
    const selectedDirs = this.dialog.showOpenDialog({
      properties: ['openDirectory']
    });
    const projectDir = selectedDirs[0];
    const manifest = npmPackageParser(projectDir);

    if (manifest instanceof Error) {
      return;
    }

    const { npmscripts } = manifest;
    setProjectDir(projectDir);

    this.setState({
      npmtasks: createNpmTasks(service.id, npmscripts)
    });
  };

  selectNpmScript = event => {
    const { addTask, removeTask } = this.props;
    const selectedId = event.target.value;
    const { npmtasks } = this.state;
    const task = npmtasks.find(t => t.id === selectedId);

    if (event.target.checked) {
      addTask(task);
    } else {
      removeTask(task.id);
    }
  };

  render() {
    const { npmtasks } = this.state;
    const { service } = this.props;
    return (
      <div className={`${styles.container}`}>
        <div className="form-group">
          <button
            className="btn btn-default"
            type="button"
            onClick={this.setProjectDirWithDialog}
          >
            Project Path
          </button>
          &nbsp;&nbsp;
          <span>{service.projectDir || 'Not set'}</span>
        </div>
        {!!npmtasks.length && (
          <div className="checkbox">
            <strong>Select npm script</strong>
            {npmtasks.map((npmTask: TaskType) => {
              const selected = !!service.tasks.find(t => t.id === npmTask.id);
              return (
                <div key={npmTask.id}>
                  <label htmlFor={npmTask.id}>
                    <input
                      id={npmTask.id}
                      value={npmTask.id}
                      defaultChecked={selected}
                      onChange={this.selectNpmScript}
                      type="checkbox"
                    />
                    &nbsp;
                    {npmTask.name}
                  </label>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}
