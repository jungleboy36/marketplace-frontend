import { Component, ElementRef } from '@angular/core';
import { HomeService } from '../services/home.service';
import { Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ["./assets/css/main.css"],
})
export class HomeComponent {
documentCount: any;
  loading: boolean=true;
  
constructor(private homeService: HomeService, private renderer2: Renderer2, private el: ElementRef,
  @Inject(DOCUMENT) private _document:Document){}

ngOnInit(): void {
  // Initialize loading variable
  this.loading = true;
  this.appendChatbotScript();
  this.loadScripts();
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

  
appendChatbotScript() {
  // Create the script element for embedding the chatbot
  const ss = this.renderer2.createElement('script');

  // Set the type and source attributes
  this.renderer2.setAttribute(ss, 'src', 'https://www.chatbase.co/embed.min.js');
  this.renderer2.setAttribute(ss, 'chatbotId', '8ekVZJl4BzPpwUfZ3Xzus');
  this.renderer2.setAttribute(ss, 'domain', 'www.chatbase.co');
  this.renderer2.setAttribute(ss, 'defer', '');

  // Add a script element to set the window configuration
  const configScript = this.renderer2.createElement('script');
  configScript.text = `
    window.embeddedChatbotConfig = {
      chatbotId: "8ekVZJl4BzPpwUfZ3Xzus",
      domain: "www.chatbase.co"
    };
  `;

  // Append the configuration script and the chatbot script to the document head
  this.renderer2.appendChild(this._document.head, configScript);
  this.renderer2.appendChild(this._document.head, ss);
}

loadScripts() {
  this.addScript('https://code.jquery.com/jquery-3.6.0.min.js');
  this.addScript('https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js');
  this.addScript('assets/homepage/vendor/bootstrap/js/bootstrap.min.js');
}

addScript(src: string) {
  const script = this.renderer2.createElement('script');
  script.src = src;
  script.type = 'text/javascript';
  script.async = true;
  script.defer = true;
  this.renderer2.appendChild(this.el.nativeElement, script);
}
}
