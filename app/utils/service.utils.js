import { v4 } from 'uuid';
import {
    TaskType,
    createEditorTask,
    createNpmTask,
    DockerFormType,
    createDockerTask
} from '../types/task';
import { ServiceType } from '../types/service';

type ServiceFormDataType = {
    id?: string,
    name: string,
    envvars?: string[],
    projectDir?: string,
    npmscripts?: { [key: string]: boolean },
    dockers?: DockerFormType[]
};

type ContextType = {
    npmscripts: { [key: string]: string }
};

export function buildService(
    data: ServiceFormDataType,
    context: ContextType
): ServiceType {
    const service: ServiceType = {
        id: data.id || v4(),
        name: data.name,
        tasks: []
    };

    if (data.projectDir) {
        // Add projectDir as cwd for running npmtasks
        service.projectDir = data.projectDir;

        // Create Editor task
        service.tasks.push(
            createEditorTask({
                parentId: service.id,
                projectDir: data.projectDir
            })
        );

        if (data.npmscripts) {
            Object.keys(data.npmscripts).forEach((name: string) => {
                const value = data.npmscripts[name];
                if (value) {
                    const cmd = context.npmscripts[name];
                    // Script may be removed
                    if (!cmd) {
                        return;
                    }
                    service.tasks.push(
                        createNpmTask({
                            parentId: service.id,
                            createNpmTask,
                            name,
                            cmd
                        })
                    );
                }
            });
        }
    }

    service.envvars =
        data.envvars && Array.isArray(data.envvars) ? data.envvars : [];

    if (Array.isArray(data.dockers)) {
        data.dockers.forEach((input: DockerFormType) => {
            service.tasks.push(
                createDockerTask({
                    parentId: service.id,
                    data: input
                })
            );
        });
    }
    return service;
}

export function buildServiceFormData(
    service: ServiceType
): ServiceFormDataType {
    const serviceFormData = {
        id: service.id,
        name: service.name
    };

    if (service.projectDir) {
        serviceFormData.projectDir = service.projectDir;
    }

    if (service.envvars) {
        serviceFormData.envvars = service.envvars;
    }
    service.tasks.forEach((task: TaskType) => {
        let dockerFormData: DockerFormType;
        switch (task.type) {
            case 'npmscript':
                if (!serviceFormData.npmscripts) {
                    serviceFormData.npmscripts = {};
                }
                serviceFormData.npmscripts[task.name] = true;
                break;
            case 'docker':
                dockerFormData = {
                    name: task.name,
                    image: task.image
                };
                if (task.ports.length) {
                    dockerFormData.ports = task.ports;
                }
                if (task.env.length) {
                    dockerFormData.env = task.env;
                }
                if (task.volumes.length) {
                    dockerFormData.volumes = task.volumes;
                }
                if (!serviceFormData.dockers) {
                    serviceFormData.dockers = [];
                }
                serviceFormData.dockers.push(dockerFormData);
                break;
            default:
                break;
        }
    });
    return serviceFormData;
}
