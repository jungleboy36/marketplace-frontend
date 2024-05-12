import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
    private apiUrl = 'http://127.0.0.1:8000';
  constructor(private http: HttpClient) { }

  getDocumentCount(): Observable<any> {
    return this.http.get<any>(this.apiUrl+'/stats');
  }
}