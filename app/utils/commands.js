const childProcess = require('child_process');

export default function runCommand(command, args, options) {
    const child = childProcess.spawn(command, args, options || {});
    console.log(
        `runCommand: pid: ${child.pid}, cmd: ${command} ${args.join(' ')}`
    );
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
            'runCommand: Process exiting',
            JSON.stringify({
                pid: child.pid,
                code,
                signal
            })
        )
    );
    child.on('error', err => {
        console.log('runCommand: Error opening process', err);
    });
    return child;
}
