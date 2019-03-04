import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStoreConfig } from './app/app.store-config';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    // StoreModule.forFeature(appStateSelector, appStateReducer),
    // EffectsModule.forFeature([AppEffect])
  ],
  providers: [
    AppStoreConfig
    // AppEffect,
    // AppFacade,
  ]
})
export class StoresModule { }
