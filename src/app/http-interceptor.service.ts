import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class HttpInterceptorService implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Session token expired
          Swal.fire({
            icon: 'error',
            title: 'Session expirée',
            text: 'Votre session a expiré. Veuillez vous connecter à nouveau.',
            showConfirmButton: false,
            timer: 2000 // Close alert after 2 seconds
          }).then(() => {
            this.router.navigate(['/login']); // Redirect to login page
          });
        }
        return throwError(error);
      })
    );
  }
}
