import { Injectable } from '@angular/core';
import { Observable, throwError, of, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SampleAsyncTaskResult } from './sample.types';

@Injectable()
export class SampleService {
  get(): Observable<SampleAsyncTaskResult> {
    const rate = 0.1;
    const delayTime = 5000;
    const response = { data: { test: 'test' } };
    const chooseResp = () =>
      Math.random() < rate
        ? throwError(new Error('Random Error'))
        : of(response);
    return timer(delayTime).pipe(switchMap(chooseResp));
  }
}
