// offer.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  private apiUrl = 'http://127.0.0.1:8000/offres';

  constructor(private http: HttpClient) { }

  getOffers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl+'/');
  }

  addOffer(offerData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl+'/', offerData)
        .pipe(
            catchError(this.handleError)
        );
}

  deleteOffer(id: string): Observable<any> {
    const url = `${this.apiUrl}/${id}/`;
    return this.http.delete<any>(url);
  }

  updateOffer(offerId: string, updatedOffer: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${offerId}/`, updatedOffer);
  }

  getOfferById(offerId: string): Observable<any> {
    const url = `${this.apiUrl}/${offerId}/`;
    return this.http.get<any>(url);
  }

  private handleError(error: any) {
    console.error('API Error:', error);
    return throwError('An error occurred. Please try again later.');
}
}
