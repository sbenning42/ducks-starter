import { Observable } from 'rxjs';
import { isST } from './is-st';
import { filter } from 'rxjs/operators';
import { ActionST } from '../interfaces/action-st';
import { ActionCorrelationST } from '../interfaces/action-correlation-st';

export function initialCorrelatedTo(type: string) {
  const isInitialCorrelatedTo = (thisType: string) => (correlation: ActionCorrelationST) =>
    correlation.type === thisType && correlation.initial === true;
  return (actions$: Observable<any>) => actions$.pipe(
    isST(),
    filter((action: ActionST<any>) => action.header ? action.header.correlations.some(isInitialCorrelatedTo(type)) : (action as any).correlations.some(isInitialCorrelatedTo(type)))
  );
}
