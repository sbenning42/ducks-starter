import { Component, OnInit } from '@angular/core';
import { AppBone } from 'src/app/bones/app.bone';
import { UserBone } from 'src/app/bones/user.bone';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  authentified$: Observable<boolean> = this.user.selectors.authentified;

  constructor(public app: AppBone, public user: UserBone) { }

  ngOnInit() {
  }

  goto(target: string) {
    this.app.actions.goto.dispatch({ target });
  }

}
