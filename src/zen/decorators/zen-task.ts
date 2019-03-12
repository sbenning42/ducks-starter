import { ZenTaskConfig } from '../interfaces/zen-task-config';

export function ZenTaskDec(config: ZenTaskConfig) {
  return function _ZenTaskDec(constructor: { new(...args: any[]): any }) {
    return class extends constructor {
      type = config.type;
    };
  };
}
