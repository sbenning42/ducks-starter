import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { Ducks2Module } from '../ducks-v-2/ducks.module';

import { UserDuck } from './ducks-v-2/user.duck';
import { AppDuck } from './ducks-v-2/app.duck';
import { StorageDuck } from './ducks-v-2/storage.duck';

import { appRoutes } from './app.routes';

import { StorageService } from './services/storage/storage.service';
import { MockUserService } from './services/mock-user/mock-user.service';

import { HeaderComponent } from './components/header/header.component';

import { PageHomeComponent } from './pages/page-home/page-home.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { PageContactComponent } from './pages/page-contact/page-contact.component';
import { PageAboutComponent } from './pages/page-about/page-about.component';
import { PageTutorialComponent } from './pages/page-tutorial/page-tutorial.component';
import { PageSigninComponent } from './pages/page-signin/page-signin.component';
import { PageSignupComponent } from './pages/page-signup/page-signup.component';
import { UiDuck } from './ducks-v-2/ui.duck';
import { MockCategoriesService } from './services/mock-categories/mock-categories.service';
import { MockVariantsService } from './services/mock-variants/mock-variants.service';
import { MockProductsService } from './services/mock-products/mock-products.service';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    PageHomeComponent,
    PageNotFoundComponent,
    PageContactComponent,
    PageAboutComponent,
    PageTutorialComponent,
    PageSigninComponent,
    PageSignupComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes),
    StoreModule.forRoot({}),
    EffectsModule.forRoot([
      UserDuck,
      AppDuck,
    ]),
    StoreDevtoolsModule.instrument({ maxAge: 25 }),
    StoreRouterConnectingModule.forRoot(),
    Ducks2Module
  ],
  providers: [
    StorageService,
    MockUserService,
    MockCategoriesService,
    MockProductsService,
    MockVariantsService,
    StorageDuck,
    UserDuck,
    AppDuck,
    UiDuck,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
