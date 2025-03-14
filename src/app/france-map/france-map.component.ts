import { Component, Input, OnInit } from '@angular/core';
import { MapService } from '../services/map.service';

@Component({
  selector: 'app-france-map',
  templateUrl: './france-map.component.html',
  styleUrls: ['./france-map.component.css']
})
export class FranceMapComponent implements OnInit {
  selectedRegions$ = this.mapService.selectedRegions$;
  displayRegions$ = this.mapService.displayRegions$;
  @Input() modalType!: string; 
  constructor(private mapService: MapService) {}

  ngOnInit(): void {
  }

  regionClicked(event: MouseEvent): void {
    const target = event.target as SVGElement;
    if(this.modalType === 'update') {
      if (target.classList.contains('land')) {
        this.mapService.selectRegion3(target.id);
      }
    }
    else if(this.modalType === 'add') { {
      this.mapService.selectRegion(target.id);
    }}
    else{
      this.mapService.selectRegionFilter(target.id);
    }
  }

  resetMap(c  :String): void {
    this.mapService.resetMap(c);
  }

  

  
}
