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
import { appRoutes } from './app.routes';
import { PageHomeComponent } from './pages/page-home/page-home.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { PageContactComponent } from './pages/page-contact/page-contact.component';
import { PageAboutComponent } from './pages/page-about/page-about.component';
import { StorageService } from './services/storage/storage.service';
import { BeagleModule } from '../beagle/beagle.module';
import { StorageBone } from './bones/storage.bone';
import { AppBone } from './bones/app.bone';
import { MockUserService } from './services/mock-user/mock-user.service';
import { UserBone } from './bones/user.bone';
import { PageTutorialComponent } from './pages/page-tutorial/page-tutorial.component';
import { PageSigninComponent } from './pages/page-signin/page-signin.component';
import { PageSignupComponent } from './pages/page-signup/page-signup.component';
import { HeaderComponent } from './components/header/header.component';

@NgModule({
  declarations: [
    AppComponent,
    PageHomeComponent,
    PageNotFoundComponent,
    PageContactComponent,
    PageAboutComponent,
    PageTutorialComponent,
    PageSigninComponent,
    PageSignupComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes),
    StoreModule.forRoot({}),
    EffectsModule.forRoot([
      UserBone,
      AppBone
    ]),
    StoreDevtoolsModule.instrument({ maxAge: 25 }),
    StoreRouterConnectingModule.forRoot(),
    BeagleModule,
  ],
  providers: [
    StorageService,
    MockUserService,
    StorageBone,
    UserBone,
    AppBone,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
