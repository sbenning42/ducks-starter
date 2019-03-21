import { Observable } from "rxjs";

export type StoreManagerType<State> = {
    [Key in keyof State]: Observable<State[Key]>;
} & {
    _root: Observable<State>;
};
