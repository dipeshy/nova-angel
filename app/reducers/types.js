import type { Dispatch as ReduxDispatch, Store as ReduxStore } from 'redux';
import { ServiceType } from '../types/service';
import { ConsoleType } from '../types/console.type';

export type counterStateType = {
    +counter: number,
    services: Array<ServiceType>,
    consoles: Array<ConsoleType>
};

export type Action = {
    +type: string
};

export type GetState = () => counterStateType;

export type Dispatch = ReduxDispatch<Action>;

export type Store = ReduxStore<GetState, Action>;
