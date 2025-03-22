import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';
import { Location } from '@angular/common';
import Pusher from 'pusher-js';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: []
})
export class NavbarComponent implements OnInit {
  isLoggedIn$ = this.authService.isLoggedIn$;
  userInfo: any;
  public profileImageUrl: string | null = null;
  notifications: any[] = [];
  messages : any[] = [];
  message : any = {};
  display_name :any;
  email : any;
  constructor(public authService: AuthService,private profileService: ProfileService,private location: Location) {

     
 
   }

  ngOnInit(): void {

    // Retrieve user info from local storage
    this.authService.getUser().subscribe(
      data => {
        this.userInfo = data;
        this.display_name = data.name;
        this.email = data.email;
      },
      error => {
        console.error('Error fetching user info', error);
      }
    );
  }
  

  handleLogout(): void {
      this.authService.logout();
  }

  loadData() : void {
    const uid = this.authService.getUserId();
      this.profileService.getUser().subscribe(
        data => {
          // Set the profile image URL
          this.profileImageUrl = data.image;
        },
        error => {
          console.error('Error fetching user profile', error);
        }
      );

  }


  
  markAllAsRead() {

  }

  getUserPicture(userId: string,message : any) : void {
    this.profileService.getUser().subscribe(
      data => {
        // Set the profile image URL
        message.image = data.image;
      },
      error => {
        console.error('Error fetching user profile', error);
      }
    );
  }

  clearAllMessages(){
    this.messages = [];
  }
}