import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { STService } from './services/st.service';
import { STEffects } from './effects/st.effects';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature('empty', (s: {}) => s),
    EffectsModule.forFeature([
      STEffects
    ])
  ],
  providers: [
    STService,
    STEffects,
  ]
})
export class STModule { }
