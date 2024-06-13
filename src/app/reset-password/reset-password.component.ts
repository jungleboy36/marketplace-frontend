import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})


export class ResetPasswordComponent {
  resetPasswordForm: FormGroup;
  constructor(private authService: AuthService, private fb: FormBuilder){
    this.resetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get email() {
    return this.resetPasswordForm.get('email');
  }


  onSubmit(): void {
    if (this.resetPasswordForm.valid) {
      const email = this.resetPasswordForm.value.email;
      this.authService.resetPassword(email).subscribe(
        response => {
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Le lien de réinitialisation du mot de passe a été envoyé à votre adresse e-mail.'
          });
        },
        error => {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: "Une erreur s'est produite lors de l'envoi du lien de réinitialisation du mot de passe."
          });
        }
      );
    }
  }
}
