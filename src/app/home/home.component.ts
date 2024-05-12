import { Component } from '@angular/core';
import { HomeService } from '../services/home.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ["./assets/css/main.css"],
})
export class HomeComponent {
documentCount: any;
  loading: boolean=true;

constructor(private homeService: HomeService){}

ngOnInit(): void {
  // Initialize loading variable
  this.loading = true;

  // Introduce a slight delay before fetching data
  setTimeout(() => {
    // Fetch document count
    this.homeService.getDocumentCount()
      .toPromise()
      .then((data) => {
        // Assign fetched data to documentCount variable
        this.documentCount = data;
        
        console.log('Document count:', this.documentCount);

        // Set loading to false after data is fetched
        
      })
      .catch((error) => {
        console.error('Error fetching document count:', error);

        // Set loading to false in case of error
        
      });
  }, 100); // Adjust the delay time as needed
}

  
}
