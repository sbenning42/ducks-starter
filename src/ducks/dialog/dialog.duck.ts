import { Injectable } from '@angular/core';
import { Duck, BaseSchema, responseOf, Ducks } from '../ducks';

export interface DialogState {
}

export interface DialogSelector {
    dialog: 'dialog';
}
export interface DialogSchema extends BaseSchema {
}
@Injectable()
export class AppDuck extends Duck<DialogState, DialogSelector, DialogSchema> {
    selector: 'dialog'
    state: {
    }
    schema: {
    }
}