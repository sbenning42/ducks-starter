import { ActionFactoryST } from "../classes/action-factory-st";

export interface ActionManagerST<P = void> {
    create(payload: P): ActionFactoryST<P>;
    dispatch(payload: P): void;
}
