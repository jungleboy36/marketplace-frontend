import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  formData: any = {};

  constructor(private registerService: AuthService, private router: Router) { }

  submitForm(): void {
    if (!this.formData.name || !this.formData.email || !this.formData.password || !this.formData.password2 || !this.formData.role ) {
      Swal.fire({
        icon: 'error',
        title: 'Champs Vides',
        text: 'Veuillez remplir tous les champs obligatoires.',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (this.formData.role === 'company' && !this.formData.file) {
      Swal.fire({
        icon: 'error',
        title: 'Fichier manquant',
        text: 'Veuillez télécharger un fichier.',
        confirmButtonText: 'OK'
      });
      return;
    }


    if (this.formData.password !== this.formData.password2) {
      Swal.fire({
        icon: 'error',
        title: 'Mot de passe incorrect',
        text: 'Les mots de passe ne correspondent pas.',
        confirmButtonText: 'OK'
      });
      return;
    }

    const formData = new FormData();
    formData.append('name', this.formData.name);
    formData.append('email', this.formData.email);
    formData.append('password', this.formData.password);
    formData.append('password2', this.formData.password2);
    formData.append('role', this.formData.role);

    if (this.formData.role === 'company') {
      console.log("file appended")
      formData.append('file', this.formData.file);
    }
    if (!this.isEmailValid(this.formData.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Email invalide',
        text: 'Veuillez saisir une adresse email valide.',
        confirmButtonText: 'OK'
      });
      return;
    }

    const newFormData = this.getFormData(this.formData);
    this.registerService.register(newFormData).subscribe(
      response => {
        Swal.fire({
          icon: 'success',
          title: 'Inscription réussie !',
          text: 'Vous vous êtes inscrit avec succès.',
          confirmButtonText: 'OK'
        });
        this.router.navigate(['offres']);
      },
      error => {
        Swal.fire({
          icon: 'error',
          title: 'Échec de l\'inscription',
          text: 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer plus tard.',
          confirmButtonText: 'OK'
        });
      }
    );
  }

 
  isEmailValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(email);
  }

  getFormData(object: any): FormData {
    const formData = new FormData();
    for (const key in object) {
        if (object.hasOwnProperty(key)) {
            formData.append(key, object[key]);
        }
    }
    return formData;
}

}
