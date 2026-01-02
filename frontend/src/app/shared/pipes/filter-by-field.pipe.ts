import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterByField'
})
export class FilterByFieldPipe implements PipeTransform {
    transform(items: any[], field: string, value: any): any[] {
        if (!items) return [];
        if (!value || value === '') return items;
        return items.filter(item => item[field] === value);
    }
}
