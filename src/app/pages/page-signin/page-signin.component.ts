import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthStore } from 'src/z-stores/auth-z-store';
import { AuthCreds } from 'src/z-configs/auth-z-config';
import { AppStore } from 'src/z-stores/app-z-store';
import { RESOLVE } from 'src/z';

@Component({
  selector: 'app-page-signin',
  templateUrl: './page-signin.component.html',
  styleUrls: ['./page-signin.component.css']
})
export class PageSigninComponent implements OnInit {

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

  signin() {
    if (this.userForm.invalid) {
      return ;
    }
    const credentials: AuthCreds = {
      email: this.emailCtrl.value,
      password: this.passwordCtrl.value,
    };
    const authenticate = this.auth.zstore.authenticate.request(credentials, ['PageSigninComponent@signin']);
    this.auth.finish(authenticate).subscribe(({ status }) => {
      if (status === RESOLVE) {
        this.app.zstore.goto.dispatchRequest('/home', ['PageSigninComponent@signin']);
      }
    });
    this.auth.dispatch(authenticate);
  }

}
