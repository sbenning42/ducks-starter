import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AppDuck } from 'src/app/ducks/app.duck';
import { UserDuck } from 'src/app/ducks/user.duck';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  authentified$: Observable<boolean> = this.user.store.selectors.authentified;

  constructor(public app: AppDuck, public user: UserDuck) { }

  ngOnInit() {
  }

  goto(target: string) {
    this.app.actions.goto.dispatch({ target });
  }

}
