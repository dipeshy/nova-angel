// @flow
import { connect } from 'react-redux';
import Dashboard from '../components/Dashboard';

function mapStateToProps(state) {
  return {
    services: state.services
  };
}

export default connect(
  mapStateToProps,
  null
)(Dashboard);
