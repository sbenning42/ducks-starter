import { BaseAsyncActionM } from '../abstracts/base-async-action-m';
import { BaseActionM } from '../abstracts/base-action-m';
import { ActionM } from '../interfaces/action-m';

function factory<PA = void>() {
  return (definition: any) => {
    if (definition.isAsync) {
      return class extends BaseAsyncActionM<PA> {
        type = definition.type;
        isAsync = true;
        loading = definition.loading;
        loadingData = definition.loadingData;
      };
    } else {
      return class extends BaseActionM<PA> {
        type = definition.type;
        isAsync = false;
      };
    }
  };
}

export function __factories<
  PA0 = void,
  PA1 = void,
  PA2 = void,
  PA3 = void,
  PA4 = void,
  PA5 = void,
  PA6 = void,
  PA7 = void,
  PA8 = void,
  PA9 = void,
  PA10 = void,
  PA11 = void,
  PA12 = void,
  PA13 = void,
  PA14 = void,
  PA15 = void,
  PA16 = void,
  PA17 = void,
  PA18 = void,
  PA19 = void,
  PA20 = void,
  PA21 = void,
  PA22 = void,
  PA23 = void,
  PA24 = void,
  PA25 = void,
  PA26 = void,
  PA27 = void,
  PA28 = void,
  PA29 = void,
  PA30 = void,
  PA31 = void,
  PA32 = void,
>() {
  return [
    factory<PA0>(),
    factory<PA1>(),
    factory<PA2>(),
    factory<PA3>(),
    factory<PA4>(),
    factory<PA5>(),
    factory<PA6>(),
    factory<PA7>(),
    factory<PA8>(),
    factory<PA9>(),
    factory<PA10>(),
    factory<PA11>(),
    factory<PA12>(),
    factory<PA13>(),
    factory<PA14>(),
    factory<PA15>(),
    factory<PA16>(),
    factory<PA17>(),
    factory<PA18>(),
    factory<PA19>(),
    factory<PA20>(),
    factory<PA21>(),
    factory<PA22>(),
    factory<PA23>(),
    factory<PA24>(),
    factory<PA25>(),
    factory<PA26>(),
    factory<PA27>(),
    factory<PA28>(),
    factory<PA29>(),
    factory<PA30>(),
    factory<PA31>(),
    factory<PA32>(),
  ];
}
