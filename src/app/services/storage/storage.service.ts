import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private entries: any = {};

  constructor() { }

  private getAll() {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      this.entries[key] = localStorage.getItem(key);
    }
  }

  private
}
