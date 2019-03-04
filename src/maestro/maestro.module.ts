import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { MaestroFacade } from './store/maestro.facade';
import {
  maestroStateSelector,
  maestroStateReducer
} from './store/maestro.store';
import { MaestroEffects } from './store/maestro.effects';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forRoot({
      [maestroStateSelector]: maestroStateReducer
    }),
    EffectsModule.forRoot([
      MaestroEffects,
    ]),
    StoreRouterConnectingModule.forRoot(),
    StoreDevtoolsModule.instrument({ maxAge: 25 })
  ],
  declarations: [],
  providers: [
    MaestroFacade,
    MaestroEffects,
  ]
})
export class MaestroModule { }
