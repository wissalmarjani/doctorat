import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'count'
})
export class CountPipe implements PipeTransform {
    transform(items: any[]): number {
        if (!items) return 0;
        return items.length;
    }
}
