import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: []
})
export class LoginComponent {
  loginForm: FormGroup;
  loading: boolean = false;
  private loadingSubscription: Subscription;
    constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    this.loadingSubscription = this.authService.loading$.subscribe(loading => {
      this.loading = loading;
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from loading subscription to prevent memory leaks
    this.loadingSubscription.unsubscribe();
  }
  onSubmit(): void {
    if (this.loginForm.valid && !this.loading) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email,password);
      
    }
  }
}
