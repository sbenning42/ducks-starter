import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { Actions, ofType } from "@ngrx/effects";
import { Observable, of, defer } from "rxjs";
import { mergeMap, takeUntil, map, catchError, take } from "rxjs/operators";
import { Action } from "./classes";

@Injectable()
export class ZService {

    constructor(
        public store: Store<any>,
        public actions$: Actions<Action<any>>,
    ) {}

}
