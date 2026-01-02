import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { DoctorantsComponent } from './doctorants/doctorants.component';
import { CandidaturesComponent } from './candidatures/candidatures.component';
import { ReinscriptionsComponent } from './reinscriptions/reinscriptions.component';
import { SoutenancesComponent } from './soutenances/soutenances.component';

const routes: Routes = [
    { path: '', redirectTo: 'doctorants', pathMatch: 'full' },
    { path: 'doctorants', component: DoctorantsComponent },
    { path: 'candidatures', component: CandidaturesComponent },
    { path: 'reinscriptions', component: ReinscriptionsComponent },
    { path: 'soutenances', component: SoutenancesComponent }
];

@NgModule({
    declarations: [
        DoctorantsComponent,
        CandidaturesComponent,
        ReinscriptionsComponent,
        SoutenancesComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild(routes)
    ]
})
export class DirecteurModule { }
