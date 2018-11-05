import { readFileSync } from 'fs';
import path from 'path';
/**
 * Parse scripts from npm package file
 * @param {*} packageFile
 */
export default function npmPackageParser(projectDir) {
    try {
        const packageFile = readFileSync(
            path.resolve(projectDir, 'package.json')
        );
        const projectManifest = JSON.parse(packageFile.toString());

        // const npmscripts = Object.keys(projectManifest.scripts).map(cmdName => (
        //         {
        //             cmdName,
        //             cmd: projectManifest.scripts[cmdName],
        //         }
        // ));

        return {
            npmscripts: projectManifest.scripts,
            name: projectManifest.name
        };
    } catch (err) {
        console.log('Caught error', { err });
        if (err.code === 'ENOENT') {
            const error = new Error('Not node project');
            return error;
        }
        throw err;
    }
}
