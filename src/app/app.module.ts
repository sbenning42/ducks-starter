import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { MaestroModule } from 'src/maestro/maestro.module';
import { RouterModule } from '@angular/router';
import { appRoutes } from './app.routes';
import { StoresModule } from './stores/stores.module';
import { PageHomeComponent } from './pages/page-home/page-home.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { PageContactComponent } from './pages/page-contact/page-contact.component';
import { PageAboutComponent } from './pages/page-about/page-about.component';
import { Ducks } from 'src/ducks/ducks';
import { StorageDuck } from 'src/ducks/storage/storage.duck';
import { AppDuck } from 'src/ducks/app/app.duck';

@NgModule({
  declarations: [
    AppComponent,
    PageHomeComponent,
    PageNotFoundComponent,
    PageContactComponent,
    PageAboutComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes),
    MaestroModule,
    StoresModule
  ],
  providers: [
    Ducks,
    StorageDuck,
    AppDuck,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
