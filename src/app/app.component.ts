import { Component } from '@angular/core';
import { Observable, merge, timer, throwError, of, defer } from 'rxjs';
import { tap, first, map, switchMap } from 'rxjs/operators';
import { STService } from './st/services/st.service';
import { ActionST } from './st/interfaces/action-st';
import {
  asyncRequestOfST,
  asyncCancelOfST,
  asyncResolvedOfST,
  asyncErroredOfST,
  asyncCanceledOfST,
  asyncCancelFactoryST
} from './st/operators/handle-async-req-res-correlation-st';
import { ActionFactoryST } from './st/classes/action-factory-st';
import { ActionCorrelationFactoryST } from './st/classes/action-correlation-factory-st';
import { AsyncReqResCorrelationController } from './st/classes/async-req-res-correlation-controller-st';

const TEST1_TYPE = '[Test ST] Test 1';
const async = (payload: { test: string }) => () => Math.random() < 0.9
  ? throwError(new Error('Random'))
  : of({ data: { tested: `${payload.test} => Tested !!!` } });

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'app';
  ready$: Observable<boolean>;
  loading$: Observable<boolean>;
  loadingData$: Observable<any[]>;
  error$: Observable<Error[]>;

  test1Factory = this.st.createActionFactory<{ test: string }, { data: { tested: string } }>(
    TEST1_TYPE, [], (payload: { test: string }) => timer(2500).pipe(switchMap(async(payload)))
  );

  constructor(
    public st: STService
  ) {
    this.storage();
  }

  storage() {
    class StorageService {
      get(): Observable<any> {
        return defer(() => {
          const entries = {};
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            entries[key] = JSON.parse(localStorage.getItem(key));
          }
          return of(entries);
        });
      }
      save(entries: any): Observable<any> {
        Object.entries(entries).forEach(([key, value]) => localStorage.setItem(key, JSON.stringify(value)));
        return of(entries);
      }
      remove(keys: string[]): Observable<string[]> {
        keys.forEach(key => localStorage.removeItem(key));
        return of(keys);
      }
      clear(): Observable<any> {
        localStorage.clear();
        return of({});
      }
    }

    class StorageFacade {
      actions: {
        getStorage: {
          create: () => ActionFactoryST<any>;
          dispatch: () => void;
        },
        saveStorage: {
          create: (payload: any) => ActionFactoryST<any>;
          dispatch: (payload: any) => void;
        },
        removeStorage: {
          create: (payload: string[]) => ActionFactoryST<string[]>;
          dispatch: (payload: string[]) => void;
        },
        clearStorage: {
          create: () => ActionFactoryST<{}>;
          dispatch: () => void;
        }
      };
      constructor(
        public st: STService,
        public storage: StorageService
      ) {
        interface StorageState {
          loaded: boolean;
          entries: any;
        }
        const actions = this.st.createFeatureStore<StorageState>(
          'storage',
          { loaded: false, entries: null },
          {
            '[Storage Action Type] Get': { async: () => this.storage.get() },
            '[Storage Action Type] Save': { async: (entries: any) => this.storage.save(entries) },
            '[Storage Action Type] Remove': { async: (keys: string[]) => this.storage.remove(keys) },
            '[Storage Action Type] Clear': { async: () => this.storage.clear() },
          },
          (state: StorageState, action: ActionST<any>) => {
            switch (action.type) {
              case asyncResolvedOfST('[Storage Action Type] Get'): {
                const payload = action.payload as any;
                return { ...state, loaded: true, entries: payload };
              }
              case asyncResolvedOfST('[Storage Action Type] Save'): {
                const payload = action.payload as any;
                return { ...state, entries: { ...state.entries, ...payload } };
              }
              case asyncResolvedOfST('[Storage Action Type] Remove'): {
                const payload = action.payload as string[];
                return {
                  ...state,
                  entries: Object.entries(state.entries)
                    .filter(([key]) => !payload.includes(key))
                    .reduce((agg, [key, value]) => ({ ...agg, [key]: value }), {})
                };
              }
              case asyncResolvedOfST('[Storage Action Type] Clear'):
                return { ...state, entries: {} };
              default:
                return state;
            }
          }
        );
        const {
          '[Storage Action Type] Get': getStorage,
          '[Storage Action Type] Save': saveStorage,
          '[Storage Action Type] Remove': removeStorage,
          '[Storage Action Type] Clear': clearStorage,
        } = actions;
        this.actions = { getStorage, saveStorage, removeStorage, clearStorage };
      }
    }

    const storageService = new StorageService;
    const storageFacade = new StorageFacade(this.st, storageService);

    storageFacade.actions.clearStorage.dispatch();

    const actionCorrelation = new ActionCorrelationFactoryST({ type: 'test correlation', initial: true });
    const getStorageAction = storageFacade.actions.getStorage.create();
    getStorageAction.header.correlations.push(actionCorrelation);
    const sub = this.st.lifecycle(getStorageAction).subscribe((action: ActionST<any>) => {
      switch (action.type) {
        case asyncResolvedOfST('[Storage Action Type] Get'): {
          if (action.payload.firstVisit !== false) {
            const saveStorageAction = storageFacade.actions.saveStorage.create({ firstVisit: false });
            saveStorageAction.header.correlations.push({ ...actionCorrelation, initial: false, final: true });
            this.st.store.dispatch(saveStorageAction);
          }
          break;
        }
        case asyncErroredOfST('[Storage Action Type] Get'): {
          break;
        }
        case asyncRequestOfST('[Storage Action Type] Get'):
        case asyncCancelOfST('[Storage Action Type] Get'):
        case asyncCanceledOfST('[Storage Action Type] Get'):
        default:
          break;
      }
      if (action.header.correlations.find(correlation => correlation.type === AsyncReqResCorrelationController.type).final) {
        sub.unsubscribe();
      }
    });
    this.st.store.dispatch(getStorageAction);
  }

  initialize() {


    interface State {
      testCount: number;
      lastTestContent: string;
      lastTestResult: string;
    }
    const initialTest: State = {
      testCount: 0,
      lastTestContent: null,
      lastTestResult: null,
    };
    type ActionsPayload = { test: string }
      | { data: { tested: string } }
      | { error: Error } | void;
    function reduce(state: State, action: { type: string, payload: ActionsPayload }): State {
      switch (action.type) {
        case asyncRequestOfST(TEST1_TYPE): {
          const payload = action.payload as { test: string };
          return {
            ...state,
            testCount: state.testCount + 1,
            lastTestContent: payload.test,
          };
        }
        case asyncResolvedOfST(TEST1_TYPE): {
          const payload = action.payload as { data: { tested: string } };
          return {
            ...state,
            lastTestResult: payload.data.tested,
          };
        }
        case asyncErroredOfST(TEST1_TYPE): {
          const payload = action.payload as { error: Error };
          return {
            ...state,
            lastTestResult: payload.error.message,
          };
        }
        case asyncCanceledOfST(TEST1_TYPE): {
          const payload = action.payload as void;
          return {
            ...state,
            lastTestResult: '',
          };
        }
        case TEST1_TYPE:
        case asyncCancelOfST(TEST1_TYPE):
        default:
          return state;
      }
    }
    this.st.createRawStore<State>('test1', initialTest, reduce);
    setTimeout(() => this.requestTest1(), 1000);

    interface Test2State {
      test: string;
    }
    const actionSet = this.st.createStore<Test2State>('test2', { test: null }, { test: (state: string, action) => action.payload });
    actionSet.test.dispatch('blah');
  }

  requestTest1() {
    const test1 = this.test1Factory.create({ test: 'Hello Dev' });
    const test1Lifecycle$ = this.st.lifecycle(test1);

    test1Lifecycle$.pipe(
      tap((lifestep: ActionST<any>) => console.log('Got Test 1 life step: ', lifestep)),
    ).subscribe();

    this.st.store.dispatch(test1);
    setTimeout(() => this.st.store.dispatch(asyncCancelFactoryST(test1)), 1000);
  }

}
