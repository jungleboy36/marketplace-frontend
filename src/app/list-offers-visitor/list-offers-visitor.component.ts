import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { OfferService } from '../services/offer.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { DatePipe, formatDate } from '@angular/common';
import { ChatComponent } from '../chat/chat.component';
import { ChatService } from '../services/chat.service';
import * as $ from 'jquery';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import * as LCG from 'leaflet-control-geocoder';
import * as turf from '@turf/turf';

@Component({
  selector: 'app-list-offers-visitor',
  templateUrl: './list-offers-visitor.component.html',
  styleUrls: ["./assets/css/main.css"]
})
export class ListOffersVisitorComponent implements OnInit {
  departStartDate: Date | null = null;
  departEndDate: Date | null = null;
  destinationStartDate: Date | null = null;
  destinationEndDate: Date | null = null;
  departSearch : string ='';
  destinationSearch : string ='';
  filterLoading : boolean= false;
  isAdding: boolean = false;
  map: any;
  offerMap : any;
  itinerary: string = '';
  originPin: L.Marker | undefined;
  destinationPin: L.Marker | undefined;
  routeControl: L.Routing.Control | undefined;
  routeLayer: any;
  mapLoading : boolean = false;
  allFieldsFilled: boolean = false;
  public offers: any[] = [];
  filteredOffers: any[] = [];
  len!: number;
  customIcon : any;
  errorMessage: string = '';
  showAddOfferModal: boolean = false;
  searchQuery: string = '';
  filterOption: string = 'all';
  newOffer: any = {
    user_id: '',
    title: '',
    description: '',
    depart_date: '',
    arrival_date: '',
    origin:'',
    destination :'',
    originMap : '',
    destinationMap : '',
    route: null,
    picture  : localStorage.getItem('profileImageUrl')
  };

  offerForm!: FormGroup;
  @ViewChild('cancelButton') cancelButton: ElementRef | undefined;
  @ViewChild('addOfferModal') addOfferModalButton: ElementRef | undefined;
  @ViewChild('filterClose') filterCloseButton: ElementRef | undefined;

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
    picture : '',
  };
  loading: boolean = true;
  public role: string | null = null;
  minDate: string;
  nb : number = 0;
  searchedOffers: any[]=[];
  filterButton: boolean = false;
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
    this.offerForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      depart_date: ['', Validators.required],
      arrival_date: ['', Validators.required],
      origin: ['', Validators.required],
      destination: ['', Validators.required]
      // Add other form controls here
  });
  }

  ngOnInit(): void {
    const destinationSearch = document.getElementById('destinationSearch') as HTMLInputElement;
    const departSearch = document.getElementById('departSearch') as HTMLInputElement;
    const destinationSearchSuggestions = document.getElementById('destinationSearch-suggestions') as HTMLUListElement;
    const departSearchSuggestions = document.getElementById('departSearch-suggestions') as HTMLUListElement;
    
    this.customIcon = L.icon({
      iconUrl: 'assets/img/marker-icon.png', // Path to your custom icon image
      iconSize: [25, 41], // Size of the icon [width, height]
      iconAnchor: [12, 41], // Anchor point of the icon [x, y]
      popupAnchor: [0, -41] // Anchor point of the popup relative to the icon [x, y]
  });
    this.loadOffers();
    this.initializeOfferMap();
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
            
          });
          suggestionsElement.appendChild(suggestionItem);
        });
      });
    };
    destinationSearch.addEventListener('keyup', (event) => {
   
      const query = (event.target as HTMLInputElement).value;
      if (query.length > 2) {
        showSuggestions(query, destinationSearchSuggestions, destinationSearch);
      } else {
        destinationSearchSuggestions.innerHTML = '';
      }
    });

   
    departSearch.addEventListener('keyup', (event) => {
   
      const query = (event.target as HTMLInputElement).value;
      if (query.length > 2) {
        showSuggestions(query, departSearchSuggestions, departSearch);
      } else {
        departSearchSuggestions.innerHTML = '';
      }
    });
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
      if (this.filterOption === "mine") {
        this.applyFilter();
      }
    }
  
    this.offerService.getOffers().subscribe(
      (offers: any[]) => {
        this.offers = offers.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
        this.filteredOffers = [...this.offers];
        localStorage.setItem('cachedOffers', JSON.stringify(this.offers));
        this.offers = JSON.parse(localStorage.getItem('cachedOffers')!);
        this.filteredOffers = [...this.offers];
        this.loading = false;
        if (this.filterOption === "mine") {
          this.applyFilter();
        }
      },
      (error) => {
        this.errorMessage = 'Error fetching offers: ' + error.message;
        this.loading = false;
      }
    );
  }
  


  openInfoModal(offerId: string) {
    this.mapLoading = true;
    setTimeout(() => {
      this.offerMap.invalidateSize();
    }, 500);
  
    this.offerService.getOfferById(offerId).subscribe(
      (offerDetails: any) => {
        this.offerDetails = offerDetails;
        const originLatLng = JSON.parse(offerDetails.originMap);
        const destinationLatLng = JSON.parse(offerDetails.destinationMap);
        
        // Remove existing layers except tile layer
        this.offerMap.eachLayer((layer: any) => {
          if (!(layer instanceof L.TileLayer)) {
            this.offerMap.removeLayer(layer);
          }

        });
        L.marker(originLatLng, {draggable : false, icon: this.customIcon }).addTo(this.offerMap);
        L.marker(destinationLatLng, {draggable : false , icon: this.customIcon}).addTo(this.offerMap);
        const bounds = new L.LatLngBounds(originLatLng, destinationLatLng);
        this.offerMap.fitBounds(bounds, { padding: [5, 5] });
     
        // Check and parse route coordinates
        const route = this.offerDetails.route;
        if (!route) {
          console.error('Route data is missing in offer details');
          return;
        }
  
        let coordinates;
        try {
          coordinates = JSON.parse(route).coordinates.map((coord: any) => L.latLng(coord.lat, coord.lng));
        } catch (error) {
          console.error('Error parsing route coordinates:', error);
          return;
        }
  
      
 
        L.polyline(coordinates, { color: 'blue', weight: 4 }).addTo(this.offerMap);
        this.mapLoading = false;
      },
      (error) => {
        console.error('Error fetching offer details:', error);
      }
    );
  }
  


  initializeOfferMap() {
    // Initialize map with a default location and zoom level
    
    this.offerMap = L.map('modalMap').setView([48.8566, 2.3522], 7);
    // Add tile layer
   
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.offerMap);
    
  }


 

  // Method to filter offers based on search query


  applyFilter() {
    console.log('apply filter triggered!!');
    if (this.searchQuery === '') {
      this.filteredOffers = this.searchedOffers;
    }
    else{
    // Apply search query filter on filteredOffers
    this.filteredOffers = this.searchedOffers.filter(offer =>
      offer.depart_date.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      offer.arrival_date.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      offer.description.toLowerCase().includes(this.searchQuery.toLowerCase())
  
    );
  }
  }

  removeBackdrop(): void {
    const backdrop = document.querySelector('.modal-backdrop.fade.show');
    if (backdrop) {
      backdrop.parentNode!.removeChild(backdrop);    }
  }


mapModal(){
  setTimeout(() => {
    this.map.invalidateSize();
  }, 500);
}

applySmartSearch(departure: string, destination: string, maxDistance: number = 20): void {
  this.filterLoading= true;

  if (this.filterOption === 'mine' ) {
    // Filter offers to show only the user's offers
    this.filteredOffers = this.offers.filter(offer => offer.user_id === this.authService.getUserId());
  } else {
    // Show all offers
    this.filteredOffers = this.offers;
  }

  if (this.departStartDate ) {
    this.filteredOffers = this.filteredOffers.filter(offer =>
      offer.depart_date >= this.departStartDate! 
    );
  }
  if (this.departEndDate) {
    this.filteredOffers = this.filteredOffers.filter(offer =>
      offer.depart_date <= this.departEndDate!
    );
  }
  if (this.destinationStartDate ) {
    this.filteredOffers = this.filteredOffers.filter(offer =>
      offer.arrival_date >= this.destinationStartDate! 
    );
  }
  if (this.destinationEndDate) {
    this.filteredOffers = this.filteredOffers.filter(offer =>
      offer.arrival_date <= this.destinationEndDate!
    );
  }
  // Apply search query filter on filteredOffers
  
 if(this.departSearch ==='' && this.destinationSearch ===''){
  this.searchedOffers = this.filteredOffers;
  this.filterLoading = false;
  if(this.filterCloseButton){
    this.filterCloseButton.nativeElement.click();
  }
 }
  const geocoder = (L.Control as any).Geocoder.nominatim();
  // Geocode the departure address
  geocoder.geocode(departure, (departResults: any) => {
    if (departResults.length === 0) {
      console.error('Departure address not found');
      return;
    }
    const departLatLng = new L.LatLng(departResults[0].center.lat, departResults[0].center.lng);

    // Geocode the destination address
    geocoder.geocode(destination, (destinationResults: any) => {
      if (destinationResults.length === 0) {
        console.error('Destination address not found');
        return;
      }
      const destinationLatLng = new L.LatLng(destinationResults[0].center.lat, destinationResults[0].center.lng);

      this.filteredOffers = this.filteredOffers.filter(offer => {
        if (offer.route) {
          const route = JSON.parse(offer.route);
          const routeCoords = route.coordinates.map((coord: any) => [coord.lng, coord.lat]);

          // Convert route coordinates to a LineString for turf.js
          const line = turf.lineString(routeCoords);

          // Convert depart and destination points to turf points
          const departPoint = turf.point([departLatLng.lng, departLatLng.lat]);
          const destinationPoint = turf.point([destinationLatLng.lng, destinationLatLng.lat]);

          // Check if depart and destination points are within maxDistance of the route
          const departNearRoute = turf.nearestPointOnLine(line, departPoint, { units: 'kilometers' }).properties.dist <= maxDistance;
          const destinationNearRoute = turf.nearestPointOnLine(line, destinationPoint, { units: 'kilometers' }).properties.dist <= maxDistance;

          if (departNearRoute && destinationNearRoute) {
            // Ensure depart point comes before destination point along the route
            const departIndex = routeCoords.findIndex(([lng, lat]: [number, number]) => {
              return turf.distance(turf.point([lng, lat]), departPoint, { units: 'kilometers' }) <= maxDistance;
            });

            const destinationIndex = routeCoords.findIndex(([lng, lat]: [number, number]) => {
              return turf.distance(turf.point([lng, lat]), destinationPoint, { units: 'kilometers' }) <= maxDistance;
            });

            return departIndex !== -1 && destinationIndex !== -1 && departIndex < destinationIndex;
          }

          return false;
        }

        return false;
      });
      this.searchedOffers = this.filteredOffers;

    });
    this.filterLoading = false;
    if(this.filterCloseButton){
      this.filterCloseButton.nativeElement.click();
    }
  });

}



resetForm() {
  this.departSearch = '';
  this.destinationSearch = '';
  this.departStartDate = null;
  this.departEndDate = null;
  this.destinationStartDate = null;
  this.destinationEndDate = null;
  this.filterOption = 'all';
  this.filteredOffers = this.offers;
  this.searchQuery = '';
}
filterFields(){
  if((this.departSearch !='' && this.destinationSearch == '') || (this.departSearch =='' && this.destinationSearch !='')){
    this.filterButton = true;
  }
  else{
    this.filterButton = false;
  }
}



}
