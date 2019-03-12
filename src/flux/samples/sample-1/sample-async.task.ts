import { Injectable } from '@angular/core';
import { FluxAsyncTask } from 'src/flux/decorators/flux-task';
import { SampleAsyncTaskResult, SampleTaskType } from './sample.types';
import { FluxTaskConfig } from 'src/flux/interfaces/flux-task-config';
import { SampleService } from './sample.service';
import { Observable } from 'rxjs';

@Injectable()
@FluxAsyncTask<void, SampleAsyncTaskResult>({ type: SampleTaskType.async } as FluxTaskConfig)
export class SampleAsyncTask {
  constructor(public sample?: SampleService) {}
  async(): Observable<SampleAsyncTaskResult> {
    return this.sample.get();
  }
}
