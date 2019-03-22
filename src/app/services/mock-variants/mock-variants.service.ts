import { Injectable } from '@angular/core';
import { EntityState, createEntityAdapter, Update } from '@ngrx/entity';
import { timer, throwError, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { uuid } from 'src/ducks-v-2/tools/uuid';

export interface MockVariant {
  id: string;
  name: string;
}

const variantsAdapter = createEntityAdapter<MockVariant>();

@Injectable({
  providedIn: 'root'
})
export class MockVariantsService {

  variants: EntityState<MockVariant> = variantsAdapter.getInitialState();

  constructor() { }

  private async<T>(fn: () => T) {
    return timer(2500).pipe(
      switchMap(() => Math.random() < 0.1 ? throwError(new Error('Random')) : of(fn())),
    );
  }

  getAll() {
    return this.async(() => {
      return Object.values(this.variants.entities);
    });
  }
  getId(id: string) {
    return this.async(() => {
      return this.variants.entities[id];
    });
  }
  create(variant: Partial<MockVariant>) {
    return this.async(() => {
      const _variant: MockVariant = {
        id: uuid(),
        ...variant,
      } as MockVariant;
      this.variants = variantsAdapter.addOne(_variant, this.variants);
      return _variant;
    });
  }
  update(update: Update<MockVariant>) {
    return this.async(() => {
      this.variants = variantsAdapter.updateOne(update, this.variants);
      return this.variants.entities[update.id];
    });
  }
  delete(id: string) {
    return this.async(() => {
      this.variants = variantsAdapter.removeOne(id, this.variants);
      return id;
    });
  }
}
