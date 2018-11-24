import type { Dispatch } from '../reducers/types';

export const LOAD_FORMDATA = 'LOAD_FORMDATA';

export function loadFormData(data: any) {
    return (dispatch: Dispatch) => {
        dispatch({
            type: LOAD_FORMDATA,
            payload: { ...data }
        });
    };
}
