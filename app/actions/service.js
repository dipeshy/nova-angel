// @flow
import type { Dispatch } from '../reducers/types';

export const SERVICE_CREATE = 'SERVICE_CREATE';

export function createService(service) {
  return (dispatch: Dispatch) => {
    const data = {
      type: SERVICE_CREATE,
      payload: service
    };
    console.log('Dispatching createService:', data);
    dispatch(data);
  };
}

