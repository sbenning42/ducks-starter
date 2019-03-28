import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { environment } from 'src/environments/environment';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';

import { StorageService } from './services/storage/storage.service';
import { MockUserService } from './services/mock-user/mock-user.service';
import { MockCategoriesService } from './services/mock-categories/mock-categories.service';
import { MockVariantsService } from './services/mock-variants/mock-variants.service';
import { MockProductsService } from './services/mock-products/mock-products.service';

import { StorageStore } from 'src/z-stores/storage-z-store';
import { AuthStore } from 'src/z-stores/auth-z-store';
import { AppStore } from 'src/z-stores/app-z-store';

import { HeaderComponent } from './components/header/header.component';

import { PageHomeComponent } from './pages/page-home/page-home.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { PageContactComponent } from './pages/page-contact/page-contact.component';
import { PageAboutComponent } from './pages/page-about/page-about.component';
import { PageTutorialComponent } from './pages/page-tutorial/page-tutorial.component';
import { PageSigninComponent } from './pages/page-signin/page-signin.component';
import { PageSignupComponent } from './pages/page-signup/page-signup.component';

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
      StorageStore,
      AuthStore,
      AppStore,
    ]),
    StoreDevtoolsModule.instrument({ logOnly: !environment.production }),
    StoreRouterConnectingModule.forRoot(),
  ],
  providers: [
    StorageService,
    MockUserService,
    MockCategoriesService,
    MockProductsService,
    MockVariantsService,
    StorageStore,
    AuthStore,
    AppStore,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
