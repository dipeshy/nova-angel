import { ChildProcess } from 'child_process';
import { resolve as pathResolve } from 'path';
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
import { deleteDir, cleanAndCreateDir, parseEnvvarList } from './utils';

let LOGS_PATH: string;
let sendEvent;

const debug = (...args) => {
    sendEvent('message', ...args);
};
const NPMSCRIPT_BIN = 'yarn';
const CODE_BIN = 'code';
const DOCKER_BIN = 'docker';

export default function createTaskRunner(cwd, _sendEvent) {
    LOGS_PATH = pathResolve(cwd, 'logs');
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
                process.kill(-taskProcess.pid, 'SIGTERM');
            }
        });
        if (cb) cb();
    }
}

function openEditor(serviceContext: ServiceType, task: EditorTaskType) {
    const taskProcess = runCommand(CODE_BIN, [task.projectDir], {
        cwd: serviceContext.projectDir,
        env: {
            ...process.env,
            CWD: serviceContext.projectDir
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
    return parse(
        task.cmd.replace(/(np(m|x)\s+(run)?|yarn)/g, ''),
        NPMSCRIPT_BIN
    );

    function parse(cmdString, cmd) {
        const chained = cmdString.split('&&').map(x => parsePipes(x, cmd));
        return ['AND', ...chained];
    }

    function parsePipes(cmdString, cmd) {
        const piped = cmdString.split('|').map(x => {
            const args = x
                .trim()
                .replace(/\s+/g, '::')
                .split('::');

            const [maybeCmd, ...restArgs] = args;
            if (maybeCmd === 'docker') {
                return {
                    cmd: maybeCmd,
                    args: restArgs
                };
            }
            return {
                cmd,
                args
            };
        });
        return piped.length > 1 ? ['PIPE', ...piped] : piped[0];
    }
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

    return [
        'AND',
        {
            cmd,
            args
        }
    ];
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

    if (taskData.taskProcess) {
        sendEvent('taskstates', 'start', task);
        return;
    }

    debug(`Task running ${JSON.stringify(cmdDescription)}`);

    runChain(serviceContext, cmdDescription);
    sendEvent('taskstates', 'start', task);

    taskData.consoleAppNS = serviceContext.name;
    // Enable console for app by default
    taskData.consoleAppEnabled = true;

    /* eslint-disable */
    async function runChain(context: ServiceType, cmds) {
        const [operator, ..._cmds] = cmds;
        for (let i = 0; i < _cmds.length; i += 1) {
            const cmd = _cmds[i];
            try {
                await runAndWait(context, cmd);
            } catch (err) {
                console.log('Failed to run command', {
                    cmd,
                    err
                });
            }
        }

        sendEvent('taskstates', 'stop', task);
    }
    /* eslint-enable */
    async function runAndWait(context: ServiceType, cmd) {
        // PIPED commands
        if (Array.isArray(cmd)) {
            const [operator, ...cmds] = cmd;
            if (operator !== 'PIPE') {
                throw new Error(`Unknown operator ${operator}`);
            }
            const childs = [];
            cmds.forEach((_cmd, idx) => {
                const curPS: ChildProcess = runTaskProcess(context, _cmd);
                const prevPS: ChildProcess | null =
                    idx >= 1 ? childs[idx - 1] : null;
                if (prevPS) {
                    prevPS.stdout.pipe(curPS.stdin);
                    prevPS.stderr.pipe(curPS.stdin);
                }
                childs.push(curPS);
            });
            const [main, ...pipeProcesses] = childs;
            taskData.taskProcess = main;
            attachConsoleLogView(
                pipeProcesses[pipeProcesses.length - 1],
                task.id
            );
            await waitTillclosed(main);
            // End all pipe processes
            pipeProcesses.forEach((_ps: ChildProcess) => {
                process.kill(_ps.pid, 'SIGTERM');
            });
        } else {
            taskData.taskProcess = runTaskProcess(context, cmd);
            attachConsoleLogView(taskData.taskProcess, task.id);
            await waitTillclosed(taskData.taskProcess);
        }

        debug(
            'Task terminating',
            JSON.stringify({
                pid: taskData.taskProcess.pid
            })
        );
        taskData.taskProcess = null;
        handleTaskExit(task);
    }
}

function waitTillclosed(taskProcess) {
    return new Promise((resolve, reject) => {
        taskProcess.on('close', () => {
            resolve('close');
        });
        taskProcess.on('error', () => {
            reject(new Error('error'));
        });
    });
}
function runTaskProcess(serviceContext: ServiceType, cmdDesc) {
    const { cmd, args } = cmdDesc;
    let env = {};
    if (serviceContext.envvars) {
        env = {
            ...env,
            ...parseEnvvarList(serviceContext.envvars)
        };
    }
    // Add path manually so executables in /bin are available
    env.PATH = process.env.PATH;

    const taskProcess = runCommand(cmd, args, {
        cwd: serviceContext.projectDir,
        detached: true,
        env
    });
    taskProcess.unref();
    return taskProcess;
}

function taskStop(serviceContext: ServiceType, task: TaskType) {
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

function attachConsoleLogView(taskProcess, taskId: string) {
    const taskData = (global.runningTasks[taskId] =
        global.runningTasks[taskId] || {});

    taskData.logFile = pathResolve(
        LOGS_PATH,
        `${taskId.replace(':', '-')}-${taskProcess.pid}`
    );
    taskData.logstream = createWriteStream(taskData.logFile);
    taskData.logstream.on('close', () => {
        debug(`Closing log stream: ${taskData.logFile}`);
    });

    const outputWriter = createOutputWriter(taskId);
    taskProcess.stdout.on('data', outputWriter);
    taskProcess.stderr.on('data', outputWriter);
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
