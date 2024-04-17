import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OfferListComponent } from './offer-list/offer-list.component';
import { EditOfferComponent } from './edit-offer/edit-offer.component';
import { DemandeListComponent } from './demande-list/demande-list.component';
import { EditDemandeComponent } from './edit-demande/edit-demande.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './services/AuthGuard';
import { ProfileComponent } from './profile/profile.component';
const routes: Routes = [

  {path:'offers', component: OfferListComponent , canActivate: [AuthGuard]},
  {path:'demandes', component: DemandeListComponent , canActivate: [AuthGuard]},
  {path:'edit-demande/:id',component:EditDemandeComponent, canActivate: [AuthGuard]},
  {path:'edit-offer/:id',component:EditOfferComponent, canActivate: [AuthGuard]},
  {path:'profile', component:ProfileComponent, canActivate:[AuthGuard] },
  {path:'register',component:RegisterComponent},
  {path:'login',component:LoginComponent},

  { path: '**', redirectTo: '/offers', pathMatch: 'full' } // Redirect to '/offers' for unmatched routes

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
