import { ActionHeaderST } from './action-header-st';

export interface ActionST<T = void> {
  type: string;
  header: ActionHeaderST;
  payload: T;
}
