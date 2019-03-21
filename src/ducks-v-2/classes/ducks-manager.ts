import { Store } from '@ngrx/store';
import { Duck } from './duck';
import { ActionsSchema } from '../interfaces/actions-schema';
import { DuckInjector } from '../interfaces/duck-injector';

export class DucksManager {
    private ducks: { [x: string]: Duck<any, any, any> } = {};
    constructor(
        public store: Store<any>
    ) {}
    register<S, SCH extends ActionsSchema, I extends DuckInjector>(duck: Duck<S, SCH, I>) {
        this.ducks[duck.storeConfig.selector] = duck;
    }
    get(selector: string) {
        return this.ducks[selector];
    }
    getOf(rawType: string) {
        return Object.values(this.ducks).find(_duck => !!_duck.getFactory(rawType));
    }
}
