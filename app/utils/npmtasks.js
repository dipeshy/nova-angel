// @flow
import { TaskType } from '../types/task';

export default function createNpmTasks(npmscripts): Array<TaskType> {
  const tasks: Array<TaskType> = Object.keys(npmscripts).map(name => ({
    id: `npmscript-${name}`,
    name,
    cmd: npmscripts[name],
    type: 'npmscript'
  }));
  return tasks;
}
