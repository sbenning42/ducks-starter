import { Injectable } from '@angular/core';
import { Observable, defer, of } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { mergeMap, map, catchError } from 'rxjs/operators';
import { ActionCorrelationST } from 'src/app/st/interfaces/action-correlation-st';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(public actions$: Actions) { }

  @Effect({ dispatch: true })
  get$ = this.actions$.pipe(
    ofType('[Storage Action Type] Get'),
    mergeMap((action: { type: string, correlations: ActionCorrelationST[] }) => this.get().pipe(
      map((payload: any) => ({
        payload,
        type: '[Storage Action Type] Get @ Resolved',
        correlations: [action.correlations.find(correlation => correlation.type === 'async')]
      })),
      catchError((error: Error) => of({
        payload: error,
        type: '[Storage Action Type] Get @ Errored',
        correlations: [action.correlations.find(correlation => correlation.type === 'async')]
      })),
    ))
  );

  @Effect({ dispatch: true })
  save$ = this.actions$.pipe(
    ofType('[Storage Action Type] Save'),
    mergeMap((action: { type: string, payload: any, correlations: ActionCorrelationST[] }) => this.save(action.payload).pipe(
      map((payload: any) => ({
        payload,
        type: '[Storage Action Type] Save @ Resolved',
        correlations: [action.correlations.find(correlation => correlation.type === 'async')]
      })),
      catchError((error: Error) => of({
        payload: error,
        type: '[Storage Action Type] Save @ Errored',
        correlations: [action.correlations.find(correlation => correlation.type === 'async')]
      })),
    ))
  );

  get(): Observable<any> {
    return defer(() => {
      const entries = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        entries[key] = JSON.parse(localStorage.getItem(key));
      }
      return of(entries);
    });
  }
  save(entries: any): Observable<any> {
    Object.entries(entries).forEach(([key, value]) => localStorage.setItem(key, JSON.stringify(value)));
    return of(entries);
  }
  remove(keys: string[]): Observable<string[]> {
    keys.forEach(key => localStorage.removeItem(key));
    return of(keys);
  }
  clear(): Observable<any> {
    localStorage.clear();
    return of({});
  }
}
