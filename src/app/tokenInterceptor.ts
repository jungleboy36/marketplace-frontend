// jwt.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './services/auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  // URLs that should be excluded from having JWT included
  private excludedUrls: string[] = ['/login', '/logout']; // Add more URLs as needed

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Check if the request URL matches any of the excluded URLs
    const isExcluded = this.excludedUrls.some(url => request.url.includes(url));

    // If the URL is excluded, pass the request through without adding JWT
    if (isExcluded) {
      return next.handle(request);
    }

    // Get the JWT token from the auth service
    const token = this.authService.getToken();
    const encodedToken = btoa(token!);

    // Add the token to the request headers if it exists
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${encodedToken}`
        }
      });
    }

    // Pass the modified request to the next handler
    return next.handle(request);
  }
}
