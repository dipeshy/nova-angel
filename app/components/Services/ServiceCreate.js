// @flow
import { v4 } from 'uuid';
import React, { Component } from 'react';
import styles from './ServiceCreate.css';
import { ServiceType } from '../../types/service';
import { EditorTaskType } from '../../types/task';
import NodeServiceCreate from './NodeServiceCreate';

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
      service: {
        id: v4(),
        name: '',
        projectDir: '',
        tasks: []
      }
    };
  }

  handleNameChange = event => {
    this.setState({
      name: event.target.value
    });
  };

  handleSubmit = event => {
    event.preventDefault();
    const { createService, history } = this.props;
    const { service } = this.state;

    console.log('Creating service', service);
    createService(service);
    history.push('/');
  };

  setProjectDir = (projectDir: string) => {
    this.setState(prevState => {
      const { service } = prevState;
      service.projectDir = projectDir;

      const editorTask: EditorTaskType = {
        id: `${service.id}:editor`,
        name: 'vscode',
        projectDir: service.projectDir,
        type: 'editor'
      };

      service.tasks = [editorTask, ...service.tasks];

      return {
        service
      };
    });
  };

  addTask = task => {
    console.log('Adding task', { task });
    this.setState(prevState => {
      const state = { ...prevState };
      state.service.tasks.push(task);
      return state;
    });
  };

  removeTask = id => {
    console.log('Removing task', { id });

    this.setState(prevState => {
      const state = { ...prevState };
      const tasks = prevState.service.tasks.filter(task => id !== task.id);
      state.service.tasks = tasks;
      return state;
    });
  };

  render() {
    const { service } = this.state;
    return (
      <div className={`${styles.container}`}>
        <form onSubmit={this.handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">
              <strong>Service name</strong>
            </label>
            <input
              type="text"
              id="name"
              value={service.name}
              onChange={this.handleNameChange}
              className="form-control"
              placeholder="Service name"
            />
          </div>
          <br />
          <strong>Setup NodeJS Project</strong>
          <NodeServiceCreate
            service={service}
            setProjectDir={this.setProjectDir}
            addTask={this.addTask}
            removeTask={this.removeTask}
          />
          <br />
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
