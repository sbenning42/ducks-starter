import { ActionConfigSchemaD } from "../../ducks/interfaces/action-config-schema";
import { ActionConfigTypeD } from "../../ducks/types/action-config-type";
import { Injectable } from "@angular/core";
import { Duck } from "../../ducks/models/duck";
import { DucksService } from "../../ducks/ducks.service";
import { StoreConfigD } from "../../ducks/models/store-config";
import { ActionConfigD } from "../../ducks/models/action-config";
import { DuckInjectorD } from "../../ducks/interfaces/duck-injector";

export const uiType = 'ui';

export interface UiState {
    showHeader: boolean;
}

export const initialUiState: UiState = {
    showHeader: true,
};

export interface UiInjectors extends DuckInjectorD {

}

export enum UI_TYPE {
    SET_SHOW_HEADER = '@ui/set-show-header',
}

export interface UiSchema extends ActionConfigSchemaD {
    setShowHeader: ActionConfigTypeD<boolean>,
}

@Injectable()
export class UiDuck extends Duck<UiState, UiSchema, UiInjectors> {
    constructor(
        ducks: DucksService,
    ) {
        super(
            { manager: ducks.manager },
            new StoreConfigD(uiType, initialUiState, (state, action) => {
                switch (action.type) {
                    case UI_TYPE.SET_SHOW_HEADER:
                        return { ...state, showHeader: action.payload };
                    default:
                        return state;
                }
            }),
            {
                setShowHeader: new ActionConfigD(UI_TYPE.SET_SHOW_HEADER),
            },
        );
    }
}
