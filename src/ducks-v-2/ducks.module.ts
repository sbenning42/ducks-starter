import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DucksService } from './ducks.service';
import { EffectsModule } from '@ngrx/effects';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    EffectsModule.forFeature([DucksService]),
  ],
  providers: [DucksService]
})
export class Ducks2Module { }
