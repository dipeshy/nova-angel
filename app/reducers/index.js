// @flow
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { reducer as formReducer } from 'redux-form';
import counter from './counter';
import services from './services';
import consoles from './consoles';
import formData from './form-data.reducer';
import taskStates from './task-states.reducer';

export default function createRootReducer(history: {}) {
    const routerReducer = connectRouter(history)(() => {});

    return connectRouter(history)(
        combineReducers({
            router: routerReducer,
            counter,
            services,
            consoles,
            form: formReducer,
            formData,
            taskStates
        })
    );
}
