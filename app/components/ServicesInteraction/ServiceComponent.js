// @flow
import { ipcRenderer } from 'electron';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { groupBy } from 'rambda';
import routes from '../../constants/routes';
import { ServiceType } from '../../types/service';
import { TaskType } from '../../types/task';
import styles from './ServiceComponent.css';
import EditorTask from './Tasks/EditorTask';
import DockerTask from './Tasks/DockerTask';
import NpmScriptTask from './Tasks/NpmScriptTask';

type Props = {
  service: ServiceType
};

export default class ServiceComponent extends Component<Props> {
  props: Props;

  groupByTasks = groupBy(task => task.type);

  invokeTask = (taskName: string, task: TaskType) => {
    const { service } = this.props;
    console.log(`Running task`, { taskName, task, service });
    ipcRenderer.send('Task', service, taskName, task);
  };

  render() {
    const { service } = this.props;
    const { tasks } = service;
    const groupedTasks = this.groupByTasks(tasks);
    const editor = groupedTasks.editor || [];
    const npmscript = groupedTasks.npmscript || [];
    const docker = groupedTasks.docker || [];

    return (
      <section className={`${styles.container}`} data-tid="container">
        <header className="title">
          <h1>{service.name}</h1>
          <div className="btn-group pull-right">
            <Link
              to={`${routes.SERVICES}/${service.id}`}
              className="btn btn-mini btn-default"
            >
              <span className="icon icon-cog" />
            </Link>
            <button type="button" className="btn btn-mini btn-default">
              <span className="icon icon-bookmark" />
            </button>
          </div>
          <div style={{ clear: 'both' }} />
        </header>
        <div>
          {editor.map(task => (
            <EditorTask
              key={task.id}
              task={task}
              invokeTask={this.invokeTask}
            />
          ))}
          {docker.map(task => (
            <DockerTask
              key={task.id}
              task={task}
              invokeTask={this.invokeTask}
            />
          ))}
          {npmscript.map(task => (
            <NpmScriptTask
              key={task.id}
              task={task}
              invokeTask={this.invokeTask}
            />
          ))}
        </div>
      </section>
    );
  }
}
