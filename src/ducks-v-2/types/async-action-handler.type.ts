import { ActionType } from './action.type';
import { Observable } from 'rxjs';

export type AsyncActionHandlerType<Type extends ActionType<any, any>> = Type['0'] extends undefined
    ? () => Observable<Type['1']>
    : (payload: Type['0']) => Observable<Type['1']>;
