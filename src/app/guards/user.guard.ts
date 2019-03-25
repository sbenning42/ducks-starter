import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthStore } from 'src/z-stores/auth-z-store';

@Injectable({
  providedIn: 'root'
})
export class UserGuard implements CanActivate {
  constructor(public auth: AuthStore) {}
  canActivate() {
    return this.auth.zstore.authenticated;
  }
}