import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { RegisterService } from '../services/register.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  formData: any = {};

  constructor(private registerService: RegisterService, private router : Router) { }

  submitForm(): void {
    const formData = new FormData();
    formData.append('name', this.formData.name);
    formData.append('email', this.formData.email);
    formData.append('password', this.formData.password);
    formData.append('password2', this.formData.password2);
    formData.append('role', this.formData.role);
    
    if (this.formData.role === 'company') {
      formData.append('file', this.formData.file);
    }

    this.registerService.register(formData).subscribe(
      response => {
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful!',
          text: 'You have successfully registered.',
          confirmButtonText: 'OK',
          
        });
        this.router.navigate(['offres']);
      },
      error => {
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: 'An error occurred while registering. Please try again later.',
          confirmButtonText: 'OK'
        });
      }
    );
  }
}
