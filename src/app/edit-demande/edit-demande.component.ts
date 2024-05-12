import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DemandeService } from '../services/demande.service';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-demande.component.html',
  styleUrls: []
})
export class EditDemandeComponent {
  minDate: string;
  constructor(private route: ActivatedRoute, public router : Router ,private demandeService: DemandeService,private datePipe: DatePipe) { 
    this.minDate = this.demandeService.getMinDate();

  }
  demande! : any ;
  ngOnInit(): void {
    const demandeId = this.route.snapshot.paramMap.get('id');
    this.demandeService.getDemandeById(demandeId!).subscribe(
      (demande) => {
        this.demande = demande;
        this.demande.date = this.datePipe.transform(this.demande.date!, 'yyyy-MM-ddTHH:mm');
      },
      (error) => {
        console.error('Error fetching offer:', error);
      }
    );
  }

  updateDemande() {
    const demandeId = this.route.snapshot.paramMap.get('id');
    this.demandeService.updateDemande(demandeId!, this.demande).subscribe(
      (response) => {
        console.log('Demande updated successfully:', response);
        Swal.fire({
          icon: 'success',
          title: 'Demande mise à jour avec succès !',
          timer: 800, // Adjust the timer as needed
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/demandes']);
          
        });
      },
      (error) => {
        console.error('Error updating demande:', error);
      }
    );
  }

  goBack(): void{
    this.router.navigate(['/demandes']);
  }
}
