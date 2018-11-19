// @flow
import type { Dispatch } from '../reducers/types';

export const ADD_LOG = 'ADD_LOG';

export function addLog(id, log) {
    return (dispatch: Dispatch) => {
        dispatch({
            type: ADD_LOG,
            id, 
            log
        });
    };
}
