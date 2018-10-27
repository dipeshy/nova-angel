// @flow

export type TaskType = NpmTaskType | npmscript;

export type NpmTaskType = {
  id: string,
  name: string,
  cmd: string,
  type: 'npmscript'
};

export type EditorTaskType = {
  id: string,
  projectDir: string,
  type: 'editor'
};
