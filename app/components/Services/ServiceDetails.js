// @flow
import React, { Component } from 'react';
import { groupBy } from 'ramda';
import styles from './ServiceDetails.css';
import { ServiceType } from '../../types/service';
import { TaskType } from '../../types/task';
import npmPackageParser from '../../utils/npm-package-parser';
import createNpmTasks from '../../utils/npmtasks';
import DockerServiceCreate from './DockerServiceCreate';

type Props = {
  service: ServiceType,
  updateService: (service: ServiceType) => void,
  deleteService: (id: string) => void,
  history: {
    push: () => void
  }
};

export default class ServiceDetails extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    const { service } = props;
    const state = {
      service
    };

    if (service.projectDir) {
      const manifest = npmPackageParser(service.projectDir);
      const { npmscripts } = manifest;
      state.npmtasks = createNpmTasks(service.id, npmscripts);
    } else {
      state.npmtasks = [];
    }

    this.state = state;
  }

  groupByTasks = groupBy(task => task.type);

  handleChange = event => {
    const { service } = this.state;
    service.name = event.target.value;
    this.setState({
      service
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

  handleSubmit = event => {
    event.preventDefault();
    const { updateService, history } = this.props;
    const { service } = this.state;

    console.log('Updating service', service);
    updateService(service);
    history.push('/');
  };

  handleDelete = () => {
    const { deleteService, history } = this.props;
    const { service } = this.state;
    deleteService(service.id);

    history.push('/');
  };

  render() {
    const { service, npmtasks } = this.state;
    const name = service.name || '';
    const tasks = service.tasks || [];
    const groupedTasks = this.groupByTasks(tasks);
    const docker = groupedTasks.docker || [];

    return (
      <div className={`${styles.container}`} data-tid="container">
        <form onSubmit={this.handleSubmit}>
          <div className="form-group">
            <strong>Node Project:&nbsp;</strong>
            <span>{service.projectDir}</span>
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
          {docker.map(task => (
            <DockerServiceCreate
              key={task.id}
              service={service}
              task={task}
              saveTask={this.saveTask}
              addTask={this.addTask}
            />
          ))}
          <div className="form-actions">
            <button type="submit" className="btn btn-form btn-primary">
              Save
            </button>
            <button
              type="button"
              onClick={this.handleDelete}
              className="btn btn-form btn-negative"
            >
              Delete
            </button>
          </div>
        </form>
      </div>
    );
  }
}
