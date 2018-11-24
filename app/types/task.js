// @flow

export type TaskType = BaseType &
    (NpmTaskType | EditorTaskType | DockerTaskType);

type BaseType = {
    id: string,
    name: string,
    type: string
};

export type NpmTaskType = {
    cmd: string
};

export type EditorTaskType = {
    projectDir: string
};

export type DockerTaskType = {
    image: string, // postgres:9.6
    container_name: string, // postgres.nova.com
    ports: Array<string>, // ['5432:5432']
    volumes: Array<string>, // "~/.nova/nova.com/postgresql/data:/var/lib/postgresql/data"
    args: { [key: string]: string },
    env: Array<string>
};

export type CreateEditorTaskInputType = {
    parentId: string,
    projectDir: string
};
export function createEditorTask({
    parentId,
    projectDir
}: CreateEditorTaskInputType): EditorTaskType {
    const editorTask: EditorTaskType = {
        id: `${parentId}:editor`,
        name: 'vscode',
        projectDir,
        type: 'editor'
    };
    return editorTask;
}

export type CreateNpmTaskInputType = {
    parentId: string,
    name: string,
    cmd: string
};
export function createNpmTask({
    parentId,
    name,
    cmd
}: CreateNpmTaskInputType): NpmTaskType {
    return {
        id: `${parentId}:npmscript:${name}`,
        name,
        cmd,
        type: 'npmscript'
    };
}

export type CreateDockerTaskInputType = {
    parentId: string,
    data: DockerFormType
};

export type DockerFormType = {
    name: string,
    image: string,
    ports?: [],
    env?: [],
    volumes?: []
};

export function createDockerTask({
    parentId,
    data
}: CreateDockerTaskInputType): DockerTaskType {
    const { name, image, ports = [], env = [], volumes = [] } = data;
    return {
        id: `${parentId}:npmscript:${name}`,
        name,
        container_name: name,
        type: 'docker',
        image,
        ports,
        env,
        volumes,
        args: {}
    };
}
