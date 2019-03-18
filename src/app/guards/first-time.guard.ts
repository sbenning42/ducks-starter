import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { StorageDuck } from '../ducks/storage.duck';

@Injectable({
  providedIn: 'root'
})
export class FirstTimeGuard implements CanActivate {
  constructor(public storage: StorageDuck) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.storage.storeManager.selectors.entries.pipe(
      map(entries => !!entries && entries.firstVisit === false),
      tap(canActivate => console.log('FirstTimeGuard@canActivate: ', canActivate))
    );
  }
}