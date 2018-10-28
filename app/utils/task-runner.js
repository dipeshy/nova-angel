import { resolve } from 'path';
import { createWriteStream, readFileSync } from 'fs';
import runCommand from './commands';
import {
  EDITOR_OPEN,
  NPMSCRIPT_START,
  NPMSCRIPT_STOP,
  NPMSCRIPT_VIEWLOG
} from '../constants/tasks-constants';
import { TaskType, NpmTaskType, EditorTaskType } from '../types/task';
import { ServiceType } from '../types/service';
import { deleteDir, cleanAndCreateDir, createWindowWithHtml } from './utils';

const runningTasks = {};
let LOGS_PATH: string;
let debug;

export default function createTaskRunner(cwd, logger) {
  LOGS_PATH = resolve(cwd, 'logs');
  debug = logger;
  cleanAndCreateDir(LOGS_PATH);

  return function taskRunner(
    serviceContext: ServiceType,
    taskName,
    task: TaskType
  ) {
    debug(
      `Received Task: ${taskName} (${serviceContext.name}:${
        serviceContext.id
      })`,
      JSON.stringify({ task })
    );
    switch (taskName) {
      case EDITOR_OPEN:
        openEditor(serviceContext, task);
        break;
      case NPMSCRIPT_START:
        npmscriptStart(serviceContext, task);
        createOpenConsole(task);
        break;
      case NPMSCRIPT_STOP:
        npmscriptStop(serviceContext, task);
        break;
      case NPMSCRIPT_VIEWLOG:
        createOpenConsole(task);
        break;
      default:
        debug('Unknown task', { taskName, task });
    }
  };
}

function openEditor(serviceContext: ServiceType, task: EditorTaskType) {
  const process = runCommand('code', [task.projectDir]);
  process.on('close', () => debug(`openEditor closed: ${serviceContext.name}`));
  process.on('exit', () => debug(`openEditor exit: ${serviceContext.name}`));
}

// Mutates taskData
function npmscriptStart(serviceContext: ServiceType, task: NpmTaskType) {
  const taskData = (runningTasks[task.id] = runningTasks[task.id] || {});

  if (!taskData.process) {
    taskData.process = runCommand('yarn', task.cmd.split(' '), {
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

function npmscriptStop(serviceContext, task: TaskType) {
  runningTasks[task.id].process.kill('SIGTERM');
}

function handleTaskExit(task) {
  const taskData = (runningTasks[task.id] = runningTasks[task.id] || {});
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

function createOpenConsole(task: NpmTaskType) {
  const taskData = (runningTasks[task.id] = runningTasks[task.id] || {});

  if (taskData.consoleWindow) {
    taskData.consoleWindow.focus();
    return;
  }
  // ==============================
  // Create consoleWindow if closed
  // ==============================
  const consoleWindow = createWindowWithHtml(
    `Console: ${task.name}`,
    resolve(__dirname, 'ui', 'console.html')
  );
  consoleWindow.once('ready-to-show', () => {
    consoleWindow.show();
    // load previous logs
    const previousLogs = readFileSync(taskData.logFile, { encoding: 'utf8' });
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
  const taskData = (runningTasks[taskId] = runningTasks[taskId] || {});

  taskData.logFile = resolve(LOGS_PATH, taskId);
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
    const taskData = (runningTasks[taskId] = runningTasks[taskId] || {});
    if (taskData.logstream) {
      taskData.logstream.write(data);
    }

    if (taskData.consoleWindow) {
      const response = data.toString().trim();
      taskData.consoleWindow.webContents.send('console:log', response);
    }
  };
}
