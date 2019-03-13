import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ActionST } from '../interfaces/action-st';

export function isST() {
  return (actions$: Observable<any>) => actions$.pipe(
    filter((action) => action.type && (action.correlations || (action.header && action.header.correlations))),
    /*filter((action: any) => !!action.header),
    filter((action: any) => !!action.header.id && typeof(action.header.id) === 'string'),
    filter((action: any) => !!action.header.type && typeof (action.header.type) === 'string'),
    map((action: any) => action as ActionST<any>)
    */
  );
}
