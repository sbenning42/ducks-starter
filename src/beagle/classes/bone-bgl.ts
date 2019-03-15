import { BeagleService } from '../beagle.service';
import { ActionBGL } from './action-bgl';
import { SchemaBGL } from './beagle';
import { RawStoreBGL } from './raw-store-bgl';
import { ActionFactoryBGL } from './action-factory-bgl';
import {
  AsyncActionFactoryBGL,
  makeRequestTypeBGL,
  makeCancelTypeBGL,
  makeRetryTypeBGL,
  makeResolvedTypeBGL,
  makeErroredTypeBGL,
  makeCanceledTypeBGL
} from './async-actions-factory-bgl';
import { filter, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

type Wtf<State, Schema extends SchemaBGL> = RawStoreBGL<State> & {
  actions: {
    [Key in keyof Schema]: (
      Schema[Key][1] extends undefined ? void : Schema[Key][1]
    ) extends void
      ? ActionFactoryBGL<Schema[Key][0]>
      : AsyncActionFactoryBGL<Schema[Key][0], Schema[Key][1]>
  };
}

export abstract class BoneBGL<
  State,
  Schema extends SchemaBGL,
  Injectors extends {} = {}
> implements Wtf<State, Schema> {
  state$: Observable<State>;
  selectors: { [Key in keyof State]: Observable<State[Key]> };
  actions: {
    [Key in keyof Schema]: (
      Schema[Key][1] extends undefined ? void : Schema[Key][1]
    ) extends void
      ? ActionFactoryBGL<Schema[Key][0]>
      : AsyncActionFactoryBGL<Schema[Key][0], Schema[Key][1]>
  };
  constructor(
    protected beagle: BeagleService,
    protected injectors: Injectors = {} as any,
    protected bone: RawStoreBGL<State> & {
      actions: {
        [Key in keyof Schema]: (
          Schema[Key][1] extends undefined ? void : Schema[Key][1]
        ) extends void
          ? ActionFactoryBGL<Schema[Key][0]>
          : AsyncActionFactoryBGL<Schema[Key][0], Schema[Key][1]>
      };
    },
  ) {
    this.state$ = this.bone.state$;
    this.selectors = this.bone.selectors;
    this.actions = this.bone.actions;
  }
  private asyncTypes(action: ActionBGL<any>, ...types: string[]) {
    return this.asyncLifecycle(action).pipe(filter(thisAction =>  types.includes(thisAction.type)), take(1));
  }
  dispatch(action: ActionBGL<any>) {
    this.beagle.dispatch(action);
  }
  asyncLifecycle(action: ActionBGL<any>) {
    return this.beagle.asyncLifecycle(action);
  }
  asyncRequest(action: ActionBGL<any>) {
    return this.asyncTypes(action, makeRequestTypeBGL(action.type));
  }
  asyncCancel(action: ActionBGL<any>) {
    return this.asyncTypes(action, makeCancelTypeBGL(action.type));
  }
  asyncRetry(action: ActionBGL<any>) {
    return this.asyncTypes(action, makeRetryTypeBGL(action.type));
  }
  asyncResolved(action: ActionBGL<any>) {
    return this.asyncTypes(action, makeResolvedTypeBGL(action.type));
  }
  asyncErrored(action: ActionBGL<any>) {
    return this.asyncTypes(action, makeErroredTypeBGL(action.type));
  }
  asyncCanceled(action: ActionBGL<any>) {
    return this.asyncTypes(action, makeCanceledTypeBGL(action.type));
  }
}
