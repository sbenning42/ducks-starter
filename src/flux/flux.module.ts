import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { FluxService } from './services/flux.service';
import { SampleSyncTask } from './samples/sample-1/sample-sync.task';
import { SampleAsyncTask } from './samples/sample-1/sample-async.task';
import { Sample1 } from './samples/sample-1/sample-1';
import { SampleService } from './samples/sample-1/sample.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    EffectsModule.forFeature([FluxService])
  ],
  providers: [
    FluxService,
    SampleService,
    SampleSyncTask,
    SampleAsyncTask,
    Sample1
  ]
})
export class FluxModule { }
