import { resolve } from 'path';
import { createWriteStream } from 'fs';
import runCommand from './commands';
import {
    EDITOR_OPEN,
    NPMSCRIPT_START,
    NPMSCRIPT_STOP,
    NPMSCRIPT_VIEWLOG,
    DOCKER_START,
    DOCKER_STOP,
    DOCKER_VIEWLOG
} from '../constants/tasks-constants';
import {
    TaskType,
    NpmTaskType,
    EditorTaskType,
    DockerTaskType
} from '../types/task';
import { ServiceType } from '../types/service';
import { deleteDir, cleanAndCreateDir } from './utils';

let LOGS_PATH: string;
let sendEvent;

const debug = (...args) => {
    sendEvent('message', ...args);
};
const NPMSCRIPT_BIN = 'yarn';
const CODE_BIN = 'code';
const DOCKER_BIN = 'docker';

export default function createTaskRunner(cwd, _sendEvent) {
    LOGS_PATH = resolve(cwd, 'logs');
    sendEvent = _sendEvent;
    cleanAndCreateDir(LOGS_PATH);

    return {
        taskRunner,
        stopAllTasks
    };
    function taskRunner(serviceContext: ServiceType, taskName, task: TaskType) {
        debug(
            `Running Task: ${taskName} (${serviceContext.name}: ${
                serviceContext.id
            })`,
            JSON.stringify({ task, NPMSCRIPT_BIN, CODE_BIN })
        );
        switch (taskName) {
            case EDITOR_OPEN:
                openEditor(serviceContext, task);
                break;
            case NPMSCRIPT_START:
                taskStart(
                    serviceContext,
                    task,
                    parseNpmCommand(serviceContext, task)
                );
                break;
            case NPMSCRIPT_STOP:
                taskStop(serviceContext, task);
                break;
            case NPMSCRIPT_VIEWLOG:
                break;
            case DOCKER_START:
                taskStart(
                    serviceContext,
                    task,
                    parseDockerCommand(serviceContext, task)
                );
                break;
            case DOCKER_STOP:
                taskStop(serviceContext, task);
                break;
            case DOCKER_VIEWLOG:
                break;
            default:
                debug('Unknown task', { taskName, task });
        }
    }

    function stopAllTasks(cb) {
        console.log('Stopping all tasks');
        Object.keys(global.runningTasks).forEach(taskId => {
            const { taskProcess } = global.runningTasks[taskId];
            if (taskProcess) {
                console.log(`KILL SIGTERM process group ${-process.pid}`);
                process.kill(taskProcess.pid, 'SIGTERM');
            }
        });
        if (cb) cb();
    }
}

function openEditor(serviceContext: ServiceType, task: EditorTaskType) {
    const taskProcess = runCommand(CODE_BIN, [task.projectDir], {
        env: {
            PATH: process.env.PATH
        }
    });
    taskProcess.on('close', () =>
        debug(`openEditor closed: ${serviceContext.name}`)
    );
    taskProcess.on('exit', () =>
        debug(`openEditor exit: ${serviceContext.name}`)
    );
}

function parseNpmCommand(serviceContext: ServiceType, task: NpmTaskType) {
    return {
        cmd: NPMSCRIPT_BIN,
        args: task.cmd.split(' ')
    };
}

function parseDockerCommand(serviceContext: ServiceType, task: DockerTaskType) {
    const cmd = DOCKER_BIN;
    const args = [];

    args.push('run');
    args.push('--rm');
    // Uncomment for interactive termial
    // args.push('-it');
    args.push('--name');
    args.push(`${task.container_name}-${serviceContext.id}`);
    task.ports.forEach(port => {
        args.push('-p');
        args.push(port);
    });

    task.env.forEach(singleEnv => {
        args.push('-e');
        args.push(singleEnv);
    });

    task.volumes.forEach(volume => {
        args.push('-v');
        args.push(volume);
    });

    args.push(task.image);

    return {
        cmd,
        args
    };
}

/**
 * Mutates taskData
 *
 * @param {*} serviceContext
 * @param {*} task
 * @param {*} cmdDescription
 */
function taskStart(
    serviceContext: ServiceType,
    task: TaskType,
    cmdDescription
) {
    const taskData = (global.runningTasks[task.id] =
        global.runningTasks[task.id] || {});
    const { cmd, args } = cmdDescription;
    debug(`Task running ${cmd} ${args.join(' ')}`);

    if (!taskData.taskProcess) {
        taskData.taskProcess = runCommand(cmd, args, {
            cwd: serviceContext.projectDir,
            detached: true,
            env: {
                PATH: process.env.PATH
            }
        });
        taskData.taskProcess.unref();

        taskData.taskProcess.on('close', () => {
            debug(
                'Task terminating',
                JSON.stringify({
                    pid: taskData.taskProcess.pid,
                    task
                })
            );
            handleTaskExit(task);
            taskData.taskProcess = null;
        });

        // Enable console for app by default
        taskData.consoleAppEnabled = true;
        taskData.consoleAppNS = serviceContext.name;
        attachConsoleLogView(taskData.taskProcess, task.id);
    }
}

function taskStop(serviceContext, task: TaskType) {
    const { taskProcess } = global.runningTasks[task.id];
    if (taskProcess) {
        console.log(`Sending SIGTERM to process group ${-taskProcess.pid}`);
        process.kill(-taskProcess.pid, 'SIGTERM');
    }
}

function handleTaskExit(task) {
    const taskData = (global.runningTasks[task.id] =
        global.runningTasks[task.id] || {});
    if (taskData.logstream) {
        taskData.logstream.end();
        taskData.logstream = null;
        deleteDir(taskData.logFile);
    }

    sendEvent(
        'consolewindow:log',
        task.id,
        taskData.consoleAppNS,
        'Closing...'
    );
}

function attachConsoleLogView(process, taskId: string) {
    const taskData = (global.runningTasks[taskId] =
        global.runningTasks[taskId] || {});

    taskData.logFile = resolve(
        LOGS_PATH,
        `${taskId.replace(':', '-')}-${process.pid}`
    );
    taskData.logstream = createWriteStream(taskData.logFile);
    taskData.logstream.on('close', () => {
        debug(`Closing log stream: ${taskData.logFile}`);
    });

    const outputWriter = createOutputWriter(taskId);
    process.stdout.on('data', outputWriter);
    process.stderr.on('data', outputWriter);
}

function createOutputWriter(taskId) {
    return data => {
        const taskData = (global.runningTasks[taskId] =
            global.runningTasks[taskId] || {});

        // Write to log file for preserving log
        if (taskData.logstream) {
            taskData.logstream.write(data);
        }
        // Send output to app via event if enabled
        if (taskData.consoleAppEnabled) {
            sendEvent(
                'consolewindow:log',
                taskId,
                taskData.consoleAppNS,
                data.toString().trim()
            );
        }
    };
}
