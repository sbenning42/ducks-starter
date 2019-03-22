import { Injectable } from "@angular/core";
import { Duck } from "src/ducks-v-2/classes/duck";
import { DucksService } from "src/ducks-v-2/ducks.service";
import { StoreConfig } from "src/ducks-v-2/classes/store-config";
import { EntityState, createEntityAdapter } from "@ngrx/entity";
import { DuckInjector } from "src/ducks-v-2/interfaces/duck-injector";
import { MockCategoriesService } from "../services/mock-categories/mock-categories.service";
import { StorageDuck } from "./storage.duck";
import { ActionsSchema } from "src/ducks-v-2/interfaces/actions-schema";
import { Action } from "src/ducks-v-2/classes/action";

export interface Category {
    id: string;
    name: string;
}

export const categoriesSelector = 'categories';

export interface CategoriesState extends EntityState<Category> {
    loaded: boolean;
}

export const categoriesAdapter = createEntityAdapter<Category>();

export const initialCategoriesState: CategoriesState = categoriesAdapter.getInitialState({ loaded: false });

export interface CategoriesInjector extends DuckInjector {
    categories: MockCategoriesService,
    storage: StorageDuck,
}

export interface CategoriesSchema extends ActionsSchema {

}

export type CategoriesPayloads = undefined;

export function categoriesReducer(
    state: CategoriesState = initialCategoriesState,
    { type, payload }: Action<CategoriesPayloads>
): CategoriesState {
    switch (type) {
        default:
            return state;
    }
}

@Injectable()
export class CategoriesDuck extends Duck<CategoriesState, CategoriesSchema, CategoriesInjector> {
    constructor(
        public ducks: DucksService,
        public storage: StorageDuck,
        public categories: MockCategoriesService,
    ) {
        super(
            { ducks, storage, categories },
            {},
            new StoreConfig(categoriesSelector, initialCategoriesState, categoriesReducer),
        );
    }
}