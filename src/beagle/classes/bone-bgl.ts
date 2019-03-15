import { BeagleService } from '../beagle.service';
import { ActionBGL } from './action-bgl';
import { SchemaBGL } from './beagle';
import { RawStoreBGL } from './raw-store-bgl';
import { ActionFactoryBGL } from './action-factory-bgl';
import { AsyncActionFactoryBGL } from './async-actions-factory-bgl';

export abstract class BoneBGL<State, Schema extends SchemaBGL, Injectors extends Object = {}> {
    abstract bone: RawStoreBGL<State> & {
        actions: {
            [Key in keyof Schema]: (Schema[Key][1] extends undefined ? void : Schema[Key][1]) extends void
                ? ActionFactoryBGL<Schema[Key][0]>
                : AsyncActionFactoryBGL<Schema[Key][0], Schema[Key][1]>;
        }
    };
    constructor(protected beagle: BeagleService, protected injectors: Injectors = ({} as any)) {}
    dispatch<A extends ActionBGL<any>>(action: A) {
        this.beagle.dispatch(action);
    }
    asyncLifecycle<A extends ActionBGL<any>>(action: A) {
        return this.beagle.asyncLifecycle(action);
    }
}