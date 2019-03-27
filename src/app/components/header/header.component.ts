import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthStore } from 'src/z-stores/auth-z-store';
import { AppStore } from '../../../z-stores/app-z-store';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  authentified$: Observable<boolean> = this.auth.zstore.authenticated;

  constructor(
    public auth: AuthStore,
    public app: AppStore
  ) { }

  ngOnInit() {
  }

  goto(target: string) {
    this.app.zstore.goto.dispatchRequest({ target });
  }

}
