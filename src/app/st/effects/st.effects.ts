import { Injectable } from '@angular/core';
import { STService } from '../services/st.service';
import { Effect } from '@ngrx/effects';
import { handleAsyncReqResCorrelationST } from '../operators/handle-async-req-res-correlation-st';

@Injectable()
export class STEffects {
  constructor(
    public st: STService
  ) { }
  @Effect({ dispatch: true })
  asyncReqResCorrelation$ = this.st.actions$.pipe(
    handleAsyncReqResCorrelationST<any, any>(this.st.getAsyncReqResMapGetter()),
  );
}
