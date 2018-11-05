// @flow
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ServiceDetails from '../components/Services/ServiceDetails';
import * as ServiceActions from '../actions/service';

function mapStateToProps(state, props) {
    const { serviceId } = props.match.params;
    const service = state.services.find(s => s.id === serviceId);
    return {
        service
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(ServiceActions, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ServiceDetails);
