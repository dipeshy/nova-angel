import { resolve } from 'path';
import { createWriteStream, readFileSync } from 'fs';
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
import { deleteDir, cleanAndCreateDir, createWindowWithHtml } from './utils';

let LOGS_PATH: string;
let debug;

const NPMSCRIPT_BIN = 'yarn';
const CODE_BIN = 'code';
const DOCKER_BIN = 'docker';

export default function createTaskRunner(cwd, logger, consoleHtml) {
    LOGS_PATH = resolve(cwd, 'logs');
    debug = logger;
    cleanAndCreateDir(LOGS_PATH);

    return function taskRunner(
        serviceContext: ServiceType,
        taskName,
        task: TaskType
    ) {
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
                createOpenConsole(task, consoleHtml);
                break;
            case NPMSCRIPT_STOP:
                taskStop(serviceContext, task);
                break;
            case NPMSCRIPT_VIEWLOG:
                createOpenConsole(task, consoleHtml);
                break;
            case DOCKER_START:
                taskStart(
                    serviceContext,
                    task,
                    parseDockerCommand(serviceContext, task)
                );
                createOpenConsole(task, consoleHtml);
                break;
            case DOCKER_STOP:
                taskStop(serviceContext, task);
                break;
            case DOCKER_VIEWLOG:
                createOpenConsole(task, consoleHtml);
                break;
            default:
                debug('Unknown task', { taskName, task });
        }
    };
}

function openEditor(serviceContext: ServiceType, task: EditorTaskType) {
    const process = runCommand(CODE_BIN, [task.projectDir]);
    process.on('close', () =>
        debug(`openEditor closed: ${serviceContext.name}`)
    );
    process.on('exit', () => debug(`openEditor exit: ${serviceContext.name}`));
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
// Mutates taskData
function taskStart(
    serviceContext: ServiceType,
    task: TaskType,
    cmdDescription
) {
    const taskData = (global.runningTasks[task.id] =
        global.runningTasks[task.id] || {});
    const { cmd, args } = cmdDescription;
    debug(`Task running ${cmd} ${args.join(' ')}`);

    if (!taskData.process) {
        taskData.process = runCommand(cmd, args, {
            cwd: serviceContext.projectDir
        });

        taskData.process.on('close', () => {
            debug(
                'Task terminating',
                JSON.stringify({
                    pid: taskData.process.pid,
                    task
                })
            );
            handleTaskExit(task);
            taskData.process = null;
        });

        // Mutates taskData
        attachConsoleLogView(taskData.process, task.id);
    }
}

function taskStop(serviceContext, task: TaskType) {
    const { process } = global.runningTasks[task.id];
    if (process) {
        console.log(`Sending SIGTERM to process ${process.pid}`);
        process.kill('SIGTERM');
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

    if (taskData.consoleWindow) {
        taskData.consoleWindow.focus();
        taskData.consoleWindow.webContents.send(
            'console:log',
            'You can close the window. Auto closing in 5 sec'
        );
        setTimeout(() => {
            if (taskData.consoleWindow) {
                taskData.consoleWindow.close();
            }
        }, 5000);
    }
}

function createOpenConsole(task: TaskType, consoleHtml: string) {
    const taskData = (global.runningTasks[task.id] =
        global.runningTasks[task.id] || {});

    if (taskData.consoleWindow) {
        taskData.consoleWindow.focus();
        return;
    }
    // ==============================
    // Create consoleWindow if closed
    // ==============================
    const consoleWindow = createWindowWithHtml(
        `Console: ${task.name}`,
        consoleHtml
    );
    consoleWindow.once('ready-to-show', () => {
        consoleWindow.show();
        // load previous logs
        const previousLogs = readFileSync(taskData.logFile, {
            encoding: 'utf8'
        });
        consoleWindow.webContents.send('console:log', previousLogs);

        // Set consoleWindow instance in main task list
        taskData.consoleWindow = consoleWindow;
    });
    // Emitted when the window is closed.
    consoleWindow.on('closed', () => {
        taskData.consoleWindow = null;
    });
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
        if (taskData.logstream) {
            taskData.logstream.write(data);
        }

        if (taskData.consoleWindow) {
            const response = data.toString().trim();
            taskData.consoleWindow.webContents.send('console:log', response);
        }
    };
}
