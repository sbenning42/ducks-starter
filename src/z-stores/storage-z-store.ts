import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { Actions } from "@ngrx/effects";
import { StorageService } from "src/app/services/storage/storage.service";
import { StorageState, StorageSchema, storageSelector, storageConfigFactory } from "src/z-configs/storage-z-config";
import { ZStore, Action } from "src/z";

@Injectable()
export class StorageStore extends ZStore<StorageState, StorageSchema> {
    constructor(
        public store: Store<any>,
        public actions$: Actions<Action>,
        public storage: StorageService,
    ) {
        super(store, actions$, storageSelector, storageConfigFactory(storage));
    }
}
