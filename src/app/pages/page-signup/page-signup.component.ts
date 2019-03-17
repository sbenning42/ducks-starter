import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserBone } from 'src/app/bones/user.bone';
import { AppBone } from 'src/app/bones/app.bone';

@Component({
  selector: 'app-page-signup',
  templateUrl: './page-signup.component.html',
  styleUrls: ['./page-signup.component.css']
})
export class PageSignupComponent implements OnInit {

  userForm: FormGroup;
  emailCtrl: FormControl;
  passwordCtrl: FormControl;

  constructor(public user: UserBone, public app: AppBone) {
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
    const signup = this.user.actions.signup.createRequest({
      email: this.emailCtrl.value,
      password: this.passwordCtrl.value,
    }, ['loadasync']);
    this.user.asyncResolved(signup).subscribe(() => this.app.actions.goto.dispatch({
      target: '/signin',
      data: {
        userFormValue: this.userForm.value
      }
    }));
    this.user.dispatch(signup);
  }

}
