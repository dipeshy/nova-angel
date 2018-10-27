import { TaskType } from './task';

export type ServiceType = {
  id: string,
  name: string,
  projectDir: string,
  tasks: Array<TaskType>
};
