import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: []
})
export class ProfileDetailsComponent {
  id: string |null = null;
  userProfile : any;
  constructor(private route: ActivatedRoute, private profileService : ProfileService){}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id');
    });
    this.profileService.getUserProfile(this.id!).subscribe(
      data => {
        this.userProfile = data;

        // Populate the form with user data

        // If image exists, set it as Base64 format
       
      },
      error => {
        console.error('Error fetching user profile', error);
      }
    );
    console.log("profile details : ", this.userProfile);

  }
}
