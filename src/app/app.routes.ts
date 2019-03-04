import { Routes } from '@angular/router';
import { PageHomeComponent } from './pages/page-home/page-home.component';
import { PageAboutComponent } from './pages/page-about/page-about.component';
import { PageContactComponent } from './pages/page-contact/page-contact.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';

export const appRoutes: Routes = [
  { path: 'home', component: PageHomeComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'about', component: PageAboutComponent },
  { path: 'contact', component: PageContactComponent },
  { path: '**', component: PageNotFoundComponent },
];
