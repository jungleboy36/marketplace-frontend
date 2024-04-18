import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: []
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe(
        response => {
          Swal.fire({
            icon: 'success',
            title: 'Login Successful!',
            text: 'You have successfully logged in.',
            confirmButtonText: 'OK'
          });
          // Navigate to the desired page after successful login
          this.router.navigate(['/offers']);
        },
        error => {
          // Handle failed login
          const errorMessage = error?.error?.message;
          if (errorMessage === 'Account disabled') {
              Swal.fire({
                  icon: 'error',
                  title: 'Connexion échouée',
                  text: 'Votre compte a été désactivé.',
                  confirmButtonText: 'OK'
              });
          } else {
              Swal.fire({
                  icon: 'error',
                  title: 'Connexion échouée',
                  text: 'Une erreur est survenue lors de la connexion. Veuillez réessayer plus tard.',
                  confirmButtonText: 'OK'
              });
          }
      }
      );
    }
  }
}
