import { Injectable } from '@angular/core';
import { FluxSyncTask } from 'src/flux/decorators/flux-task';
import { SampleSyncTaskPayload, SampleTaskType } from './sample.types';
import { FluxTaskConfig } from 'src/flux/interfaces/flux-task-config';

@Injectable()
@FluxSyncTask<SampleSyncTaskPayload>({ type: SampleTaskType.sync } as FluxTaskConfig)
export class SampleSyncTask {
  constructor() {}
  sync(payload: SampleSyncTaskPayload) {
    console.log(...payload.messages);
  }
}
