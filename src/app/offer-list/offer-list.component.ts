import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, Renderer2 } from '@angular/core';
import { OfferService } from '../services/offer.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { DatePipe } from '@angular/common';
import { ChatService } from '../services/chat.service';
import * as $ from 'jquery';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import * as LCG from 'leaflet-control-geocoder';

@Component({
  selector: 'app-offer-list',
  templateUrl: './offer-list.component.html',
  styleUrls: ['./offer-list.component.html'],
})
export class OfferListComponent implements OnInit, AfterViewInit {
  map: any;
  itinerary: string = '';
  originPin: L.Marker | undefined;
  destinationPin: L.Marker | undefined;
  routeControl: L.Routing.Control | undefined;
  routeLayer: any;

  
  offers: any[] = [];
  filteredOffers: any[] = [];
  len!: number;
  errorMessage: string = '';
  showAddOfferModal: boolean = false;
  searchQuery: string = '';
  filterOption: string = 'all';
  newOffer: any = {
    user_id: '',
    picture: '',
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
  @ViewChild('addOfferModal') addOfferModalButton: ElementRef | undefined;

  offerDetails: any = {
    title: '',
    description: '',
    depart_date: '',
    arrival_date: '',
    itinerary: '',
    volume: '',
    price: '',
    user_id: '',
    username: '',
  };
  loading: boolean = true;
  public role: string | null = null;
  minDate: string;
  nb : number = 0;
  constructor(
    private offerService: OfferService,
    private router: Router,
    private formBuilder: FormBuilder,
    public authService: AuthService,
    private datePipe: DatePipe,
    private chatService: ChatService,
    private renderer: Renderer2,
  ) {
    this.minDate = this.offerService.getMinDate();
  }

  ngOnInit(): void {
    this.map = L.map('map').setView([48.8566, 2.3522], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.routeLayer = L.layerGroup().addTo(this.map);
    const originInput = document.getElementById('origin') as HTMLInputElement;
    const destinationInput = document.getElementById('destination') as HTMLInputElement;
    const originSuggestions = document.getElementById('origin-suggestions') as HTMLUListElement;
    const destinationSuggestions = document.getElementById('destination-suggestions') as HTMLUListElement;
    this.map.on('click', (e: any) => {
      console.log("map clicked !");
      if (!this.originPin) {
        this.originPin = L.marker(e.latlng ,{draggable: true} ).addTo(this.map);
       this.reverseGeocode(this.originPin.getLatLng(),originInput);
      
      } else if (!this.destinationPin) {
        this.destinationPin = L.marker(e.latlng ,{draggable: true}).addTo(this.map);
        this.reverseGeocode(this.destinationPin.getLatLng(),destinationInput);
      }
      // Check if both pins are placed
      if (this.originPin && this.destinationPin && (this.nb ==0)) {
        this.nb = 1;
        this.updateRoute();
        
      }
      this.originPin!.on('dragend',(e:any)=>{
        this.reverseGeocode(this.originPin!.getLatLng(),originInput);
        this.updateRoute();
      });
      this.destinationPin!.on('dragend',()=>{
        this.reverseGeocode(this.destinationPin!.getLatLng(),destinationInput);
        this.updateRoute();
      })
    });
    
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
          const suggestionItem = document.createElement('li');
          suggestionItem.classList.add('list-group-item');
          suggestionItem.textContent = result.name;
          suggestionItem.addEventListener('click', () => {
            inputElement.value = result.name;
            suggestionsElement.innerHTML = '';
            if (inputElement.id === 'origin') {
              if (this.originPin) {

                this.map.removeLayer(this.originPin);
     
              }
              this.originPin = L.marker(result.center,{draggable : true}).addTo(this.map);
              this.originPin.on('dragend', () => {
                this.reverseGeocode(this.originPin!.getLatLng(), originInput);
                this.updateRoute();
              });
              console.log('originPin: ',this.originPin);
              this.map.setView(result.center, this.map.getZoom());
            } else if (inputElement.id === 'destination') {
              if (this.destinationPin) {
      
                this.map.removeLayer(this.destinationPin);

              }
              this.destinationPin = L.marker(result.center ,{draggable : true}).addTo(this.map);
              this.destinationPin.on('dragend', () => {
                this.reverseGeocode(this.destinationPin!.getLatLng(), destinationInput);
                this.updateRoute();
              });
              this.map.setView(result.center, this.map.getZoom());
              
            }
            this.updateRoute();
          });
          suggestionsElement.appendChild(suggestionItem);
        });
      });
    };

    originInput.addEventListener('keyup', (event) => {
  
      const query = (event.target as HTMLInputElement).value;
      if (query.length > 2) {
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


   
    this.loadOffers();
    this.offerForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      depart_date: ['', Validators.required],
      arrival_date: ['', Validators.required],
      itinerary: ['', Validators.required],
      volume: ['', Validators.required],
      price: ['', Validators.required],
      user_id: '',
    });
  
  }

  ngAfterViewInit(): void {
   

  }


  updateRoute(): void {
    if (this.originPin && this.destinationPin) {
      const originLatLng = this.originPin.getLatLng();
      const destinationLatLng = this.destinationPin.getLatLng();
  
      // Ensure the coordinates are within the valid range
      if (this.isValidCoordinate(originLatLng) && this.isValidCoordinate(destinationLatLng)) {
        if (this.routeControl) {
          this.map.removeControl(this.routeControl);
        }
  
        // Remove the existing markers from the map to avoid duplication
        this.map.removeLayer(this.originPin);
        this.map.removeLayer(this.destinationPin);
  
        this.routeControl = L.Routing.control({
          waypoints: [
            originLatLng,
            destinationLatLng,
          ],
          routeWhileDragging: true,
          router: new L.Routing.OSRMv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1'
          })
        }).on('routingerror', function (e) {
          console.error('Routing error: ', e);
          alert('Routing error: ' + e.message);
        }).addTo(this.map);
  
        // Re-add the existing markers to the map
        this.originPin.addTo(this.map);
        this.destinationPin.addTo(this.map);
  
        const bounds = new L.LatLngBounds(originLatLng, destinationLatLng);
        this.map.fitBounds(bounds, { padding: [20, 20] });
      } else {
        alert('Invalid coordinates for routing');
      }
    }
  }
  

  isValidCoordinate(latlng: L.LatLng): boolean {
    const lat = latlng.lat;
    const lng = latlng.lng;
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
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
          Swal.fire({
            icon: 'error',
            title: this.errorMessage,
            showConfirmButton: false,
            timer: 800,
          });
        }
      );
    }
  }

  openInfoModal(offerId: string) {
    this.offerService.getOfferById(offerId).subscribe(
      (offerDetails: any) => {
        this.offerDetails = offerDetails;
     
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

mapModal(){
  setTimeout(() => {
    this.map.invalidateSize();
  }, 500);
}

removeAllPins(): void {
  const originInput = document.getElementById('origin') as HTMLInputElement
const destinationInput = document.getElementById('destination') as HTMLInputElement
originInput.value = '';
destinationInput.value ='';
  this.routeLayer.clearLayers();
  this.originPin = undefined;
  this.destinationPin = undefined;
  this.routeControl = undefined;
this.map = this.map.remove();
this.nb= 0;
this.map = L.map('map').setView([48.8566, 2.3522], 7);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(this.map);
this.routeLayer = L.layerGroup().addTo(this.map);
this.map.on('click', (e: any) => {

  if (!this.originPin) {
    this.originPin = L.marker(e.latlng).addTo(this.routeLayer);
    this.reverseGeocode(this.originPin.getLatLng(),document.getElementById('origin') as HTMLInputElement);
    this.originPin.on('dragend', () => {
      const latlng = this.originPin!.getLatLng();
      this.reverseGeocode(latlng, originInput);
    });
  } else if (!this.destinationPin) {
    this.destinationPin = L.marker(e.latlng).addTo(this.routeLayer);
    this.reverseGeocode(this.destinationPin.getLatLng(),document.getElementById('destination') as HTMLInputElement);
    this.destinationPin.on('dragend', () => {
      const latlng = this.destinationPin!.getLatLng();
      this.reverseGeocode(latlng, destinationInput);
    });
  }
  // Check if both pins are placed
  if (this.originPin && this.destinationPin && (this.nb ==0)) {
    this.nb = 1;
    this.updateRoute(); 
   
  }
});
}
reverseGeocode(latlng: L.LatLng, inputElement: HTMLInputElement) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latlng.lat}&lon=${latlng.lng}`;
  const geocoder = LCG.geocoder({
    defaultMarkGeocode: false,
    geocoder: new (L.Control as any).Geocoder.Nominatim({
      geocodingQueryParams: {
        countrycodes: 'fr',  },
    }),
  });
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.address) {
        const address = `${data.address.road || ''}, ${data.address.city || data.address.town || data.address.village || ''}, ${data.address.state || ''}, ${data.address.country || ''}`;
        //inputElement.value = address;
        geocoder.options.geocoder!.geocode(address, (results) => {
          inputElement.value = results[0].name;
        });

          
      } else {
        inputElement.value = 'Address not found';
      }
    })
    .catch(error => {
      console.error('Error fetching address:', error);
      inputElement.value = 'Error fetching address';
    });
}

}
