import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OfferListComponent } from './offer-list/offer-list.component';
import { EditOfferComponent } from './edit-offer/edit-offer.component';
import { DemandeListComponent } from './demande-list/demande-list.component';
import { EditDemandeComponent } from './edit-demande/edit-demande.component';
const routes: Routes = [

  {path:'offers', component: OfferListComponent},
  {path:'demandes', component: DemandeListComponent},
  {path:'edit-demande/:id',component:EditDemandeComponent},
  {path:'edit-offer/:id',component:EditOfferComponent},
  { path: '**', redirectTo: '/offers', pathMatch: 'full' } // Redirect to '/offers' for unmatched routes

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
