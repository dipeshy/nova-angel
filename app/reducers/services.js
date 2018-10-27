// @flow
import { SERVICE_CREATE } from '../actions/service';
import type { Action } from './types';
import store from '../utils/store';

export default function services(_state = [], action: Action) {
  const state = [..._state];
  console.log("SERVICES state", state);
  switch (action.type) {
    case SERVICE_CREATE:
      state.push(action.payload);
      store.set('services', state);
      return state;
    default:
      return state;
  }
}
