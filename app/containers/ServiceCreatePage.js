// @flow
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ServiceCreate from '../components/Services/ServiceCreate';
import * as ServiceActions from '../actions/service';

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ServiceActions, dispatch);
}

export default connect(
  null,
  mapDispatchToProps
)(ServiceCreate);
