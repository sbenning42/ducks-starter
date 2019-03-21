import { Injectable } from "@angular/core";
import { DuckInjector } from "src/ducks-v-2/interfaces/duck-injector";
import { ActionsSchema } from "src/ducks-v-2/interfaces/actions-schema";
import { ActionType } from "src/ducks-v-2/types/action.type";
import { Duck } from "src/ducks-v-2/classes/duck";
import { DucksService } from "src/ducks-v-2/ducks.service";
import { StoreConfig } from "src/ducks-v-2/classes/store-config";
import { Action } from "src/ducks-v-2/classes/action";
import { ActionConfig } from "src/ducks-v-2/classes/action-config";

export const uiSelector = 'ui';

export interface UiState {
    showHeader: boolean;
}

export const initialUiState: UiState = {
    showHeader: true,
};

export interface UiInjector extends DuckInjector {}

export enum UI {
    SET_SHOW_HEADER = '@ui/set-show-header',
}

export interface UiSchema extends ActionsSchema {
    setShowHeader: ActionType<boolean>,
}

export type UiPayloads = boolean;

export function uiReducer(state: UiState = initialUiState, { type, payload }: Action<UiPayloads>): UiState {
    switch (type) {
        case UI.SET_SHOW_HEADER:
            return { ...state, showHeader: payload };
        default:
            return state;
    }
}

@Injectable()
export class UiDuck extends Duck<UiState, UiSchema, UiInjector> {
    constructor(
        ducks: DucksService,
    ) {
        super(
            { ducks },
            { setShowHeader: new ActionConfig(UI.SET_SHOW_HEADER) },
            new StoreConfig(uiSelector, initialUiState, uiReducer)
        );
    }
}
