// offer-list.component.ts

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { OfferService } from '../services/offer.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-offer-list',
  templateUrl: './offer-list.component.html',
})
export class OfferListComponent implements OnInit {
  offers: any[] = [];
  len! : number ;
  errorMessage: string = '';
  showAddOfferModal: boolean = false;
  newOffer: any = { title: '', description: '' };

  offerForm!: FormGroup ;
  @ViewChild('cancelButton') cancelButton: ElementRef | undefined;
  offerDetails: any = { title: '', description: '' };

  constructor(private offerService: OfferService, private router : Router,private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.loadOffers();
    this.offerForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required]
      // Add more form controls as needed
    });
  }
  
  clickCancelButton() {
    // Check if the cancelButton reference is available
    if (this.cancelButton) {
      // Use nativeElement to access the underlying DOM element
      this.cancelButton.nativeElement.click();
    }
  }

  openAddOfferModal() {
    this.showAddOfferModal = true;
}
closeAddOfferModal() {
  this.showAddOfferModal = false;
}


  loadOffers() {
    this.offerService.getOffers().subscribe(
      (offers: any[]) => {
        this.offers = offers;
      },
      (error) => {
        this.errorMessage = 'Error fetching offers: ' + error.message;
      }
    );
  }


  confirmDelete(id: string) {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      this.deleteOffer(id);
    }
  }

  deleteOffer(id: string) {
    this.offerService.deleteOffer(id).subscribe(
      () => {
        // If the delete operation is successful, reload the offers
        this.loadOffers();
      },
      (error) => {
        console.error('Error deleting offer:', error);
        // Handle error if needed
      }
    );
  }


  goToEditOffer(id: string) {
    this.router.navigate(['edit-offer/'+id]);
  }

  addOffer() {
    if (this.offerForm.valid) {
    this.offerService.addOffer(this.newOffer).subscribe(
        (response) => {
            // Handle successful response
            console.log('Offer added successfully:', response);
            // Show success message using SweetAlert
            Swal.fire({
                icon: 'success',
                title: 'Offre ajouté !',
                showConfirmButton: false,
                timer: 800 
            });
            this.offerForm.reset();
            this.clickCancelButton();
            // Optionally, refresh the offer list after adding a new offer
            this.loadOffers();
            // Close the modal after adding the offer
        },
        (error) => {
            // Handle error
            this.errorMessage = error;
        }
    );
}
  }


  openInfoModal(offerId: string) {
    // Retrieve offer details based on offerId
    this.offerService.getOfferById(offerId).subscribe(
      (offerDetails: any) => {
      this.offerDetails = offerDetails;      },
      (error) => {
        console.error('Error fetching offer details:', error);
        // Handle error if needed
      }
    );
  }
}
