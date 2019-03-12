import { Observable } from 'rxjs';

export interface IFluxAsyncTask<P = void, R = void> {
  async(payload?: P): Observable<R>;
}
