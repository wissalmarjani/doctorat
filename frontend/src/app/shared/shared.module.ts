import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Shared Pipes
import { FilterByFieldPipe } from './pipes/filter-by-field.pipe';
import { CountPipe } from './pipes/count.pipe';

@NgModule({
    declarations: [
        FilterByFieldPipe,
        CountPipe
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule
    ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        FilterByFieldPipe,
        CountPipe
    ]
})
export class SharedModule { }
