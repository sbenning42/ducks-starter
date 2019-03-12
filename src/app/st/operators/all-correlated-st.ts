import { ActionST } from '../interfaces/action-st';
import { Observable } from 'rxjs';
import { ActionCorrelationST } from '../interfaces/action-correlation-st';
import { filter, map } from 'rxjs/operators';
import { isST } from './is-st';

export function allCorrelatedST(...correlationRefs: ActionCorrelationST[]) {
  const pluckCorrelationId = (correlation: ActionCorrelationST) => ({ id: correlation.id, correlation });
  const idRefs = correlationRefs.map(pluckCorrelationId);
  const pluckCorrelationIds = (action: ActionST<any>) => ({ correlationIds: action.header.correlations.map(pluckCorrelationId), action });
  const findIdInIdRefs = ({ id }: { id: string, correlation: ActionCorrelationST }) => idRefs.some(ref => ref.id === id);
  return (actions$: Observable<any>) => actions$.pipe(
    isST(),
    map(pluckCorrelationIds),
    filter((
      correlations: { action: ActionST<any>, correlationIds: { id: string, correlation: ActionCorrelationST }[] }
    ) => correlations.correlationIds.some(findIdInIdRefs)),
    map((
      correlations: { action: ActionST<any>, correlationIds: { id: string, correlation: ActionCorrelationST }[] }
    ) => correlations.action),
  );
}
