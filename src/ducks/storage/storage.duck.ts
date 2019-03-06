import { Injectable } from '@angular/core';
import { Duck, baseActionSchemaAsyncConfig, responseOf, BaseSchema, Ducks } from '../ducks';
import { defer, timer, of, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';

const delayed = (v: any) => defer(() => timer(2500).pipe(
  switchMap(() => Math.random() < 0 ? throwError(new Error('Random')) : of(v))
));

export interface StorageEntries {
  [key: string]: any;
}
export interface StorageState {
  loaded: boolean;
  entries: StorageEntries;
}
export interface StorageSchema extends BaseSchema {
  getStorage: {
    payload: { keys: string[] } | void;
    result: { entries: StorageEntries, _payload: StorageSchema['getStorage']['payload'] }
  };
  saveStorage: {
    payload: { entries: StorageEntries };
    result: { entries: StorageEntries, _payload: StorageSchema['saveStorage']['payload'] };
  };
  removeStorage: {
    payload: { keys: string[] };
    result: { keys: string[], _payload: StorageSchema['removeStorage']['payload'] }
  };
  clearStorage: {
    payload: void;
    result: { _payload: StorageSchema['clearStorage']['payload'] }
  };
}

function reduceGet(
  type: string, state: StorageState, payload: StorageSchema['getStorage']['result']) {
  return type === responseOf('getStorage') ? { ...state, loaded: true, entries: payload.entries } : state;
}
function asyncGet(storage: StorageDuck) {
  return () => {
    const entries = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      entries[k] = JSON.parse(localStorage.getItem(k));
    }
    return delayed({ entries });
  };
}

function reduceSave(
  type: string, state: StorageState, payload: StorageSchema['saveStorage']['result']) {
  return type === responseOf('saveStorage') ? { ...state, entries: { ...state.entries, ...payload.entries } } : state;
}
function asyncSave(storage: StorageDuck) {
  return (payload: { entries: StorageEntries }) => {
    Object.entries(payload.entries)
      .forEach(([key, value]) => localStorage.setItem(key, JSON.stringify(value)));
    return delayed(payload);
  };
}

function reduceRemove(
  type: string, state: StorageState, payload: StorageSchema['removeStorage']['result']) {
  return type === responseOf('removeStorage')
    ? {
      ...state,
      entries: Object.entries(state.entries)
        .filter(([key]) => !payload._payload.keys.includes(key))
        .reduce((entries: any, [key, value]) => ({ ...entries, [key]: value }), {})
    }
    : state;
}
function asyncRemove(storage: StorageDuck) {
  return (payload: { keys: string[] }) => {
    payload.keys.forEach(key => localStorage.removeItem(key));
    return delayed(payload);
  };
}

function reduceClear(
  type: string, state: StorageState, payload: StorageSchema['clearStorage']['result']) {
  return type === responseOf('clearStorage') ? { ...state, entries: {} } : state;
}
function asyncClear(storage: StorageDuck) {
  return () => {
    localStorage.clear();
    return delayed({});
  };
}

@Injectable()
export class StorageDuck extends Duck<StorageState, { storage: 'storage' }, StorageSchema> {
  constructor(ducks: Ducks) {
    const selector: 'storage' = 'storage';
    const state = { loaded: false, entries: null };
    const schema = {
      getStorage: { ...baseActionSchemaAsyncConfig(), reduce: reduceGet, async: asyncGet },
      saveStorage: { ...baseActionSchemaAsyncConfig(), reduce: reduceSave, async: asyncSave },
      removeStorage: { ...baseActionSchemaAsyncConfig(), reduce: reduceRemove, async: asyncRemove },
      clearStorage: { ...baseActionSchemaAsyncConfig(), reduce: reduceClear, async: asyncClear }
    };
    super({ selector, state, schema });
    ducks.registerDuck(this);
  }
}
