// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../../constants/routes';
import { ServiceType } from '../../types/service';
import styles from './ServiceComponent.css';

type Props = {
  service: ServiceType
};

export default class ServiceComponent extends Component<Props> {
  props: Props;

  render() {
    const { service } = this.props;
    return (
      <section className={`${styles.container}`} data-tid="container">
        <header className="title">
          <h1>{service.name}</h1>
          <div className="btn-group pull-right">
            <Link
              to={`${routes.SERVICES}/${service.id}`}
              className="btn btn-mini btn-default"
            >
              <span className="icon icon-cog" />
            </Link>
            <button type="button" className="btn btn-mini btn-default">
              <span className="icon icon-bookmark" />
            </button>
          </div>
          <div style={{ clear: 'both' }} />
        </header>
      </section>
    );
  }
}
