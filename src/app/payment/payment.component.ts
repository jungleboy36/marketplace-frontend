import { Component, OnInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {

  constructor(private renderer2: Renderer2, @Inject(DOCUMENT) private _document: Document) { }

  ngOnInit() {
    const merchantId = "achrafhafsia36-facilitator@gmail.com";
    this.appendFirstScript(merchantId).then(() => {
      console.log('First script loaded successfully');
      this.appendSecondScript();
      this.appendRefundScript();

    });
  }

  appendFirstScript(merchantId : string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // Create the first script element
      const s = this.renderer2.createElement('script');
      s.type = 'text/javascript';
      s.src = 'https://www.paypal.com/sdk/js?merchant-id='+merchantId+'&client-id=ASNm3WXakzlzfdZ5M7oTK6ggcGhL_fEYYT75QB7CXnHfdkF2ns7UHSnnZhWfBGKhNkU_Ty6gSEfw1EM_';
      s.async = true;

      // Set up a callback for when the first script is loaded
      s.onload = () => {
        resolve();
      };

      // Append the first script element to the document head
      this.renderer2.appendChild(this._document.head, s);
    });
  }

  appendSecondScript() {
    // Create the second script element
    const ss = this.renderer2.createElement('script');
    ss.text = `
    paypal.Buttons({
      createOrder: function(data, actions) {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: '100.00'
            },
            payee: {
              email_address: 'achrafhafsia36-facilitator@gmail.com'} // Specify the email address of the recipient
              // Optionally, you can also specify other details such as merchant ID, etc.
            
          }]
        });
      },
      onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
          // Handle successful payment
          console.log('Payment successful!');
        });
      },
      onCancel: function(data) {
        // Handle payment cancellation
        console.log('Payment cancelled by the user.');
      },
      onError: function(err) {
        // Handle other errors
        console.error('An error occurred:', err);
        // Display error message to the user or take appropriate action
      }
    }).render('#paypal-button-container');
    
    `;
    
    // Append the second script element to the document head
    this.renderer2.appendChild(this._document.head, ss);
  }

  
  appendRefundScript() {
    // Create the refund script element
    const refundScript = this.renderer2.createElement('script');
    refundScript.text = `
    paypal.Buttons({
      createOrder: function(data, actions) {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: '10.00', // Specify the refund amount
              currency_code: 'USD' // Change currency code as per your requirements
            }
          }]
        });
      },
      onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
          console.log('Refund successful:', details);
          // Handle successful refund (if needed)
        });
      },
      onError: function(err) {
        console.error('Error occurred while refunding payment:', err);
        // Handle errors (if needed)
      }
    }).render('#refund-button-container');`;
    
    // Append the refund script element to the document head
    this.renderer2.appendChild(this._document.head, refundScript);
}


  
}
