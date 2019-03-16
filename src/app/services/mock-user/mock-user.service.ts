import { Injectable } from '@angular/core';
import { timer, throwError, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import * as uuid from 'uuid/v4';

export interface MockUser {
  id: string;
  email: string;
  password: string;
}

const sben = {
  id: uuid(),
  email: 'sben@sben.sben',
  password: 'Sben42Sben'
};

@Injectable({
  providedIn: 'root'
})
export class MockUserService {

  private users: { [id: string]: { user: MockUser, token: string } } = {
    [sben.id]: { user: sben, token: null }
  };
  constructor() { }

  signup(user: Partial<MockUser>) {
    if (!user.email || user.password === undefined || Object.values(this.users).some(_user => _user.user.email === user.email)) {
      return timer(2500).pipe(switchMap(() => throwError(new Error('Cannot create user'))));
    }
    user.id = uuid();
    this.users[user.id] = { user: user as MockUser, token: null };
    return timer(2500).pipe(switchMap(() => of(user as MockUser)));
  }
  signin(credentials: Partial<MockUser>) {
    const user = Object.values(this.users)
      .find(_user => _user.user.email === credentials.email && _user.user.password === credentials.password);
    if (!user) {
      return timer(2500).pipe(switchMap(() => throwError(new Error('Wrong Credentials'))));
    }
    user.token = uuid();
    return timer(2500).pipe(switchMap(() => of(user)));
  }
  signout(id: string) {
    this.users[id].token = null;
    return timer(2500).pipe(switchMap(() => of({})));
  }

}
