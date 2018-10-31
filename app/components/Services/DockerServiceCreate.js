// @flow
import React, { Component } from 'react';
import styles from './DockerServiceCreate.css';
import { TaskType, DockerTaskType } from '../../types/task';

type Props = {
  saveTask: (task: TaskType) => void,
  task: DockerTaskType | undefined
};

export default class DockerServiceCreate extends Component<Props> {
  props: Props;

  state: {
    task: DockerTaskType
  };

  constructor(props) {
    super(props);

    this.state = {
      currentport: '',
      currentvolume: '',
      currentenv: ''
    };
  }

  handleInputChange = event => {
    const { name, value } = event.target;
    this.setState({
      [name]: value
    });
  };

  handleChange = event => {
    const { name, value } = event.target;
    this.updateTask(name, value);
  };

  transferValueToTask = (fromStateKey: string, toTaskKey: string) => () => {
    const { state } = this;
    const value = state[fromStateKey].trim();
    if (!value) {
      return;
    }
    this.updateTask(toTaskKey, value);
    // Clear temp input field
    this.setState({
      [fromStateKey]: ''
    });
  };

  handleAddPort = this.transferValueToTask('currentport', 'ports');

  handleAddVolume = this.transferValueToTask('currentvolume', 'volumes');

  handleAddEnv = this.transferValueToTask('currentenv', 'env');

  removeMatchingValueFromList = (field: string, value: string) => {
    const task = this.getTask();
    const { saveTask } = this.props;
    task[field] = task[field].filter(t => t !== value);
    saveTask(task);
  };

  updateTask = (field, value) => {
    const task = this.getTask();
    const { saveTask } = this.props;
    if (Array.isArray(task[field])) {
      task[field] = [...task[field], value];
    } else {
      task[field] = value;
    }

    // Update also name field for container to match container_name
    if (field === 'name') {
      task.container_name = value.replace(/\s/, '_');
    }
    saveTask(task);
  };

  getTask = (): DockerTaskType => {
    const { task } = this.props;
    if (task) {
      return task;
    }

    return {
      id: '',
      name: '',
      type: 'docker',
      image: '',
      container_name: '',
      ports: [],
      volumes: [],
      args: {},
      env: []
    };
  };

  render() {
    const { currentport, currentvolume, currentenv } = this.state;
    const task: DockerTaskType = this.getTask();
    return (
      <div className={`${styles.container}`}>
        <div className="form-group">
          <label htmlFor="docker-name">Name</label>
          <input
            id="docker-name"
            name="name"
            type="text"
            value={task.name}
            onChange={this.handleChange}
            className="form-control"
            placeholder="Docker Container Name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="image">Image</label>
          <input
            name="image"
            type="text"
            value={task.image}
            onChange={this.handleChange}
            className="form-control"
            placeholder="Docker image"
          />
        </div>
        <div className="form-group">
          <label>Ports</label>
          {task.ports.map(x => (
            // Display selected ports
            <div key={x}>
              <span
                onClick={() => this.removeMatchingValueFromList('ports', x)}
                role="presentation"
                className="icon icon-minus-circled"
                style={{
                  cursor: 'pointer',
                  color: '#fb2f29'
                }}
              />
              <span>
                &nbsp;
                {x}
              </span>
            </div>
          ))}
          <input
            name="currentport"
            type="text"
            value={currentport}
            onChange={this.handleInputChange}
            style={{
              display: 'block',
              width: '100px'
            }}
            className="form-control pull-left"
            placeholder="8080:8080"
          />
          <button
            onClick={this.handleAddPort}
            type="button"
            className="btn btn-large btn-default pull-left"
          >
            <span className="icon icon-plus" />
            &nbsp;Add
          </button>
          <div className="clearfix" />
        </div>
        <div className="form-group">
          <label>ENV Variables</label>
          {task.env.map(x => (
            // Display selected env variables
            <div key={x}>
              <span
                onClick={() => this.removeMatchingValueFromList('env', x)}
                role="presentation"
                className="icon icon-minus-circled"
                style={{
                  cursor: 'pointer',
                  color: '#fb2f29'
                }}
              />
              <span>
                &nbsp;
                {x}
              </span>
            </div>
          ))}
          <input
            name="currentenv"
            type="text"
            value={currentenv}
            onChange={this.handleInputChange}
            style={{
              display: 'block',
              width: '80%'
            }}
            className="form-control pull-left"
            placeholder="NODE_ENV=production"
          />
          <button
            onClick={this.handleAddEnv}
            type="button"
            className="btn btn-large btn-default pull-right"
          >
            <span className="icon icon-plus" />
            &nbsp;Add
          </button>
          <div className="clearfix" />
        </div>
        <div className="form-group">
          <label>Volumes</label>
          {task.volumes.map(x => (
            // Display selected env variables
            <div key={x}>
              <span
                onClick={() => this.removeMatchingValueFromList('volumes', x)}
                role="presentation"
                className="icon icon-minus-circled"
                style={{
                  cursor: 'pointer',
                  color: '#fb2f29'
                }}
              />
              <span>
                &nbsp;
                {x}
              </span>
            </div>
          ))}
          <input
            name="currentvolume"
            type="text"
            value={currentvolume}
            onChange={this.handleInputChange}
            style={{
              display: 'block',
              width: '80%'
            }}
            className="form-control pull-left"
            placeholder="~/postgresqldata:/var/lib/postgresql/data"
          />
          <button
            onClick={this.handleAddVolume}
            type="button"
            className="btn btn-large btn-default pull-right"
          >
            <span className="icon icon-plus" />
            &nbsp;Add
          </button>
          <div className="clearfix" />
        </div>
      </div>
    );
  }
}
