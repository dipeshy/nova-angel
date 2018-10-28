// @flow
import { v4 } from 'uuid';
import React, { Component } from 'react';
import styles from './ServiceCreate.css';
import { ServiceType } from '../../types/service';
import { EditorTaskType } from '../../types/task';
import NodeServiceCreate from './NodeServiceCreate';
import DockerServiceCreate from './DockerServiceCreate';

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
    this.state = {
      errorMessage: '',
      service: {
        id: v4(),
        name: '',
        projectDir: '',
        tasks: []
      }
    };
  }

  handleNameChange = event => {
    const { value } = event.target;
    const { service } = this.state;
    service.name = value;
    this.setState({
      service
    });
  };

  handleSubmit = event => {
    event.preventDefault();

    const { createService, history } = this.props;
    const { service } = this.state;

    if (!service.name) {
      this.setState({
        errorMessage: 'Enter service name!'
      });
      return;
    }

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

  saveTask = task => {
    const { service } = this.state;
    const found = service.tasks.find(x => x.id === task.id);

    if (found) {
      this.updateTask(task);
    } else {
      this.addTask(task);
    }
  };

  updateTask = targetTask => {
    console.log('Updating task', { targetTask });
    this.setState(prevState => {
      const state = { ...prevState };
      const tasks = prevState.service.tasks.map(
        task => (targetTask.id === task.id ? task : targetTask)
      );
      state.service.tasks = tasks;
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
    const { service, errorMessage } = this.state;
    return (
      <div className={`${styles.container}`}>
        {errorMessage && <div className="alert-error">{errorMessage}</div>}
        <form onSubmit={this.handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Service name</label>
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
          <strong>NodeJS Project</strong>
          <NodeServiceCreate
            service={service}
            setProjectDir={this.setProjectDir}
            addTask={this.addTask}
            removeTask={this.removeTask}
          />
          <br />
          <strong>Docker</strong>
          <DockerServiceCreate
            service={service}
            saveTask={this.saveTask}
            addTask={this.addTask}
          />
          <br />
          <div className="form-actions">
            <button type="submit" className="btn btn-form btn-primary">
              Create Service
            </button>
          </div>
        </form>
      </div>
    );
  }
}
