// @flow
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import AddService from '../components/Services/AddService';
import * as ServiceActions from '../actions/service';

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ServiceActions, dispatch);
}

export default connect(
  null,
  mapDispatchToProps
)(AddService);