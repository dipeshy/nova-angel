import type { Dispatch } from '../reducers/types';

export const TASKSTATE_START = 'TASKSTATE_START';
export const TASKSTATE_STOP = 'TASKSTATE_STOP';

export function updateTaskstateAction({
    id,
    state
}: {
    id: string,
    state: string
}) {
    return (dispatch: Dispatch) => {
        if (state === 'start') {
            dispatch({
                type: TASKSTATE_START,
                id
            });
        } else if (state === 'stop') {
            dispatch({
                type: TASKSTATE_STOP,
                id
            });
        }
    };
}
