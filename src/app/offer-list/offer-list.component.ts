import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { OfferService } from '../services/offer.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { DatePipe, formatDate } from '@angular/common';
import * as L from 'leaflet';
import 'leaflet-routing-machine/dist/leaflet-routing-machine';

@Component({
  selector: 'app-offer-list',
  templateUrl: './offer-list.component.html',
  styleUrls: ['./offer-list.component.html'],
})
export class OfferListComponent implements OnInit {
  map: any;
  itinerary: string = '';
  originPin: any;
  destinationPin: any;
  routeLayer: any;

  offers: any[] = [];
  filteredOffers: any[] = [];
  len!: number;
  errorMessage: string = '';
  showAddOfferModal: boolean = false;
  searchQuery: string = '';
  filterOption: string = 'all';
  newOffer: any = {
    user_id:'',
    picture:'',
    title: '',
    description: '',
    depart_date: '',
    arrival_date: '',
    itinerary: '',
    volume: '',
    price: '',
  };

  offerForm!: FormGroup;
  @ViewChild('cancelButton') cancelButton: ElementRef | undefined;
  offerDetails: any = {
    title: '',
    description: '',
    depart_date: '',
    arrival_date: '',
    itinerary: '',
    volume: '',
    price: ''
  };
  loading: boolean = true;
  public role : string | null = null ;
  minDate: string;

  constructor(
    private offerService: OfferService,
    private router: Router,
    private formBuilder: FormBuilder,
    public authService : AuthService,
    private datePipe: DatePipe,
  ) {
    this.minDate = this.offerService.getMinDate();
  }

  ngOnInit(): void {
    this.loadOffers();
    this.offerForm = this.formBuilder.group({
      title: ['', Validators.required], 
      description: ['', Validators.required],
      depart_date: ['', Validators.required],
      arrival_date: ['', Validators.required],
      itinerary: ['', Validators.required],
      volume: ['', Validators.required],
      price: ['', Validators.required],
      user_id : '',
    });

    // Initialize the map with default location (Paris, France)
    this.map = L.map('map').setView([48.8566, 2.3522], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    // Add click event listener to the map
    this.map.on('click', (e: any) => {
      // Remove existing pins
      if (this.originPin) {
        this.map.removeLayer(this.originPin);
      }
      if (this.destinationPin) {
        this.map.removeLayer(this.destinationPin);
      }

      // Create a pin icon
      const pinIcon = L.icon({
        iconUrl: 'path/to/pin-icon.png', // Replace with your pin icon URL
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      });

      // Place a pin at the clicked location
      if (!this.originPin) {
        this.originPin = L.marker(e.latlng, { icon: pinIcon }).addTo(this.map);
      } else if (!this.destinationPin) {
        this.destinationPin = L.marker(e.latlng, { icon: pinIcon }).addTo(this.map);
      }

      // Check if both pins are placed
      if (this.originPin && this.destinationPin) {
        this.displayRoute(this.originPin.getLatLng(), this.destinationPin.getLatLng());
      }
    });
  }

  displayRoute(origin: any, destination: any) {
    // Add route layer
    this.routeLayer = (L as any).routing.control({
      waypoints: [
        L.latLng(origin.lat, origin.lng),
        L.latLng(destination.lat, destination.lng)
      ],
      routeWhileDragging: true,
      show: false
    }).addTo(this.map);
  
    // Don't remove existing map tiles
  }

  confirmItinerary() {
    // Use this.itinerary as the selected itinerary
    console.log('Selected Itinerary:', this.itinerary);
    // You can save this.itinerary to your form or perform further processing here
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
  }

  clickCancelButton() {
    if (this.cancelButton) {
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
    const cachedOffers = localStorage.getItem('cachedOffers');
    if (cachedOffers) {
      this.offers = JSON.parse(cachedOffers);
      this.filteredOffers = [...this.offers];
      this.loading = false;
      if (this.filterOption == "mine") {
        this.applyFilter();
      }
    } else {
      this.offerService.getOffers().subscribe(
        (offers: any[]) => {
          this.offers = offers.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
          this.filteredOffers = [...this.offers];
          localStorage.setItem('cachedOffers', JSON.stringify(this.offers));
          this.loading = false;
          if (this.filterOption == "mine") {
            this.applyFilter();
          }
        },
        (error) => {
          this.errorMessage = 'Error fetching offers: ' + error.message;
          this.loading = false;
        }
      );
    }
  }

  confirmDelete(id: string) {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      this.deleteOffer(id);
    }
  }

  deleteOffer(id: string) {
    this.offerService.deleteOffer(id).subscribe(
      () => {
        this.offers = this.offers.filter(offer => offer.id !== id);
        this.filteredOffers = [...this.offers];
        localStorage.setItem('cachedOffers', JSON.stringify(this.offers));
      },
      (error) => {
        console.error('Error deleting offer:', error);
      }
    );
  }

  goToEditOffer(id: string) {
    this.router.navigate(['edit-offer/' + id]);
  }

  addOffer() {
    if (this.offerForm.valid) {
      this.newOffer.user_id = this.authService.getUserId();
      this.offerService.addOffer(this.newOffer).subscribe(
        (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Offre ajouté !',
            showConfirmButton: false,
            timer: 800,
          });
          this.offerForm.reset();
          this.clickCancelButton();

          this.offers.push(response);
          this.filteredOffers = [...this.offers];
          localStorage.setItem('cachedOffers', JSON.stringify(this.offers));
        },
        (error) => {
          this.errorMessage = error;
        }
      );
    }
  }

  openInfoModal(offerId: string) {
    this.offerService.getOfferById(offerId).subscribe(
      (offerDetails: any) => {
        this.offerDetails = offerDetails;
        this.offerDetails.depart_date_formatted = this.datePipe.transform(this.offerDetails.depart_date!, 'yyyy-MM-dd HH:mm');
        this.offerDetails.arrival_date_formatted = formatDate(this.offerDetails.arrival_date, 'yyyy-MM-dd HH:mm', 'en-US');
      },
      (error) => {
        console.error('Error fetching offer details:', error);
      }
    );
  }

  public isCompany() : boolean {
    return  this.authService.getRole() == 'company';
  }

  public belongs(user_id : string) : boolean {
    return this.authService.getUserId() == user_id;
  }

  // Method to filter offers based on search query
  searchOffers() {
    this.filteredOffers = this.offers.filter(offer =>
      offer.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      offer.description.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
      offer.itinerary.toLowerCase().includes(this.searchQuery.toLowerCase()) 
    );
  }

  applyFilter() {
    if (this.filterOption === 'mine' ) {
      // Filter offers to show only the user's offers
      this.filteredOffers = this.offers.filter(offer => offer.user_id === this.authService.getUserId());
    } else {
      // Show all offers
      this.filteredOffers = this.offers;
    }
  
    // Apply search query filter on filteredOffers
    this.filteredOffers = this.filteredOffers.filter(offer =>
      offer.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      offer.description.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  refresh() {
    this.loading = true;
    this.filteredOffers = [ ]
    this.offerService.getOffers().subscribe(
      (offers: any[]) => {
        this.offers = offers.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
        this.filteredOffers = [...this.offers];
        localStorage.setItem('cachedOffers', JSON.stringify(this.offers));
        this.loading = false;
        if (this.filterOption == "mine") {
          this.applyFilter();
        }
      },
      (error) => {
        this.errorMessage = 'Error fetching offers: ' + error.message;
        this.loading = false;
      }
    );
  }
}
