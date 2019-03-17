import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { Beagle, SchemaBGL } from './classes/beagle';
import { ActionBGL } from './classes/action-bgl';
import { RawStoreConfigBGL } from './classes/raw-store-config-bgl';
import { ActionConfigBGL } from './classes/action-config-bgl';
import { BoneBGL } from './classes/bone-bgl';

@Injectable()
export class BeagleService {
  private beagle = new Beagle(this.store, this.actions$);
  private bones = {};
  get actions$(): Actions {
    return this._actions$;
  }
  constructor(private store: Store<any>, private _actions$: Actions) {}

  select(type: string, propPath: string = '') {
    return this.beagle.select(type, propPath);
  }

  dispatch(...actions: ActionBGL<any>[]) {
    actions.forEach(action => this.beagle.store.dispatch(action));
  }

  asyncLifecycle<Payload, Result>(request: ActionBGL<Payload>) {
    return this.beagle.asyncLifecycle<Payload, Result>(request);
  }

  registerFeatureBone(featureBone: BoneBGL<any, any>) {
    const entry = Object.values(this.bones).find(bone => bone['bone'] === featureBone['bone']);
    if (entry) {
      entry['bone'] = featureBone;
    }
  }

  createFeatureStore<State, Schema extends SchemaBGL>(
    actionsConfigs: {
      [Key in keyof Schema]: ActionConfigBGL<
        Schema[Key][0],
        Schema[Key][1] extends undefined ? void : Schema[Key][1]
      >
    },
    storeConfig: RawStoreConfigBGL<State>
  ) {
    const bone = this.beagle.createFeatureStore<State, Schema>(
      actionsConfigs,
      storeConfig
    );
    this.bones[storeConfig.type] = { bone, storeConfig, actionsConfigs };
    return bone;
  }

  getBone<Bone>(type: string) {
    return this.bones[type] ? this.bones[type].bone as Bone : undefined;
  }

  getBoneStoreConfig(type: string) {
    return this.bones[type].storeConfig;
  }

  getBoneActionConfig(type: string) {
    return this.bones[type].actionsConfigs;
  }

  getBoneType(action: ActionBGL<any>) {
    const notEmpty = (str: string) => str && str.length > 0;
    const rawType = action.type;
    const parts = rawType.split('@').filter(notEmpty);
    if (parts.length < 1) {
      return undefined;
    }
    const typeParts = parts[0].split('/');
    if (typeParts.length < 1) {
      return undefined;
    }
    return typeParts[0];
  }

  getBoneOf<Bone>(action: ActionBGL<any>) {
    const type = this.getBoneType(action);
    return this.getBone<Bone>(type);
  }

  getBoneStoreConfigOf(action: ActionBGL<any>) {
    const type = this.getBoneType(action);
    return this.getBoneStoreConfig(type);
  }

  getBoneActionConfigOf(action: ActionBGL<any>) {
    const type = this.getBoneType(action);
    return this.getBoneActionConfig(type);
  }
}
