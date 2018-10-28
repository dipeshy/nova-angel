// @flow
import React, { Component } from 'react';
import styles from './DockerServiceCreate.css';
import { ServiceType } from '../../types/service';
import { TaskType, DockerTaskType } from '../../types/task';

type Props = {
  service: ServiceType,
  saveTask: (task: TaskType) => void
};

export default class DockerServiceCreate extends Component<Props> {
  props: Props;

  state: {
    task: DockerTaskType
  };

  constructor(props) {
    super(props);
    const { service } = this.props;

    this.state = {
      dirty: false,
      currentport: '',
      currentvolume: '',
      currentenv: '',
      task: {
        id: `${service.id}:docker`,
        name: service.name,
        type: 'docker',
        image: '',
        container_name: service.name,
        ports: [],
        volumes: [],
        args: {},
        env: []
      }
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
    this.updateStateTask(name, value);
  };

  transferValueToTask = (fromStateKey: string, toTaskKey: string) => () => {
    const { state } = this;
    this.updateStateTask(toTaskKey, state[fromStateKey]);
    this.setState({
      [fromStateKey]: ''
    });
  };

  handleAddPort = this.transferValueToTask('currentport', 'ports');

  handleAddVolume = this.transferValueToTask('currentvolume', 'volumes');

  handleAddEnv = this.transferValueToTask('currentenv', 'env');

  updateStateTask = (field, value) => {
    this.setState(state => {
      const { task } = state;
      if (Array.isArray(task[field])) {
        task[field] = [...task[field], value];
      } else {
        task[field] = value;
      }
      return {
        dirty: true,
        task
      };
    });
  };

  handleSaveTask = () => {
    const { saveTask } = this.props;
    const { task } = this.state;
    saveTask(task);
    this.setState({
      dirty: false
    });
  };

  render() {
    const { task, currentport, currentvolume, currentenv, dirty } = this.state;
    return (
      <div className={`${styles.container}`}>
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
          {task.ports.map(p => (
            <div key={p}>{p}</div>
          ))}
          <input
            name="currentport"
            type="text"
            value={currentport}
            onChange={this.handleInputChange}
            style={{
              display: 'block',
              width: '80%'
            }}
            className="form-control pull-left"
            placeholder="8080:8080"
          />
          <button
            onClick={this.handleAddPort}
            type="button"
            className="btn btn-large btn-default pull-right"
          >
            <span className="icon icon-plus" />
            &nbsp;Add
          </button>
          <div className="clearfix" />
        </div>
        <div className="form-group">
          <label>ENV Variables</label>
          {task.env.map(x => (
            <div key={x}>{x}</div>
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
            placeholder="PORT=4000"
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
          {task.volumes.map(p => (
            <div key={p}>{p}</div>
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
        <div className="form-actions">
          {dirty && (
            <button
              type="button"
              onClick={this.handleSaveTask}
              className="btn btn-mini btn-positive"
            >
              Save
            </button>
          )}
        </div>
      </div>
    );
  }
}
