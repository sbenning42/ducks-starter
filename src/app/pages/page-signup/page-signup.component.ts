import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserDuck, User } from 'src/app/ducks-v-2/user.duck';
import { AppDuck } from 'src/app/ducks-v-2/app.duck';
import { Correlation } from 'src/ducks-v-2/classes/correlation';

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
    const user: Partial<User> = { email: this.emailCtrl.value, password: this.passwordCtrl.value };
    const fromComponent = new Correlation('PageSigninComponent@signup');
    const signup = this.user.actions.register.createRequest(user, [fromComponent]);
    this.user.resolved(signup).subscribe(() => {
      this.app.actions.goto.dispatch({ target: '/signin', data: { user } }, [fromComponent]);
    });
    this.user.dispatch(signup);
  }

}
