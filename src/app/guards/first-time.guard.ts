import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { StorageBone } from '../bones/storage.bone';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirstTimeGuard implements CanActivate {
  constructor(public storage: StorageBone) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.storage.selectors.entries.pipe(
      map(entries => !!entries && entries.firstVisit === false),
      tap(canActivate => console.log('FirstTimeGuard@canActivate: ', canActivate))
    );
  }
}