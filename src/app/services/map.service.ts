import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as $ from 'jquery';
@Injectable({
  providedIn: 'root',
})
export class MapService {
  public departmentMap: { [key: string]: string } = {
    '01': 'Ain', '02': 'Aisne', '03': 'Allier', '04': 'Alpes-de-Haute-Provence',
    '05': 'Hautes-Alpes', '06': 'Alpes-Maritimes', '07': 'Ardèche', '08': 'Ardennes',
    '09': 'Ariège', '10': 'Aube', '11': 'Aude', '12': 'Aveyron', '13': 'Bouches-du-Rhône',
    '14': 'Calvados', '15': 'Cantal', '16': 'Charente', '17': 'Charente-Maritime',
    '18': 'Cher', '19': 'Corrèze', '21': 'Côte-d\'Or', '22': 'Côtes-d\'Armor',
    '23': 'Creuse', '24': 'Dordogne', '25': 'Doubs', '26': 'Drôme', '27': 'Eure',
    '28': 'Eure-et-Loir', '29': 'Finistère', '2A': 'Corse-du-Sud', '2B': 'Haute-Corse',
    '30': 'Gard', '31': 'Haute-Garonne', '32': 'Gers', '33': 'Gironde',
    '34': 'Hérault', '35': 'Ille-et-Vilaine', '36': 'Indre', '37': 'Indre-et-Loire',
    '38': 'Isère', '39': 'Jura', '40': 'Landes', '41': 'Loir-et-Cher', '42': 'Loire',
    '43': 'Haute-Loire', '44': 'Loire-Atlantique', '45': 'Loiret', '46': 'Lot',
    '47': 'Lot-et-Garonne', '48': 'Lozère', '49': 'Maine-et-Loire', '50': 'Manche',
    '51': 'Marne', '52': 'Haute-Marne', '53': 'Mayenne', '54': 'Meurthe-et-Moselle',
    '55': 'Meuse', '56': 'Morbihan', '57': 'Moselle', '58': 'Nièvre', '59': 'Nord',
    '60': 'Oise', '61': 'Orne', '62': 'Pas-de-Calais', '63': 'Puy-de-Dôme',
    '64': 'Pyrénées-Atlantiques', '65': 'Hautes-Pyrénées', '66': 'Pyrénées-Orientales',
    '67': 'Bas-Rhin', '68': 'Haut-Rhin', '69': 'Rhône', '70': 'Haute-Saône',
    '71': 'Saône-et-Loire', '72': 'Sarthe', '73': 'Savoie', '74': 'Haute-Savoie',
    '75': 'Île-de-France', '76': 'Seine-Maritime', '77': 'Seine-et-Marne', '78': 'Yvelines',
    '79': 'Deux-Sèvres', '80': 'Somme', '81': 'Tarn', '82': 'Tarn-et-Garonne',
    '83': 'Var', '84': 'Vaucluse', '85': 'Vendée', '86': 'Vienne', '87': 'Haute-Vienne',
    '88': 'Vosges', '89': 'Yonne', '90': 'Territoire de Belfort', '91': 'Essonne',
    '92': 'Hauts-de-Seine', '93': 'Seine-Saint-Denis', '94': 'Val-de-Marne', '95': 'Val-d\'Oise',
  };

  private selectedRegionsSubject = new BehaviorSubject<{ id: string; name: string; order: number }[]>([]);
  selectedRegions$ = this.selectedRegionsSubject.asObservable();

  private selectedFilterRegionsSubject = new BehaviorSubject<{ id: string; name: string; order: number }[]>([]);
  selectedFilterRegions$ = this.selectedFilterRegionsSubject.asObservable();
  private displayRegionsSubject = new BehaviorSubject<string>('');
  displayRegions$ = this.displayRegionsSubject.asObservable();
  public add : boolean = false;
  constructor() {}

  selectRegion(regionId: string): void {
    this.add = true;
    const currentRegions = this.selectedRegionsSubject.getValue();
    const regionName = this.departmentMap[regionId] || 'Unknown';

    const index = currentRegions.findIndex(region => region.id === regionId);

    if (index === -1) {
      currentRegions.push({ id: regionId, name: regionName, order: currentRegions.length + 1 });
      $(".add-map").find("#" + regionId).addClass("selected");
    } else {
      currentRegions.splice(index, 1);
      $(".add-map").find("#" + regionId).removeClass("selected");
    }

    this.updateOrder(currentRegions);
    this.selectedRegionsSubject.next([...currentRegions]);
    this.updateDisplayRegions();
  }

  private updateOrder(regions: { id: string; name: string; order: number }[]): void {
    regions.forEach((region, index) => (region.order = index + 1));
  }

  private updateDisplayRegions(): void {
    const regions = this.selectedRegionsSubject.getValue();
    const displayText = regions.map(region => region.name).join(' -> ');
    this.displayRegionsSubject.next(displayText);
  }

  resetMap(c :String): void {
    this.selectedRegionsSubject.next([]);
    this.displayRegionsSubject.next('');
    $(c+' .land.selected').removeClass('selected');
    console.log('Map has been reset!');
  }



  selectRegion2(regionId: string): void {
    this.add = false;
    const element = $(".info-map").find("#" + regionId);

    if (element.length > 0) {
        element.addClass("selected");
        setTimeout(() => {
           // element.removeClass("selected");
        }, 500); // Remove class just before the next one is selected
    } else {
        console.error("Element not found:", regionId);
    }
}

selectRegion3(regionId: string): void {
  const currentRegions = this.selectedRegionsSubject.getValue();
  const regionName = this.departmentMap[regionId] || 'Unknown';

  const index = currentRegions.findIndex(region => region.id === regionId);

  if (index === -1) {
    currentRegions.push({ id: regionId, name: regionName, order: currentRegions.length + 1 });
    $(".update-map").find("#" + regionId).addClass("selected");
  } else {
    currentRegions.splice(index, 1);
    $(".update-map").find("#" + regionId).removeClass("selected");}

  this.updateOrder(currentRegions);
  this.selectedRegionsSubject.next([...currentRegions]);
  this.updateDisplayRegions();
}
selectRegionFilter(regionId: string): void {
  const currentFilterRegions = this.selectedFilterRegionsSubject.getValue();
  const regionName = this.departmentMap[regionId] || 'Unknown';

  const index = currentFilterRegions.findIndex(region => region.id === regionId);

  if (index === -1) {
    currentFilterRegions.push({ id: regionId, name: regionName, order: currentFilterRegions.length + 1 });
    $(".filter-map").find("#" + regionId).addClass("selected");
  } else {
    currentFilterRegions.splice(index, 1);
    $(".filter-map").find("#" + regionId).removeClass("selected");}

  this.updateOrder(currentFilterRegions);
  this.selectedFilterRegionsSubject.next([...currentFilterRegions]);
}
}
