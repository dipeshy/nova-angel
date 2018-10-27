const { spawn } = require('child_process');

export default function runCommand(command, args, options) {
  try {
    const child = spawn(command, args, options || {});
    console.log(`${command}  ${args.join(' ')}`, child.pid);
    child.stdout.on('data', data => {
      const response = data.toString().trim();
      if (response) {
        console.log(`STDOUT:${response}`);
      }
    });
    child.stderr.on('data', data => {
      const response = data.toString().trim();
      if (response) {
        console.log(`STDERR:${response}`);
      }
    });
    // stdio is closed
    child.on('close', () => console.log(child.pid, 'process closed'));
    // Parent closes
    child.on('disconnect', () => console.log(child.pid, 'process disconnect'));
    child.on('exit', (code, signal) =>
      console.log(
        child.pid,
        code,
        signal,
        `process exit with code: ${code}, signal: ${signal}`
      )
    );
    child.on('error', err => {
      console.log('Error opening process', err);
    });
    return child;
  } catch (err) {
    console.log('Error', err);
  }
}
