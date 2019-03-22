import { Injectable } from '@angular/core';
import { SYMBOL } from 'src/ducks-v-2/enums/symbol';
import { Duck } from 'src/ducks-v-2/classes/duck';
import { DucksService } from 'src/ducks-v-2/ducks.service';
import { StoreConfig } from 'src/ducks-v-2/classes/store-config';
import { DuckInjector } from 'src/ducks-v-2/interfaces/duck-injector';
import { ActionsSchema } from 'src/ducks-v-2/interfaces/actions-schema';
import { Action } from 'src/ducks-v-2/classes/action';
import { ActionType } from 'src/ducks-v-2/types/action.type';
import { ActionConfig } from 'src/ducks-v-2/classes/action-config';

export const productSelector = 'product';

export interface ProductsState {
    // : ;
}

export const initialProductsState: ProductsState = {
    // : ,
};

export interface ProductsInjector extends DuckInjector {
// : ;
}

export interface ProductsSchema extends ActionsSchema {
    // : ActionType<, >,
}

export type ProductsPayloads = undefined // |  | ;

export function productReducer(
    state: ProductsState = initialProductsState,
    { type, payload }: Action<ProductsPayloads>
): ProductsState {
    switch (type) {
        // case :
        //     return { ...state,  };
        default:
            return state;
    }
}

@Injectable()
export class ProductsDuck extends Duck<ProductsState, ProductsSchema, ProductsInjector> {
    constructor(
        public ducks: DucksService,
        // public : ,
    ) {
        super(
            { ducks, },// , },
            {
                // : new ActionConfig(, {
                //     isAsync: true,
                //     handler: (payload: ) => of({} as ),
                //     correlations: [
                //         '@product-sample-1',
                //         { type: '@product-sample-2', data: { sample: 'sampled', for: SYMBOL.REQUEST } },
                // ]
                // }),
            },
            new StoreConfig(productSelector, initialProductsState, productReducer),
        );
    }
}
