// @flow
import { ipcRenderer } from 'electron';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { groupBy } from 'ramda';
import routes from '../../constants/routes';
import { ServiceType } from '../../types/service';
import { TaskType } from '../../types/task';
import styles from './ServiceComponent.css';
import EditorTask from './Tasks/EditorTask';
import DockerTask from './Tasks/DockerTask';
import NpmScriptTask from './Tasks/NpmScriptTask';

type Props = {
    service: ServiceType,
    taskStates: { [key: string]: boolean }
};

export default class ServiceComponent extends Component<Props> {
    props: Props;

    groupByTasks = groupBy(task => task.type);

    invokeTask = (taskName: string, task: TaskType) => {
        const { service } = this.props;
        ipcRenderer.send('Task', service, taskName, task);
    };

    render() {
        const { service, taskStates } = this.props;
        const { tasks } = service;
        const groupedTasks = this.groupByTasks(tasks);
        const editorTask = groupedTasks.editor ? groupedTasks.editor[0] : null;
        const npmscript = groupedTasks.npmscript || [];
        const docker = groupedTasks.docker || [];

        return (
            <section className={`${styles.container}`} data-tid="container">
                <header className="title">
                    <h1 className="pull-left">{service.name}</h1>
                    <div className="btn-group pull-right">
                        {editorTask !== null && (
                            <EditorTask
                                key={editorTask.id}
                                task={editorTask}
                                invokeTask={this.invokeTask}
                            />
                        )}
                        <Link
                            to={`${routes.SERVICES}/${service.id}`}
                            className="btn btn-mini btn-default"
                        >
                            <span className="icon icon-cog" />
                        </Link>
                    </div>
                    <div style={{ clear: 'both' }} />
                </header>
                <div>
                    {docker.map(task => (
                        <DockerTask
                            key={task.id}
                            task={task}
                            invokeTask={this.invokeTask}
                            active={!!taskStates[task.id]}
                        />
                    ))}
                    {npmscript.map(task => (
                        <NpmScriptTask
                            key={task.id}
                            task={task}
                            invokeTask={this.invokeTask}
                            active={!!taskStates[task.id]}
                        />
                    ))}
                </div>
            </section>
        );
    }
}
