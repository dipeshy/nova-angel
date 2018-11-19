import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as CounterActions from '../actions/counter';
import ConsoleTab from './ConsoleTab';

class ConsoleTabs extends Component<Props> {
    render() {
        const { consoles } = this.props;
        return consoles.map(c => <ConsoleTab myConsole={c} key={c.id} /> );
    }
}

function mapStateToProps(state) {
    return {
        consoles: state.consoles
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(CounterActions, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ConsoleTabs);
