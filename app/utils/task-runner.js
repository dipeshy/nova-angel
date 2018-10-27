const runCommand = require('./commands');

export default function taskRunner(taskName, params) {
  console.log(`Received Task: ${taskName}`, params);
  switch (taskName) {
    case 'editor:open':
      openEditor(params);
      break;
    default:
      console.log('Unknown task', { taskName, params });
  }
}

function openEditor(params) {
  runCommand('code', [params.projectDir]);
}
