import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/';

  // Observable to track the logged-in state of the user
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  // Property to store the user's information
  public userInfo: any = null;

  constructor(private http: HttpClient) {
    // Load user info from local storage when service is instantiated
    this.loadUserInfo();
  }

  // Register a new user
  register(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'register/', formData);
  }

  // Login a user and store their information
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'login/', { email, password }).pipe(
      tap(response => {
        if (response.message === 'Login successful') {
          this.userInfo = response.user;
          this.isLoggedInSubject.next(true);
          this.saveUserInfo();
        }
      })
    );
  }

  // Logout a user and clear their information
  logout(): void {
    this.userInfo = null;
    this.isLoggedInSubject.next(false);
    localStorage.removeItem('userInfo');
    //localStorage.removeItem('uid');
  }

  // Save user information to local storage
  private saveUserInfo(): void {
    if (this.userInfo) {
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo));
    }
  }

  // Load user information from local storage
  private loadUserInfo(): void {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      this.userInfo = JSON.parse(storedUserInfo);
      this.isLoggedInSubject.next(true);
    } else {
      this.isLoggedInSubject.next(false);
    }
  }

  isLoggedIn(): boolean {
    // Retrieve the user info object from local storage
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      // Parse the user info object and check for the existence of the `uid`
      const user = JSON.parse(userInfo);
      return !!user.uid; // Returns true if `uid` exists, false otherwise
    }
    return false;
  }


  getUserId(): string | null {
    const userData = localStorage.getItem('userInfo');
    if (userData) {
        const user = JSON.parse(userData);
        return user.uid; // Assuming 'uid' is stored in the user object
    }
    return null; // Return null if no user data is found
  }

  updateUsername(newUsername: string): void {
    if (this.userInfo) {
        // Update the username in the userInfo object
        this.userInfo.display_name = newUsername;
        
        // Save the updated userInfo back to local storage
        this.saveUserInfo();
    }
}
}

