import { Routes } from '@angular/router';
import { PageHomeComponent } from './pages/page-home/page-home.component';
import { PageAboutComponent } from './pages/page-about/page-about.component';
import { PageContactComponent } from './pages/page-contact/page-contact.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { PageSigninComponent } from './pages/page-signin/page-signin.component';
import { PageSignupComponent } from './pages/page-signup/page-signup.component';
import { PageTutorialComponent } from './pages/page-tutorial/page-tutorial.component';
import { FirstTimeGuard } from './guards/first-time.guard';
import { UserGuard } from './guards/user.guard';

export const appRoutes: Routes = [
  { path: 'tutorial', component: PageTutorialComponent },
  { path: '', redirectTo: '/tutorial', pathMatch: 'full' },
  { path: 'signin', component: PageSigninComponent, canActivate: [FirstTimeGuard] },
  { path: 'signup', component: PageSignupComponent, canActivate: [FirstTimeGuard] },
  { path: 'about', component: PageAboutComponent, canActivate: [FirstTimeGuard] },
  { path: 'contact', component: PageContactComponent, canActivate: [FirstTimeGuard] },
  { path: 'home', component: PageHomeComponent, canActivate: [FirstTimeGuard, UserGuard] },
  { path: '**', component: PageNotFoundComponent },
];
