import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { Actions } from "@ngrx/effects";
import { Beagle, SchemaBGL } from "./classes/beagle";
import { ActionBGL } from "./classes/action-bgl";
import { RawStoreConfigBGL } from "./classes/raw-store-config-bgl";
import { ActionConfigBGL } from "./classes/action-config-bgl";

@Injectable()
export class BeagleService {
    private beagle = new Beagle(this.store, this.actions$);
    get actions$(): Actions {
        return this._actions$;
    }
    constructor(
        private store: Store<any>,
        private _actions$: Actions,
    ) {}

    dispatch<A extends { type: string }>(action: A) {
        this.beagle.store.dispatch(action);
    }

    asyncLifecycle<Payload, Result>(request: ActionBGL<Payload>) {
        return this.beagle.asyncLifecycle<Payload, Result>(request);
    }
  
    createFeatureStore<State, Schema extends SchemaBGL>(
      actionsConfigs: { [Key in keyof Schema]: ActionConfigBGL<Schema[Key][0], Schema[Key][1] extends undefined ? void : Schema[Key][1]> },
      storeConfig: RawStoreConfigBGL<State>,
    ) {
        return this.beagle.createFeatureStore<State, Schema>(actionsConfigs, storeConfig);
    }

}