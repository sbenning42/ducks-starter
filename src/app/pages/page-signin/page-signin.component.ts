import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserDuck } from 'src/app/ducks-v-2/user.duck';
import { AppDuck } from 'src/app/ducks-v-2/app.duck';
import { Correlation } from 'src/ducks-v-2/classes/correlation';

@Component({
  selector: 'app-page-signin',
  templateUrl: './page-signin.component.html',
  styleUrls: ['./page-signin.component.css']
})
export class PageSigninComponent implements OnInit {

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

  signin() {
    if (this.userForm.invalid) {
      return ;
    }
    const user = {
      email: this.emailCtrl.value,
      password: this.passwordCtrl.value,
    };
    const fromComponent = new Correlation('PageSigninComponent@signin');
    const signin = this.user.actions.authenticate.createRequest(user, [fromComponent]);
    this.user.resolved(signin).subscribe(action => {
      this.app.actions.goto.dispatch(action ? '/home' : '/signin', [fromComponent]);
    });
    this.user.dispatch(signin);
  }

}
