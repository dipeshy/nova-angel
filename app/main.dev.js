/* eslint global-require: 0, flowtype-errors/show-errors: 0 */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import { app, BrowserWindow, ipcMain } from 'electron';
import MenuBuilder from './menu';
import createTaskRunner from './utils/task-runner';

global.runningTasks = {};
// const childProcess = require('child_process');
// childProcess.spawn('/usr/local/bin/code', ['/Users/yadavdip/Projects/aws']);

// If a relative path, it's relative to the default cwd. ~/Library/Application Support/App Name/unicorn.
process.env.CWD = process.env.CWD || app.getPath('userData');
console.log('Current working directory', process.env.CWD);

process.env.PATH = [process.env.PATH, '/usr/local/bin', '~/.yarn/bin'].join(
    ':'
);

let mainWindow = null;
const { stopAllTasks, taskRunner } = createTaskRunner(
    process.env.CWD,
    (eventName, ...args) => {
        if (mainWindow) {
            mainWindow.webContents.send(eventName, ...args);
        }
    },
    `file://${__dirname}/console.html`
);

if (process.env.NODE_ENV === 'production') {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
}

if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
) {
    require('electron-debug')();
    const path = require('path');
    const p = path.join(__dirname, '..', 'app', 'node_modules');
    require('module').globalPaths.push(p);
}

const installExtensions = async () => {
    const installer = require('electron-devtools-installer');
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

    return Promise.all(
        extensions.map(name =>
            installer.default(installer[name], forceDownload)
        )
    ).catch(console.log);
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('ready', async () => {
    if (
        process.env.NODE_ENV === 'development' ||
        process.env.DEBUG_PROD === 'true'
    ) {
        await installExtensions();
    }

    mainWindow = new BrowserWindow({
        show: false,
        width: 1024,
        height: 728
    });

    mainWindow.loadURL(`file://${__dirname}/app.html`);

    // @TODO: Use 'ready-to-show' event
    //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
    mainWindow.webContents.on('did-finish-load', () => {
        if (!mainWindow) {
            throw new Error('"mainWindow" is not defined');
        }
        // Debugging production
        // mainWindow.webContents.openDevTools();
        if (process.env.START_MINIMIZED) {
            mainWindow.minimize();
        } else {
            mainWindow.show();
            mainWindow.focus();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    const menuBuilder = new MenuBuilder(mainWindow);
    menuBuilder.buildMenu();
});

app.on('will-quit', () => {
    stopAllTasks();
});

ipcMain.on('Task', (event, serviceContext, taskName, params) => {
    try {
        taskRunner(serviceContext, taskName, params);
    } catch (err) {
        const message = `Error running task ${taskName}`;
        const details = {
            taskName,
            params,
            err
        };
        console.error(message, details);
        mainWindow.webContents.send('error', message, details);
    }
});

process.on('SIGTERM', (...args) => {
    console.log('signal', ...args);
    stopAllTasks();
});
process.once('SIGUSR2', () => {
    stopAllTasks(() => {
        console.log('Stopping all tasks');
        process.kill(process.pid, 'SIGUSR2');
    });
});
