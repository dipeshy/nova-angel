// @flow
import type { Dispatch } from '../reducers/types';
import { ServiceType } from '../types/service';

export const SERVICE_CREATE = 'SERVICE_CREATE';
export const SERVICE_UPDATE = 'SERVICE_UPDATE';
export const SERVICE_DELETE = 'SERVICE_DELETE';

export function createService(service: ServiceType) {
    return (dispatch: Dispatch) => {
        const data = {
            type: SERVICE_CREATE,
            payload: service
        };
        console.log('Dispatching createService:', data);
        dispatch(data);
    };
}

export function updateService(service: ServiceType) {
    return (dispatch: Dispatch) => {
        const data = {
            type: SERVICE_UPDATE,
            payload: service
        };
        console.log('Dispatching updateService:', data);
        dispatch(data);
    };
}

export function deleteService(id: string) {
    return (dispatch: Dispatch) => {
        const data = {
            type: SERVICE_DELETE,
            id
        };
        console.log('Dispatching deleteService:', data);
        dispatch(data);
    };
}
