import { Injectable } from '@angular/core';
import { EntityState, createEntityAdapter, Update } from '@ngrx/entity';
import { timer, throwError, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { uuid } from 'src/z';

export interface MockProduct {
  id: string;
  name: string;
}

const productsAdapter = createEntityAdapter<MockProduct>();

@Injectable({
  providedIn: 'root'
})
export class MockProductsService {

  products: EntityState<MockProduct> = productsAdapter.getInitialState();

  constructor() { }

  private async<T>(fn: () => T) {
    return timer(2500).pipe(
      switchMap(() => Math.random() < 0 ? throwError(new Error('Random')) : of(fn())),
    );
  }

  getAll() {
    return this.async(() => {
      return Object.values(this.products.entities);
    });
  }
  getId(id: string) {
    return this.async(() => {
      return this.products.entities[id];
    });
  }
  create(product: Partial<MockProduct>) {
    return this.async(() => {
      const _product: MockProduct = {
        id: uuid(),
        ...product,
      } as MockProduct;
      this.products = productsAdapter.addOne(_product, this.products);
      return _product;
    });
  }
  update(update: Update<MockProduct>) {
    return this.async(() => {
      this.products = productsAdapter.updateOne(update, this.products);
      return this.products.entities[update.id];
    });
  }
  delete(id: string) {
    return this.async(() => {
      this.products = productsAdapter.removeOne(id, this.products);
      return id;
    });
  }
}
