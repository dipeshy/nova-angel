// @flow
import React, { Component } from 'react';
import { NpmTaskType } from '../../../types/task';

type Props = {
  task: NpmTaskType
};

export default class NpmScriptTask extends Component<Props> {
  props: Props;

  render() {
    const { task } = this.props;
    return <section>{task.id}</section>;
  }
}
