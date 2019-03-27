import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthStore } from 'src/z-stores/auth-z-store';
import { AuthUser } from 'src/z-configs/auth-z-config';
import { Z_SYMBOL } from 'src/z/enums';
import { AppStore } from 'src/z-stores/app-z-store';

@Component({
  selector: 'app-page-signup',
  templateUrl: './page-signup.component.html',
  styleUrls: ['./page-signup.component.css']
})
export class PageSignupComponent implements OnInit {

  userForm: FormGroup;
  emailCtrl: FormControl;
  passwordCtrl: FormControl;

  constructor(
    public app: AppStore,
    public auth: AuthStore,
  ) {
  }

  ngOnInit() {
    this.makeForm();
  }

  private makeForm() {
    this.emailCtrl = new FormControl('', [Validators.required]);
    this.passwordCtrl = new FormControl('', [Validators.required]);
    this.userForm = new FormGroup({
      emailCtrl: this.emailCtrl,
      passwordCtrl: this.passwordCtrl
    });
  }

  signup() {
    if (this.userForm.invalid) {
      return ;
    }
    const user: Partial<AuthUser> = { email: this.emailCtrl.value, password: this.passwordCtrl.value };
    const register = this.auth.zstore.register.request(user, ['PageSigninComponent@signup']);
    this.auth.finish(register).subscribe(({ action, status }) => {
      if (status === Z_SYMBOL.RESOLVE) {
        const data = { user: action.payload };
        this.app.zstore.goto.dispatchRequest({ target: '/signin', data }, ['PageSigninComponent@signup']);
      }
    });
    this.auth.dispatch(register);
  }

}
