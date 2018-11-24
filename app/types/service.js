import { TaskType } from './task';

export type ServiceType = {
    id: string,
    name: string,
    projectDir?: string,
    envvars?: string[],
    tasks: Array<TaskType>
};
