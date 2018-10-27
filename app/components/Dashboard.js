// @flow
import React, { Component } from 'react';
import styles from './Dashboard.css';

type Props = {};

export default class Dashboard extends Component<Props> {
  props: Props;

  render() {
    return (
      <div className={`window ${styles.container}`} data-tid="container">
        <header className="toolbar toolbar-header">
          <h1 className="title">Header</h1>
          <span className="icon icon-cancel icon-close-tab" />
        </header>
        <div className="window-content">
          <div className="pane-group">
            <div className="pane-sm sidebar">...</div>
            <div className="pane">...</div>
          </div>
        </div>
        <footer className="toolbar toolbar-footer">
          <h1 className="title">Footer</h1>
        </footer>
      </div>
    );
  }
}
