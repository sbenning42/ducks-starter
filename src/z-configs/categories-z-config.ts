import { EntityState, createEntityAdapter, Update } from "@ngrx/entity";
import { BaseSchema } from "src/z";
import { MockCategoriesService } from "../app/services/mock-categories/mock-categories.service";
import { createStoreConfig } from "../z/functions/create-store-config.function";
import { baseAsyncCorrelations } from "./base-async-correlations";
import { map } from "rxjs/operators";

export const categoriesSelector = 'CATEGORIES';
export interface Category {
    id: string;
    name: string;
}
export interface CategoriesState extends EntityState<Category> {
    loaded: boolean;
}
export const categoriesAdapter = createEntityAdapter<Category>({ sortComparer: false });
export const initialCategoriesState: CategoriesState = categoriesAdapter.getInitialState({ loaded: false });
export enum CATEGORIES {
    GET_ALL = '@CATEGORIES/get-all',
    GET_BY_ID = '@CATEGORIES/get-by-id',
    CREATE = '@CATEGORIES/create',
    UPDATE = '@CATEGORIES/update',
    DELETE = '@CATEGORIES/delete',
}
export interface CategoriesSchema extends BaseSchema {
    getAll: [undefined, Category[], true],
    getById: [string, Category, true],
    create: [Partial<Category>, Category, true],
    update: [Update<Category>, Update<Category>, true],
    delete: [string, string, true],
}

export function createCategoriesConfigFactory(
    categories: MockCategoriesService
) {
    return createStoreConfig<CategoriesState, CategoriesSchema>(
        initialCategoriesState,
        {
            getAll: {
                type: CATEGORIES.GET_ALL,
                async: true,
                handler: () => categories.getAll(),
                correlations: baseAsyncCorrelations('', ''),
                reducers: {
                    resolve: (state, payload) => categoriesAdapter.addAll(payload, { ...state, loaded: true }),
                }
            },
            getById: {
                type: CATEGORIES.GET_BY_ID,
                async: true,
                handler: payload => categories.getId(payload),
                correlations: baseAsyncCorrelations('', ''),
            },
            create: {
                type: CATEGORIES.CREATE,
                async: true,
                handler: payload => categories.create(payload),
                correlations: baseAsyncCorrelations('', ''),
                reducers: {
                    resolve: (state, payload) => categoriesAdapter.addOne(payload, { ...state }),
                }
            },
            update: {
                type: CATEGORIES.UPDATE,
                async: true,
                handler: payload => categories.update(payload).pipe(map(() => payload)),
                correlations: baseAsyncCorrelations('', ''),
                reducers: {
                    resolve: (state, payload) => categoriesAdapter.updateOne(payload, { ...state }),
                }
            },
            delete: {
                type: CATEGORIES.DELETE,
                async: true,
                handler: payload => categories.delete(payload).pipe(map(() => payload)),
                correlations: baseAsyncCorrelations('', ''),
                reducers: {
                    resolve: (state, payload) => categoriesAdapter.removeOne(payload, { ...state }),
                }
            }
        }
    );
}
