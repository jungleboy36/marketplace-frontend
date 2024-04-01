import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OfferService } from '../services/offer.service';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.component.html',
  styleUrls: []
})
export class EditOfferComponent {
  constructor(private route: ActivatedRoute, public router : Router ,private offerService: OfferService) { }
  offer! : any ;
  ngOnInit(): void {
    const offerId = this.route.snapshot.paramMap.get('id');
    this.offerService.getOfferById(offerId!).subscribe(
      (offer) => {
        this.offer = offer;
      },
      (error) => {
        console.error('Error fetching offer:', error);
      }
    );
  }

  updateOffer() {
    const offerId = this.route.snapshot.paramMap.get('id');
    this.offerService.updateOffer(offerId!, this.offer).subscribe(
      (response) => {
        console.log('Offer updated successfully:', response);
        this.router.navigate(['/offers']);
      },
      (error) => {
        console.error('Error updating offer:', error);
      }
    );
  }

  goBack(): void{
    this.router.navigate(['/offers']);
  }
}
