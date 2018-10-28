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
