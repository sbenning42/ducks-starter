import { EntityState } from "@ngrx/entity";

export const categoriesSelector = 'CATEGORIES';
export interface Category {
    id: string;
    name: string;
}
export interface CategoryState extends EntityState<Category> {
    loaded: boolean;
}
