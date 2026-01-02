import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';

const routes: Routes = [
    { path: '', component: UnauthorizedComponent },
    { path: 'unauthorized', component: UnauthorizedComponent }
];

@NgModule({
    declarations: [UnauthorizedComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes)
    ]
})
export class ErrorsModule { }
