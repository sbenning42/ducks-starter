import { ActionCorrelationST } from '../interfaces/action-correlation-st';
import { ActionCorrelationFactoryST } from './action-correlation-factory-st';

export class AsyncReqResCorrelationController {
  static type = '[Action Correlation] Async Request / Response';
  create(): ActionCorrelationST {
    return new class AsyncReqResCorrelation extends ActionCorrelationFactoryST {
      constructor() {
        super({ type: AsyncReqResCorrelationController.type, initial: true });
      }
    }();
  }
}
