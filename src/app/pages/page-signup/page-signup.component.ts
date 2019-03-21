import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserDuck } from 'src/app/ducks-v-2/user.duck';
import { AppDuck } from 'src/app/ducks-v-2/app.duck';

@Component({
  selector: 'app-page-signup',
  templateUrl: './page-signup.component.html',
  styleUrls: ['./page-signup.component.css']
})
export class PageSignupComponent implements OnInit {

  userForm: FormGroup;
  emailCtrl: FormControl;
  passwordCtrl: FormControl;

  constructor(public user: UserDuck, public app: AppDuck) {
    this.makeForm();
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
    const signup = this.user.actions.register.createRequest({
      email: this.emailCtrl.value,
      password: this.passwordCtrl.value,
    }, ['loadasync']);
    this.user.resolved(signup).subscribe(() => {
      this.app.actions.goto.dispatch({
        target: '/signin',
        data: {
          userFormValue: this.userForm.value
        }
      });
    });
    this.user.dispatch(signup);
  }

}
