import { Component } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { first, Subscription } from 'rxjs';
import { UserModel } from 'src/app/models/user.model';
import { AuthService } from 'src/app/shared/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  loginFailed: boolean = false;
  loginSubmit: boolean = false;

  constructor(private router: Router, private authService: AuthService) { }

  loginForm = new UntypedFormGroup({
    username: new UntypedFormControl('', [Validators.required]),
    password: new UntypedFormControl('', [Validators.required]),
    rememberMe: new UntypedFormControl(true)
  });
  private unsubscribe: Subscription[] = [];

  get lf() {
    return this.loginForm.controls;
  }

  onLogin() {
  
    this.loginSubmit = true;
    if (this.loginForm.invalid){
      return 
    }

    this.loginFailed = false;
    const loginSub = this.authService.login(this.loginForm.value.username, this.loginForm.value.password).pipe(first()).subscribe((user: UserModel | undefined) => {
      if (user){
        this.authService.setUserFromLocalStorage(user);
        this.router.navigate(['/documenti']);
      } else{
        this.loginFailed = true;
      }
    })
    this.unsubscribe.push(loginSub);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
