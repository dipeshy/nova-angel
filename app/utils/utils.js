import rimraf from 'rimraf';
import { mkdir } from 'fs';
import { BrowserWindow } from 'electron';

const VERSION = '0.0.1';

export const version = () => VERSION;

export function cleanAndCreateDir(targetDir, cb = () => {}) {
    deleteDir(targetDir, err => {
        if (err) {
            cb(err);
            return;
        }

        console.log(`Cleaned dir: ${targetDir}`);

        mkdir(targetDir, mkdirErr => {
            if (err) {
                console.log(
                    `Error creating dir: ${targetDir}`,
                    mkdirErr.message,
                    mkdirErr.stack
                );
                cb(mkdirErr);
                return;
            }

            console.log(`Successfully cleaned and created dir: ${targetDir}`);
            cb(null, targetDir);
        });
    });
}

export function deleteDir(target, cb = () => {}) {
    rimraf(target, err => {
        if (err) {
            cb(err);
            return;
        }

        cb(null);
    });
}

export function createWindowWithHtml(title, html) {
    // Create the browser window.
    const window = new BrowserWindow({
        opacity: 0.95,
        darkTheme: true,
        show: false
    });

    window.once('ready-to-show', () => {
        window.maximize();
        window.show();
        window.setTitle(title);
        // For debugging production
        // window.webContents.openDevTools();
    });

    console.log('Loading html file', html);
    window.loadURL(html);
    return window;
}

export function getClassname(...args) {
    return args.join(' ');
}

export function parseEnvvarList(list: string[]): { [key: string]: string } {
    const envvars = {};
    list.forEach((envvarstr: string) => {
        const [key, value] = envvarstr.split('=');
        if (!(key && value)) {
            console.error(`Invalid envvar ${envvarstr}`);
            return;
        }

        envvars[key] = value;
    });
    return envvars;
}
