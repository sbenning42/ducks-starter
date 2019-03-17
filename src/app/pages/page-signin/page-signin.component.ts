import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserBone } from 'src/app/bones/user.bone';
import { AppBone } from 'src/app/bones/app.bone';
import { CorrelationBGL } from 'src/beagle/classes/correlation-bgl';

@Component({
  selector: 'app-page-signin',
  templateUrl: './page-signin.component.html',
  styleUrls: ['./page-signin.component.css']
})
export class PageSigninComponent implements OnInit {

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

  signin() {
    if (this.userForm.invalid) {
      return ;
    }
    const user = {
      email: this.emailCtrl.value,
      password: this.passwordCtrl.value,
    };
    this.user.actions.signin.dispatchRequest(user, ['loadasync', 'PageSigninComponent@signin']);
  }

}
