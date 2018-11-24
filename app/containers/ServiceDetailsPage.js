// @flow
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ServiceDetails from '../components/Services/ServiceDetails';
import * as ServiceActions from '../actions/service';
import * as FormDataActions from '../actions/form-data.actions';
import { buildServiceFormData } from '../utils/service.utils';
import npmPackageParser from '../utils/npm-package-parser';

function mapStateToProps(state, props) {
    const returnState = {
        id: null,
        npmscripts: {}
    };
    let initialValues = {};

    const { serviceId } = props.match.params;
    if (serviceId) {
        const service = state.services.find(s => s.id === serviceId);
        initialValues = buildServiceFormData(service);
        returnState.id = service.id;
    }

    if (Object.keys(state.formData).length > 0) {
        initialValues = { ...initialValues, ...state.formData };
    }

    if (initialValues.projectDir) {
        const manifest = npmPackageParser(initialValues.projectDir);
        if (!(manifest instanceof Error)) {
            const { npmscripts } = manifest;
            returnState.npmscripts = npmscripts;
        }
    }

    returnState.initialValues = initialValues;
    return returnState;
}

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators(ServiceActions, dispatch),
        ...bindActionCreators(FormDataActions, dispatch)
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ServiceDetails);
