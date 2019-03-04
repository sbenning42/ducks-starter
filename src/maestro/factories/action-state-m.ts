import { ActionM } from '../interfaces/action-m';
import { ActionStateM } from '../interfaces/action-state-m';
import { BaseAsyncActionStateM } from '../models/base-async-action-state-m';
import { BaseActionStateM } from '../models/base-action-state-m';

export function actionStateMFactory(action: ActionM): ActionStateM {
  if (action.isAsync) {
    return new BaseAsyncActionStateM(action);
  } else {
    return new BaseActionStateM(action);
  }
}
