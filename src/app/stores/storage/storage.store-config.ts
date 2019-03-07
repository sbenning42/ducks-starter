import { Injectable } from "@angular/core";
import { BaseStoreConfig } from "../../../maestro/factories/base-store-m";
import { StorageService } from "../../services/storage/storage.service";
import { ActionM } from "../../../maestro/interfaces/action-m";
import { responseType } from "../../../maestro/factories/base-types";
import { BaseResponseActionM } from "../../../maestro/models/base-response-action-m";

export interface StorageState {
  loaded: boolean;
  entries: any;
}
export enum STORAGE_ACTION_TYPE {
  GET_ALL = '[STORAGE ACTION TYPE] GET_ALL',
  SAVE = '[STORAGE ACTION TYPE] SAVE',
  REMOVE = '[STORAGE ACTION TYPE] REMOVE',
  CLEAR = '[STORAGE ACTION TYPE] CLEAR',
}

@Injectable()
export class StorageStoreConfig implements BaseStoreConfig<StorageState> {
  selector = 'storage';
  initial = { loaded: false, entries: null };
  actionDefinitions = [
    {
      name: 'getAll',
      type: STORAGE_ACTION_TYPE.GET_ALL,
      isAsync: true,
      loading: true,
      loadingData: { message: 'Loading Storage ...' },
    },
    {
      name: 'save',
      type: STORAGE_ACTION_TYPE.SAVE,
      isAsync: true,
      loading: true,
      loadingData: { message: 'Saving Storage ...' },
    },
    {
      name: 'remove',
      type: STORAGE_ACTION_TYPE.REMOVE,
      isAsync: true,
      loading: true,
      loadingData: { message: 'Removing Storage ...' },
    },
    {
      name: 'clear',
      type: STORAGE_ACTION_TYPE.CLEAR,
      isAsync: true,
      loading: true,
      loadingData: { message: 'Clearing Storage ...' },
    },
  ];
  reducer = (state: StorageState, action: ActionM): StorageState => {
    switch (action.type) {
      case responseType(STORAGE_ACTION_TYPE.GET_ALL):
        return { ...state, loaded: true, entries: action.payload };
      case responseType(STORAGE_ACTION_TYPE.SAVE):
        return { ...state, entries: { ...(state.entries || {}), ...action.payload } };
   //   case responseType(STORAGE_ACTION_TYPE.REMOVE):
   //     return { ...state, entries: Object.keys(state.entries || {}).filter((key: string) => !(action as any as BaseResponseActionM).action.payload.keys.includes(key)).reduce((agg: any, key: string) => ({ ...agg, [key]: state.entries[key] }), {}) };
      case responseType(STORAGE_ACTION_TYPE.CLEAR):
        return { ...state, entries: {} };
      default:
        return state;
    }
  }
  constructor(public storage: StorageService) {}
}
