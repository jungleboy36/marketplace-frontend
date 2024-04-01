// update-duration.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'updateDuration'
})
export class UpdateDurationPipe implements PipeTransform {
  transform(value: string): string {
    const now = new Date();
    const updateDate = new Date(value);
    const diffMs = now.getTime() - updateDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    console.log(diffDays + " days");
    const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (diffDays > 0) {
      return ` il y'a ${diffDays} jours`;
    } else if (diffHrs > 0) {
      return `il y'a ${diffHrs} heures`;
    } else {
      return `il y'a ${diffMins} minutes`;
    }
  }
}
