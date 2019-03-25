import { Injectable } from '@angular/core';
import { EntityState, createEntityAdapter, Update } from '@ngrx/entity';
import { timer, throwError, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { uuid } from 'src/ducks-v-2/tools/uuid';

export interface MockCategory {
  id: string;
  name: string;
}

const categoriesAdapter = createEntityAdapter<MockCategory>();

@Injectable({
  providedIn: 'root'
})
export class MockCategoriesService {

  categories: EntityState<MockCategory> = categoriesAdapter.getInitialState();

  constructor() { }

  private async<T>(fn: () => T) {
    return timer(2500).pipe(
      switchMap(() => Math.random() < 0 ? throwError(new Error('Random')) : of(fn())),
    );
  }

  getAll() {
    return this.async(() => {
      return Object.values(this.categories.entities);      
    });
  }
  getId(id: string) {
    return this.async(() => {
      return this.categories.entities[id];
    });
  }
  create(category: Partial<MockCategory>) {
    return this.async(() => {
      const _category: MockCategory = {
        id: uuid(),
        ...category,
      } as MockCategory;
      this.categories = categoriesAdapter.addOne(_category, this.categories);
      return _category;
    });
  }
  update(update: Update<MockCategory>) {
    return this.async(() => {
      this.categories = categoriesAdapter.updateOne(update, this.categories);
      return this.categories.entities[update.id];
    });
  }
  delete(id: string) {
    return this.async(() => {
      this.categories = categoriesAdapter.removeOne(id, this.categories);
      return id;
    });
  }
}
