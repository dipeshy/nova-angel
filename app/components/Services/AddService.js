// @flow
import { v4 } from 'uuid';
import React, { Component } from 'react';
import styles from './AddService.css';
import npmPackageParser from "../../utils/npm-package-parser";

const { dialog } = require('electron').remote

type Props = {
  createService: (service) => void
};

export default class AddService extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.dialog = dialog;
    this.state = {
      projectDir: '',
      name: '',
      npmscripts: []
    }
  }

  handleChange = (event) => {
    this.setState({
      name: event.target.value
    });
  }

  createService = () => {
    const { createService } = this.props;
    const { name, projectDir, tasks } = this.state;

    const service = {
      id: v4(),
      name,
      projectDir,
      tasks
    }
    console.log("Creating service", service);
    createService(service);
  }

  setProjectDirWithDialog = () => {
    const projectDir = this.dialog.showOpenDialog({properties: ['openDirectory']});
    const manifest = npmPackageParser(projectDir[0]);

    if (manifest instanceof Error) {
      return;
    }

    const { name, npmscripts } = manifest;

    this.setState({
      projectDir,
      name,
      npmscripts,
      tasks: []
    })
  }

  selectNpmScript = (event) => {
    const scriptName = event.target.value;
    const { npmscripts } = this.state;

    const task = {
      id: `npmscript-${scriptName}`,
      name: scriptName,
      cmd: npmscripts[scriptName],
      type: 'npmscript'
    }

    if (event.target.checked) {
      this.addTask(task);
    } else {
      this.removeTask(task.id);
    }
  }

  addTask = (task) => {
    const { tasks } = this.state;
    tasks.push(task);
    this.setState({
      tasks
    }) 
  }

  removeTask = (id) => {
    const { tasks } = this.state;
    this.setState({
      tasks: tasks.filter((task) => id !== task.id)
    })
  }

  render() {
    const { projectDir, name, npmscripts } = this.state;
    return (
      <div className={`${styles.container}`} data-tid="container">
          <form onSubmit={(event) => { event.preventDefault(); this.createService() } } >
            <div className="form-group">
              <button className="btn btn-default" type="button" onClick={this.setProjectDirWithDialog}>Select Nodejs Project</button>
              &nbsp;&nbsp;<span>{projectDir || 'Not set'  }</span>
            </div>
            <div className="form-group">
              <label htmlFor="name">Service Name</label>
              <input type="text" id="name" value={ name } onChange={ this.handleChange } className="form-control" placeholder="Service name" />
            </div>
            <div className="checkbox">
            <span>Select npm script</span>
            { 
              npmscripts &&
              Object.keys(npmscripts).map(scriptName => <div key={scriptName}>
                <label htmlFor={`script-${scriptName}`} >
                    <input id={`script-${scriptName}`} value={scriptName} onChange={this.selectNpmScript} type="checkbox" />
                    &nbsp;{scriptName}
                </label>
                </div>
              )
            }
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-form btn-primary">Create</button>
            </div>
          </form>
      </div>
    );
  }
}
