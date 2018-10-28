import rimraf from 'rimraf';
import { mkdir } from 'fs';
import { BrowserWindow } from 'electron';

const VERSION = '0.0.1';

export const version = () => VERSION;

export function cleanAndCreateDir(targetDir) {
  rimraf(targetDir, () => {
    console.log(`Cleaned dir: ${targetDir}`);
    mkdir(targetDir, err => {
      if (err) {
        console.log(`Error creating dir: ${targetDir}`, err.message, err.stack);
        return;
      }

      console.log(`Successfully cleaned and created dir: ${targetDir}`);
    });
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
  });

  window.loadFile(html);
  return window;
}

export function getClassname(...args) {
  return args.join(' ');
}
