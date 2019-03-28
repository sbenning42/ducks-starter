import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthStore } from 'src/z-stores/auth-z-store';
import { AuthUser } from 'src/z-configs/auth-z-config';
import { AppStore } from 'src/z-stores/app-z-store';
import { APP } from 'src/z-configs/app-z-config';

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
    this.auth.zstore.register.dispatchRequest(user, [
      'PageSigninComponent@signup',
      { type: APP.GOTO_CORREL, data: 'signin' }
    ]);
  }

}
