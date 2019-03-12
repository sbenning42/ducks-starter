import { Injectable } from '@angular/core';
import { FluxService } from 'src/flux/services/flux.service';
import { SampleSyncTask } from './sample-sync.task';
import { SampleAsyncTask } from './sample-async.task';
import { UTFluxDecoratedTask } from 'src/flux/interfaces/t-flux-decorated-task';
import { IFluxDecoredSyncTask } from 'src/flux/interfaces/i-flux-decored-sync-task';
import { SampleSyncTaskPayload, SampleAsyncTaskResult } from './sample.types';
import { IFluxDecoredAsyncTask } from 'src/flux/interfaces/i-flux-decored-async-task';

@Injectable()
export class Sample1 {
  syncTask: IFluxDecoredSyncTask<SampleSyncTaskPayload>;
  asyncTask: IFluxDecoredAsyncTask<void, SampleAsyncTaskResult>;
  constructor(
    public flux: FluxService,
    syncTask: SampleSyncTask,
    asyncTask: SampleAsyncTask,
  ) {
    flux.registerTasks(
      syncTask as UTFluxDecoratedTask<SampleSyncTaskPayload>,
      asyncTask as UTFluxDecoratedTask<void, SampleAsyncTaskResult>
    );
    this.syncTask = syncTask as IFluxDecoredSyncTask<SampleSyncTaskPayload>;
    this.asyncTask = asyncTask as IFluxDecoredAsyncTask<void, SampleAsyncTaskResult>;
  }
}
