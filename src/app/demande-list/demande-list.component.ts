
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DemandeService } from '../services/demande.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { DatePipe } from '@angular/common';
import { ChatService } from '../services/chat.service';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import * as LCG from 'leaflet-control-geocoder';
@Component({
  selector: 'app-offer-list',
  templateUrl: './demande-list.component.html',
})
export class DemandeListComponent implements OnInit {
  demandes: any[] = [];
  len! : number ;
  errorMessage: string = '';
  showAddOfferModal: boolean = false;
  searchQuery: string = '';
  filterOption: string = 'all';
  role : string | null = null;
  isAdding : boolean = false;
  newDemande:any = {
    id: null,
    title: null,
    description: null,
    creationDate: new Date(),
    updateDate: new Date(),
    date: new Date(),
    depart: null,
    destination: null,
    volume: null,
    price: null,
  };  
  demandeDetails: any = {
    id: 0,
    title: '',
    description: '',
    creationDate: new Date(),
    updateDate: new Date(),
    date: null,
    depart: '',
    destination: '',
    volume: 0,
    price: 0,
    user_id:'',
    username:'',
  };
  loading : boolean = true;

  demandeForm!: FormGroup ;
  @ViewChild('cancelButton') cancelButton: ElementRef | undefined;
  filteredDemandes: any[] =[];
  minDate: string;

  constructor(private demandeService : DemandeService, private router : Router,private formBuilder: FormBuilder, protected authService : AuthService, private datePipe : DatePipe,private chatService : ChatService) { 
    this.minDate = this.demandeService.getMinDate();
  }

  ngOnInit(): void {
    this.minDate = this.demandeService.getMinDate();
    console.log("minDate: ",this.minDate);

    this.role = this.authService.getRole();
    this.loadDemandes();
    this.demandeForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      depart: ['', Validators.required], // Adding depart field
      destination: ['', Validators.required], // Adding destination field
      // Adding volume field
      price: [null, Validators.required],
      date :[null,Validators.required],


    });
    const originInput = document.getElementById('origin') as HTMLInputElement;
    const destinationInput = document.getElementById('destination') as HTMLInputElement;
    const originSuggestions = document.getElementById('origin-suggestions') as HTMLUListElement;
    const destinationSuggestions = document.getElementById('destination-suggestions') as HTMLUListElement;
    console.log("origin input:",originInput);
    const geocoder = LCG.geocoder({
      defaultMarkGeocode: false,
      geocoder: new (L.Control as any).Geocoder.Nominatim({
        geocodingQueryParams: {
          countrycodes: 'fr',  },
      }),
    });
    const showSuggestions = (query: string, suggestionsElement: HTMLUListElement, inputElement: HTMLInputElement) => {
      geocoder.options.geocoder!.geocode(query, (results) => {
        suggestionsElement.innerHTML = '';
        results.forEach(result => {
          console.log("result: ",result);
          const suggestionItem = document.createElement('li');
          suggestionItem.classList.add('list-group-item');
          suggestionItem.textContent = result.name;
          suggestionItem.addEventListener('click', () => {
            inputElement.value = result.name;
            suggestionsElement.innerHTML = '';
           
          });
          suggestionsElement.appendChild(suggestionItem);
        
      })}
      )}

    originInput.addEventListener('keyup', (event) => {
      const query = (event.target as HTMLInputElement).value;
      if (query.length > 2) {
        console.log("origin input typing...");

        showSuggestions(query, originSuggestions, originInput);
      } else {
        originSuggestions.innerHTML = '';
      }
    });

    destinationInput.addEventListener('keyup', (event) => {
   
      const query = (event.target as HTMLInputElement).value;
      if (query.length > 2) {
        showSuggestions(query, destinationSuggestions, destinationInput);
      } else {
        destinationSuggestions.innerHTML = '';
      }
    });
    
  }
  
  clickCancelButton() {
    // Check if the cancelButton reference is available
    if (this.cancelButton) {
      // Use nativeElement to access the underlying DOM element
      this.cancelButton.nativeElement.click();
    }
  }


  loadDemandes() {
    const cachedDemandes = localStorage.getItem('cachedDemandes');
    if (cachedDemandes) {
      this.demandes = JSON.parse(cachedDemandes);
      this.filteredDemandes = [...this.demandes];
      this.loading = false;}
      
    if (this.role == 'company')
    this.demandeService.getDemandes().subscribe(
      (demandes: any[]) => {
        this.demandes = demandes.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
        this.filteredDemandes = [...this.demandes];
        localStorage.setItem('cachedDemandes', JSON.stringify(this.demandes));
        this.loading = false ;
        this.applyFilter();

      },
      (error) => {
        this.errorMessage = 'Error fetching offers: ' + error.message;
        this.loading = false ;

      }
    );
    else if (this.role == 'client')
    this.demandeService.getDemandesById(this.authService.getUserId()).subscribe(
      (demandes: any[]) => {
        this.demandes = demandes.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
        this.filteredDemandes = [...this.demandes];
        localStorage.setItem('cachedDemandes', JSON.stringify(this.demandes));
        this.loading = false ;
        this.applyFilter();

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
    this.isAdding = true;
    if (this.demandeForm.valid) {
    this.newDemande.user_id = this.authService.getUserId();
    const date = document.getElementById('date') as HTMLInputElement;
    this.newDemande.date = JSON.stringify(date.value);
    this.demandeService.addDemande(this.newDemande).subscribe(
        (response) => {
            // Handle successful response
            // Show success message using SweetAlert
            Swal.fire({
                icon: 'success',
                title: 'Demande ajouté !',
                showConfirmButton: false,
                timer: 800 
            });
            this.demandeForm.reset();
            this.clickCancelButton();
            // Optionally, refresh the offer list after adding a new offer
            this.loadDemandes();
            // Close the modal after adding the offer
            this.isAdding = false;

        },
        (error) => {
            // Handle error
            this.errorMessage = error;
            this.isAdding = false;

        }
    );

}
  }

  openInfoModal(demandeId: string) {
    // Retrieve offer details based on offerId
    this.demandeService.getDemandeById(demandeId).subscribe(
      (demandeDetails: any) => {
      this.demandeDetails = demandeDetails;  
      this.demandeDetails.date_formatted = this.datePipe.transform(this.demandeDetails.date!, 'yyyy-MM-dd à HH:mm');
    },
      (error) => {
        console.error('Error fetching offer details:', error);
        // Handle error if needed
      }
    );
  }

  applyFilter() {
    if (this.filterOption === 'mine' ) {
      // Filter offers to show only the user's offers
      this.filteredDemandes = this.demandes.filter(demande => demande.user_id === this.authService.getUserId());
    } else {
      // Show all offers
      this.filteredDemandes = this.demandes;
    }
  
    // Apply search query filter on filteredOffers
    this.filteredDemandes = this.filteredDemandes.filter(offer =>
      offer.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      offer.description.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  refresh() {
    this.loading = true;
    this.filteredDemandes = [ ]
    if (this.role == 'company')
    this.demandeService.getDemandes().subscribe(
      (demandes: any[]) => {
        this.demandes = demandes.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
        this.filteredDemandes = [...this.demandes];
        localStorage.setItem('cachedDemandes', JSON.stringify(this.demandes));
        this.loading = false ;
        this.applyFilter();

      },
      (error) => {
        this.errorMessage = 'Error fetching offers: ' + error.message;
        this.loading = false ;

      }
    );
    else if (this.role == 'client')
    this.demandeService.getDemandesById(this.authService.getUserId()).subscribe(
      (demandes: any[]) => {
        this.demandes = demandes.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
        this.filteredDemandes = [...this.demandes];
        localStorage.setItem('cachedDemandes', JSON.stringify(this.demandes));
        this.loading = false ;
        this.applyFilter();

      },
      (error) => {
        this.errorMessage = 'Error fetching offers: ' + error.message;
        this.loading = false ;

      }
    );
  }

  removeBackdrop(): void {
    const backdrop = document.querySelector('.modal-backdrop.fade.show');
    if (backdrop) {
      backdrop.parentNode!.removeChild(backdrop);    }
  }
contacter(receiver_id : string,receiver_display_name:string) {
  this.chatService.createConversation(receiver_id, this.authService.getUserId(),receiver_display_name,this.authService.getDisplayName()!).subscribe(
    (data) => {
      console.log('redirecting to chat....');
      this.removeBackdrop();
      this.router.navigate(['/chat']);
    },
  )
}

}
