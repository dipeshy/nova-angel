// @flow
import type { Action } from './types';
import { TASKSTATE_START, TASKSTATE_STOP } from '../actions/task-state.actions';

export default function formData(state = {}, action: Action) {
    switch (action.type) {
        case TASKSTATE_START:
            return {
                ...state,
                [action.id]: true
            };
        case TASKSTATE_STOP:
            return {
                ...state,
                [action.id]: false
            };
        default:
            return state;
    }
}
