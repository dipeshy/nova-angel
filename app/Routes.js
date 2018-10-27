/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { Switch, Route } from 'react-router';
import routes from './constants/routes';
import App from './containers/App';
import DashboardPage from './containers/DashboardPage';
import HomePage from './containers/HomePage';
import CounterPage from './containers/CounterPage';
import ServiceAddPage from './containers/ServiceAddPage';

export default () => (
  <App>
    <Switch>
      <Route path={routes.COUNTER} component={CounterPage} />
      <Route path={routes.SERVICES_ADD} component={ServiceAddPage} />
      <Route path={routes.HOME} component={DashboardPage} />
      <Route path={routes.HOME} component={HomePage} />
    </Switch>
  </App>
);
