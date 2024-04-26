import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: []
})
export class NavbarComponent implements OnInit {
  isLoggedIn$ = this.authService.isLoggedIn$;
  userInfo: any;
  public profileImageUrl: string | null = null;

  constructor(public authService: AuthService,private profileService: ProfileService) { }

  ngOnInit(): void {
    // Retrieve user info from local storage
    this.authService.infoUser = this.authService.getInfoFromToken();
    console.log('get info from token : ', this.authService.getInfoFromToken());
  
    // Check if profile image URL is available in local storage
    const storedProfileImageUrl = localStorage.getItem('profileImageUrl');
    if (storedProfileImageUrl) {
      // Use the stored profile image URL
      this.profileImageUrl = storedProfileImageUrl;
    } else {
      // Fetch the profile image URL from the server
      const uid = this.authService.getUserId();
      this.profileService.getUserProfile(uid!).subscribe(
        data => {
          // Set the profile image URL
          this.profileImageUrl = data.image;
          // Store the profile image URL in local storage for future use
          localStorage.setItem('profileImageUrl', this.profileImageUrl!);
        },
        error => {
          console.error('Error fetching user profile', error);
        }
      );
    }
  
    this.profileService.profileUpdated.subscribe(() => {
      // Reload data or take necessary actions
      this.loadData();
    });
  }
  

  handleLogout(): void {
      this.authService.logout();
  }

  loadData() : void {
    const uid = this.authService.getUserId();
      this.profileService.getUserProfile(uid!).subscribe(
        data => {
          // Set the profile image URL
          this.profileImageUrl = data.image;
        },
        error => {
          console.error('Error fetching user profile', error);
        }
      );

  }
}