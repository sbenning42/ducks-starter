import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserDuck } from '../ducks-v-2/user.duck';

@Injectable({
  providedIn: 'root'
})
export class UserGuard implements CanActivate {
  constructor(public user: UserDuck) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.user.store.authentified.pipe(
      tap(canActivate => console.log('UserGuard@canActivate: ', canActivate))
    );
  }
}