import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { map } from 'rxjs/operators';
import { StorageStore } from 'src/z-stores/storage-z-store';

@Injectable({
  providedIn: 'root'
})
export class FirstTimeGuard implements CanActivate {
  constructor(public storage: StorageStore) {}
  canActivate() {
    return this.storage.zstore.entries.pipe(
      map(entries => entries && entries.firstVisit === false),
    );
  }
}