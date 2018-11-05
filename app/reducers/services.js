// @flow
import {
    SERVICE_CREATE,
    SERVICE_UPDATE,
    SERVICE_DELETE
} from '../actions/service';
import type { Action } from './types';
import store from '../utils/store';

export default function services(state = [], action: Action) {
    let updatedState;
    switch (action.type) {
        case SERVICE_UPDATE:
            updatedState = state.map(
                service =>
                    service.id === action.payload.id ? action.payload : service
            );
            store.set('services', updatedState);
            return updatedState;
        case SERVICE_CREATE:
            state.push(action.payload);
            store.set('services', state);
            return state;
        case SERVICE_DELETE:
            updatedState = state.filter(service => service.id !== action.id);
            store.set('services', updatedState);
            return updatedState;
        default:
            return state;
    }
}
