// @flow
import { v4 } from 'uuid';
import React, { Component } from 'react';
import styles from './ServiceCreate.css';
import npmPackageParser from '../../utils/npm-package-parser';
import { ServiceType } from '../../types/service';
import createNpmTasks from '../../utils/npmtasks';

const { dialog } = require('electron').remote;

type Props = {
  createService: (service: ServiceType) => void,
  history: {
    push: () => void
  }
};

export default class ServiceCreate extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.dialog = dialog;
    this.state = {
      projectDir: '',
      name: '',
      npmtasks: [],
      tasks: []
    };
  }

  handleChange = event => {
    this.setState({
      name: event.target.value
    });
  };

  handleSubmit = event => {
    event.preventDefault();
    const { createService, history } = this.props;
    const { name, projectDir, tasks } = this.state;

    const service = {
      id: v4(),
      name,
      projectDir,
      tasks
    };
    console.log('Creating service', service);
    createService(service);
    history.push('/');
  };

  setProjectDirWithDialog = () => {
    const selectedDirs = this.dialog.showOpenDialog({
      properties: ['openDirectory']
    });
    const projectDir = selectedDirs[0];
    const manifest = npmPackageParser(projectDir);

    if (manifest instanceof Error) {
      return;
    }

    const { name, npmscripts } = manifest;

    this.setState({
      projectDir,
      name,
      npmtasks: createNpmTasks(npmscripts),
      tasks: []
    });
  };

  selectNpmScript = event => {
    const selectedId = event.target.value;
    const { npmtasks } = this.state;
    const task = npmtasks.find(t => t.id === selectedId);

    if (event.target.checked) {
      this.addTask(task);
    } else {
      this.removeTask(task.id);
    }
  };

  addTask = task => {
    const { tasks } = this.state;
    tasks.push(task);
    this.setState({
      tasks
    });
  };

  removeTask = id => {
    const { tasks } = this.state;
    this.setState({
      tasks: tasks.filter(task => id !== task.id)
    });
  };

  render() {
    const { projectDir, name, tasks, npmtasks } = this.state;
    return (
      <div className={`${styles.container}`} data-tid="container">
        <form onSubmit={this.handleSubmit}>
          <div className="form-group">
            <button
              className="btn btn-default"
              type="button"
              onClick={this.setProjectDirWithDialog}
            >
              Select Nodejs Project
            </button>
            &nbsp;&nbsp;
            <span>{projectDir || 'Not set'}</span>
          </div>
          <div className="form-group">
            <label htmlFor="name">Service Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={this.handleChange}
              className="form-control"
              placeholder="Service name"
            />
          </div>
          <div className="checkbox">
            <span>Select npm script</span>
            {npmtasks.map((npmTask: TaskType) => {
              const selected = !!tasks.find(t => t.id === npmTask.id);
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
          <div className="form-actions">
            <button type="submit" className="btn btn-form btn-primary">
              Create
            </button>
          </div>
        </form>
      </div>
    );
  }
}
