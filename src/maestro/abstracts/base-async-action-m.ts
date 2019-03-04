import { BaseActionM } from './base-action-m';
export abstract class BaseAsyncActionM<P = any> extends BaseActionM<P> {
  isAsync = true;
  constructor(
    public payload: P,
    /* tslint:disable no-unnecessary-initializer */
    public correlationId: string = undefined,
    /* tslint:enable no-unnecessary-initializer */
    public loading: boolean = false,
    public loadingData: any = null,
  ) {
    super(payload);
  }
}
