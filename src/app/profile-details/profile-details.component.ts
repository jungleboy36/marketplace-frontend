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
  feedbacks: any;
  avis: boolean = false;
  constructor(private route: ActivatedRoute, private profileService : ProfileService){}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id');
    });
  
  }

  loadFeedbacks(){
    this.profileService.retrieve_feedbacks(this.id!).subscribe((feedbacks)=>{
      this.feedbacks = feedbacks;
      
      console.log("feedbacks: ", this.feedbacks);
    })
  }

  getStarsArray(stars: string): number[] {
    return Array(parseInt(stars, 10));
  }

  getEmptyStarsArray(stars: string): number[] {
    return Array(5 - parseInt(stars, 10));
  }

}
