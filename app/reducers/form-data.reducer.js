// @flow
import type { Action } from './types';
import { LOAD_FORMDATA } from '../actions/form-data.actions';

export default function formData(state = {}, action: Action) {
    switch (action.type) {
        case LOAD_FORMDATA:
            return action.payload;
        default:
            return state;
    }
}
