// @flow
import { TaskType } from '../types/task';

export default function createNpmTasks(ns, npmscripts): Array<TaskType> {
  const tasks: Array<TaskType> = Object.keys(npmscripts).map(name => ({
    id: `${ns}:npmscript:${name}`,
    name,
    cmd: npmscripts[name],
    type: 'npmscript'
  }));
  return tasks;
}
