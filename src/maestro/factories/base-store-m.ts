import { __factories } from './todo-fixit-soon';
import { ActionM } from '../interfaces/action-m';
import { Observable } from 'rxjs';
import { select, createSelector, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';

export interface ActionDefinition {
  name: string;
  type: string;
  isAsync: boolean;
  sideEffect?: (payload: any, actions$: Actions, store: Store<any>) => Observable<any>;
  loading?: boolean;
  loadingData?: any;
}

export interface BaseState {
  [key: string]: any;
}

export interface BaseStoreConfig<S = BaseState> {
  selector: string;
  initial: S;
  reducer: (state: S, action: ActionM) => S;
  actionDefinitions: ActionDefinition[];
  effects?: { source$: Observable<ActionM>, config: { name: string, dispatch?: boolean } }[];
}

export class BaseStore<
  S = BaseState,
  PA0 = void,
  PA1 = void,
  PA2 = void,
  PA3 = void,
  PA4 = void,
  PA5 = void,
  PA6 = void,
  PA7 = void,
  PA8 = void,
  PA9 = void,
  PA10 = void,
  PA11 = void,
  PA12 = void,
  PA13 = void,
  PA14 = void,
  PA15 = void,
  PA16 = void,
  PA17 = void,
  PA18 = void,
  PA19 = void,
  PA20 = void,
  PA21 = void,
  PA22 = void,
  PA23 = void,
  PA24 = void,
  PA25 = void,
  PA26 = void,
  PA27 = void,
  PA28 = void,
  PA29 = void,
  PA30 = void,
  PA31 = void,
  PA32 = void,
> {
  classes: { [type: string]: any } = {};
  dispatch: (action: ActionM) => void;
  reducer: (state: S, action: ActionM) => S;
  [key: string]: any;
  constructor(
    public selector: string,
    public initial: S,
    reducer: (state: S, action: ActionM) => S,
    actionDefinitions: ActionDefinition[],
    public effects: {
      source$: Observable<ActionM>,
      config: { name: string, dispatch?: boolean },
    }[],
    maestro: any,
  ) {
    this.reducer = (state: S = initial, action: ActionM) => reducer(state, action);
    this.dispatch = (action: ActionM) => maestro.store.dispatch(action);
    const selectState = (states: any[]) => states[selector] as S;
    this[`${selector}$`] = maestro.store.pipe(select(selectState));
    Object.entries(initial).forEach(([key]: [string, any]) => {
      const selectKey = createSelector(selectState, (state: S) => state[key]);
      this[`${key}$`] = maestro.store.pipe(select(selectKey));
    });
    effects.forEach(
      ({ source$, config }: { source$: Observable<ActionM>, config: { name: string, dispatch?: boolean } }) => {
        this[config.name] = source$;
        Effect({ dispatch: config.dispatch })(this, config.name);
      }
    );
    const focatories = __factories<
      PA0,
      PA1,
      PA2,
      PA3,
      PA4,
      PA5,
      PA6,
      PA7,
      PA8,
      PA9,
      PA10,
      PA11,
      PA12,
      PA13,
      PA14,
      PA15,
      PA16,
      PA17,
      PA18,
      PA19,
      PA20,
      PA21,
      PA22,
      PA23,
      PA24,
      PA25,
      PA26,
      PA27,
      PA28,
      PA29,
      PA30,
      PA31,
      PA32
    >();
    actionDefinitions.forEach((definition: ActionDefinition, index: number) => {
      const ClassDefinition: any = focatories[index](definition);
      this.classes[definition.type] = { definition, ClassDefinition };
      if (definition.sideEffect) {
        maestro.registerSideEffect(definition.type, definition.sideEffect);
      }
      switch (index) {
        case 0:
          this[`${definition.name}Factory`] = (payload: PA0, id?: string) => new ClassDefinition(payload as any, id);
          this[definition.name] = (payload: PA0, id?: string) => this.dispatch(new ClassDefinition(payload as any, id));
          break;
        case 1:
          this[`${definition.name}Factory`] = (payload: PA1, id?: string) => new ClassDefinition(payload as any, id);
          this[definition.name] = (payload: PA1, id?: string) => this.dispatch(new ClassDefinition(payload as any, id));
          break;
        case 2:
          this[`${definition.name}Factory`] = (payload: PA2, id?: string) => new ClassDefinition(payload as any, id);
          this[definition.name] = (payload: PA2, id?: string) => this.dispatch(new ClassDefinition(payload as any, id));
          break;
        case 3:
          this[`${definition.name}Factory`] = (payload: PA3, id?: string) => new ClassDefinition(payload as any, id);
          this[definition.name] = (payload: PA3, id?: string) => this.dispatch(new ClassDefinition(payload as any, id));
          break;
        case 4:
          this[`${definition.name}Factory`] = (payload: PA4, id?: string) => new ClassDefinition(payload as any, id);
          this[definition.name] = (payload: PA4, id?: string) => this.dispatch(new ClassDefinition(payload as any, id));
          break;
        case 5:
          this[`${definition.name}Factory`] = (payload: PA5, id?: string) => new ClassDefinition(payload as any, id);
          this[definition.name] = (payload: PA5, id?: string) => this.dispatch(new ClassDefinition(payload as any, id));
          break;
        case 6:
          this[`${definition.name}Factory`] = (payload: PA6, id?: string) => new ClassDefinition(payload as any, id);
          this[definition.name] = (payload: PA6, id?: string) => this.dispatch(new ClassDefinition(payload as any, id));
          break;
        case 7:
          this[`${definition.name}Factory`] = (payload: PA7, id?: string) => new ClassDefinition(payload as any, id);
          this[definition.name] = (payload: PA7, id?: string) => this.dispatch(new ClassDefinition(payload as any, id));
          break;
        case 8:
          this[`${definition.name}Factory`] = (payload: PA8, id?: string) => new ClassDefinition(payload as any, id);
          this[definition.name] = (payload: PA8, id?: string) => this.dispatch(new ClassDefinition(payload as any, id));
          break;
        case 9:
          this[`${definition.name}Factory`] = (payload: PA9, id?: string) => new ClassDefinition(payload as any, id);
          this[definition.name] = (payload: PA9, id?: string) => this.dispatch(new ClassDefinition(payload as any, id));
          break;
        case 10:
          this[`${definition.name}Factory`] = (payload: PA10, id?: string) => new ClassDefinition(payload as any, id);
          this[definition.name] = (payload: PA10, id?: string) => this.dispatch(new ClassDefinition(payload as any, id));
          break;
        case 11:
          this[`${definition.name}Factory`] = (payload: PA11, id?: string) => new ClassDefinition(payload as any, id);
          this[definition.name] = (payload: PA11, id?: string) => this.dispatch(new ClassDefinition(payload as any, id));
          break;
        case 12:
          this[`${definition.name}Factory`] = (payload: PA12, id?: string) => new ClassDefinition(payload as any, id);
          this[definition.name] = (payload: PA12, id?: string) => this.dispatch(new ClassDefinition(payload as any, id));
          break;
        case 13:
          this[`${definition.name}Factory`] = (payload: PA13, id?: string) => new ClassDefinition(payload as any, id);
          this[definition.name] = (payload: PA13, id?: string) => this.dispatch(new ClassDefinition(payload as any, id));
          break;
        case 14:
          this[`${definition.name}Factory`] = (payload: PA14, id?: string) => new ClassDefinition(payload as any, id);
          this[definition.name] = (payload: PA14, id?: string) => this.dispatch(new ClassDefinition(payload as any, id));
          break;
        case 15:
          this[`${definition.name}Factory`] = (payload: PA15, id?: string) => new ClassDefinition(payload as any, id);
          this[definition.name] = (payload: PA15, id?: string) => this.dispatch(new ClassDefinition(payload as any, id));
          break;
        case 16:
          this[`${definition.name}Factory`] = (payload: PA16, id?: string) => new ClassDefinition(payload as any, id);
          this[definition.name] = (payload: PA16, id?: string) => this.dispatch(new ClassDefinition(payload as any, id));
          break;
        case 17:
          this[`${definition.name}Factory`] = (payload: PA17, id?: string) => new ClassDefinition(payload as any, id);
          this[definition.name] = (payload: PA17, id?: string) => this.dispatch(new ClassDefinition(payload as any, id));
          break;
        case 18:
          this[`${definition.name}Factory`] = (payload: PA18, id?: string) => new ClassDefinition(payload as any, id);
          this[definition.name] = (payload: PA18, id?: string) => this.dispatch(new ClassDefinition(payload as any, id));
          break;
        case 19:
          this[`${definition.name}Factory`] = (payload: PA19, id?: string) => new ClassDefinition(payload as any, id);
          this[definition.name] = (payload: PA19, id?: string) => this.dispatch(new ClassDefinition(payload as any, id));
          break;
        case 20:
          this[`${definition.name}Factory`] = (payload: PA20, id?: string) => new ClassDefinition(payload as any, id);
          this[definition.name] = (payload: PA20, id?: string) => this.dispatch(new ClassDefinition(payload as any, id));
          break;
        case 21:
          this[`${definition.name}Factory`] = (payload: PA21, id?: string) => new ClassDefinition(payload as any, id);
          this[definition.name] = (payload: PA21, id?: string) => this.dispatch(new ClassDefinition(payload as any, id));
          break;
        case 22:
          this[`${definition.name}Factory`] = (payload: PA22, id?: string) => new ClassDefinition(payload as any, id);
          this[definition.name] = (payload: PA22, id?: string) => this.dispatch(new ClassDefinition(payload as any, id));
          break;
        case 23:
          this[`${definition.name}Factory`] = (payload: PA23, id?: string) => new ClassDefinition(payload as any, id);
          this[definition.name] = (payload: PA23, id?: string) => this.dispatch(new ClassDefinition(payload as any, id));
          break;
        case 24:
          this[`${definition.name}Factory`] = (payload: PA24, id?: string) => new ClassDefinition(payload as any, id);
          this[definition.name] = (payload: PA24, id?: string) => this.dispatch(new ClassDefinition(payload as any, id));
          break;
        case 25:
          this[`${definition.name}Factory`] = (payload: PA25, id?: string) => new ClassDefinition(payload as any, id);
          this[definition.name] = (payload: PA25, id?: string) => this.dispatch(new ClassDefinition(payload as any, id));
          break;
        case 26:
          this[`${definition.name}Factory`] = (payload: PA26, id?: string) => new ClassDefinition(payload as any, id);
          this[definition.name] = (payload: PA26, id?: string) => this.dispatch(new ClassDefinition(payload as any, id));
          break;
        case 27:
          this[`${definition.name}Factory`] = (payload: PA27, id?: string) => new ClassDefinition(payload as any, id);
          this[definition.name] = (payload: PA27, id?: string) => this.dispatch(new ClassDefinition(payload as any, id));
          break;
        case 28:
          this[`${definition.name}Factory`] = (payload: PA28, id?: string) => new ClassDefinition(payload as any, id);
          this[definition.name] = (payload: PA28, id?: string) => this.dispatch(new ClassDefinition(payload as any, id));
          break;
        case 29:
          this[`${definition.name}Factory`] = (payload: PA29, id?: string) => new ClassDefinition(payload as any, id);
          this[definition.name] = (payload: PA29, id?: string) => this.dispatch(new ClassDefinition(payload as any, id));
          break;
        case 30:
          this[`${definition.name}Factory`] = (payload: PA30, id?: string) => new ClassDefinition(payload as any, id);
          this[definition.name] = (payload: PA30, id?: string) => this.dispatch(new ClassDefinition(payload as any, id));
          break;
        case 31:
          this[`${definition.name}Factory`] = (payload: PA31, id?: string) => new ClassDefinition(payload as any, id);
          this[definition.name] = (payload: PA31, id?: string) => this.dispatch(new ClassDefinition(payload as any, id));
          break;
        case 32:
          this[`${definition.name}Factory`] = (payload: PA32, id?: string) => new ClassDefinition(payload as any, id);
          this[definition.name] = (payload: PA32, id?: string) => this.dispatch(new ClassDefinition(payload as any, id));
          break;
        default:
          this[`${definition.name}Factory`] = (payload: PA1, id?: string) => new ClassDefinition(payload as any, id);
          this[definition.name] = (payload: any, id?: string) => this.dispatch(new ClassDefinition(payload as any, id));
          break;
      }
    });
  }
}

export function baseStoreFactory<
  S = BaseState,
  PA0 = void,
  PA1 = void,
  PA2 = void,
  PA3 = void,
  PA4 = void,
  PA5 = void,
  PA6 = void,
  PA7 = void,
  PA8 = void,
  PA9 = void,
  PA10 = void,
  PA11 = void,
  PA12 = void,
  PA13 = void,
  PA14 = void,
  PA15 = void,
  PA16 = void,
  PA17 = void,
  PA18 = void,
  PA19 = void,
  PA20 = void,
  PA21 = void,
  PA22 = void,
  PA23 = void,
  PA24 = void,
  PA25 = void,
  PA26 = void,
  PA27 = void,
  PA28 = void,
  PA29 = void,
  PA30 = void,
  PA31 = void,
  PA32 = void,
  >(
  config: BaseStoreConfig<S>,
  maestro: any,
): BaseStore<
  S,
  PA0,
  PA1,
  PA2,
  PA3,
  PA4,
  PA5,
  PA6,
  PA7,
  PA8,
  PA9,
  PA10,
  PA11,
  PA12,
  PA13,
  PA14,
  PA15,
  PA16,
  PA17,
  PA18,
  PA19,
  PA20,
  PA21,
  PA22,
  PA23,
  PA24,
  PA25,
  PA26,
  PA27,
  PA28,
  PA29,
  PA30,
  PA31,
  PA32
> {
  const store = new BaseStore<
    S,
    PA0,
    PA1,
    PA2,
    PA3,
    PA4,
    PA5,
    PA6,
    PA7,
    PA8,
    PA9,
    PA10,
    PA11,
    PA12,
    PA13,
    PA14,
    PA15,
    PA16,
    PA17,
    PA18,
    PA19,
    PA20,
    PA21,
    PA22,
    PA23,
    PA24,
    PA25,
    PA26,
    PA27,
    PA28,
    PA29,
    PA30,
    PA31,
    PA32
  >(
    config.selector,
    config.initial,
    config.reducer,
    config.actionDefinitions,
    config.effects || [],
    maestro
  );
  maestro.registerStore(store);
  return store;
}
