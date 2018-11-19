// @flow
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import counter from './counter';
import services from './services';
import consoles from './consoles';

export default function createRootReducer(history: {}) {
    const routerReducer = connectRouter(history)(() => {});

    return connectRouter(history)(
        combineReducers({
            router: routerReducer,
            counter,
            services,
            consoles,
        })
    );
}
