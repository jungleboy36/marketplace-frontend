import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private apiUrl = 'http://localhost:8000/register/'; // Change the URL to match your backend API endpoint

  constructor(private http: HttpClient) { }

  register(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }
}
