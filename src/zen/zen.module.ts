import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZenService } from './zen.service';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { zenStateSelector } from './store/zen.state';
import { zenStateReducer } from './store/zen.reducer';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature(zenStateSelector, zenStateReducer),
    EffectsModule.forFeature([ZenService])
  ],
  providers: [
    ZenService,
  ]
})
export class ZenModule { }
