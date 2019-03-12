import { Observable } from 'rxjs';

export interface AsyncReqResConfigST<T = void, R = void> {
  type: string;
  async: (payload: T) => Observable<R>;
}
