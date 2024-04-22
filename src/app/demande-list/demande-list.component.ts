// offer-list.component.ts

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DemandeService } from '../services/demande.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-offer-list',
  templateUrl: './demande-list.component.html',
})
export class DemandeListComponent implements OnInit {
  demandes: any[] = [];
  len! : number ;
  errorMessage: string = '';
  showAddOfferModal: boolean = false;
  newDemande: any = { title: '', description: '' };
  demandeDetails : any = { title: '', description: '' };
  loading : boolean = true;

  offerForm!: FormGroup ;
  @ViewChild('cancelButton') cancelButton: ElementRef | undefined;

  constructor(private demandeService : DemandeService, private router : Router,private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.loadDemandes();
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

/*   openAddOfferModal() {
    this.showAddOfferModal = true;
}
closeAddOfferModal() {
  this.showAddOfferModal = false;
} */


  loadDemandes() {
    this.demandeService.getDemandes().subscribe(
      (demandes: any[]) => {
        this.demandes = demandes;
        this.loading = false ;

      },
      (error) => {
        this.errorMessage = 'Error fetching offers: ' + error.message;
        this.loading = false ;

      }
    );
  }


  confirmDelete(id: string) {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      this.deleteDemande(id);
    }
  }

  deleteDemande(id: string) {
    this.demandeService.deleteDemande(id).subscribe(
      () => {
        // If the delete operation is successful, reload the offers
        this.loadDemandes();
      },
      (error) => {
        console.error('Error deleting offer:', error);
        // Handle error if needed
      }
    );
  }


  goToEditDemande(id: string) {
    this.router.navigate(['edit-offer/'+id]);
  }

  addDemande() {
    if (this.offerForm.valid) {
    this.demandeService.addDemande(this.newDemande).subscribe(
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
            this.loadDemandes();
            // Close the modal after adding the offer
        },
        (error) => {
            // Handle error
            this.errorMessage = error;
        }
    );
}
  }

  openInfoModal(demandeId: string) {
    // Retrieve offer details based on offerId
    this.demandeService.getDemandeById(demandeId).subscribe(
      (demandeDetails: any) => {
      this.demandeDetails = demandeDetails;      },
      (error) => {
        console.error('Error fetching offer details:', error);
        // Handle error if needed
      }
    );
  }
}
