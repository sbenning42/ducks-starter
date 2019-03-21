import { Action } from "../classes/action";

export type StoreReducerType<State, Payloads = any> = (state: State, action: Action<Payloads>) => State;
