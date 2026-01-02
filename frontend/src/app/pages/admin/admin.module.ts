import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { CandidaturesComponent } from './candidatures/candidatures.component';
import { UsersComponent } from './users/users.component';
import { InscriptionsComponent } from './inscriptions/inscriptions.component';
import { SoutenancesComponent } from './soutenances/soutenances.component';
import { CampagnesComponent } from './campagnes/campagnes.component';
import { DocumentsComponent } from './documents/documents.component';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
    { path: '', redirectTo: 'candidatures', pathMatch: 'full' },
    { path: 'candidatures', component: CandidaturesComponent },
    { path: 'users', component: UsersComponent },
    { path: 'inscriptions', component: InscriptionsComponent },
    { path: 'soutenances', component: SoutenancesComponent },
    { path: 'campagnes', component: CampagnesComponent },
    { path: 'documents', component: DocumentsComponent }
];

@NgModule({
    declarations: [
        CandidaturesComponent,
        UsersComponent,
        InscriptionsComponent,
        SoutenancesComponent,
        CampagnesComponent,
        DocumentsComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild(routes)
    ]
})
export class AdminModule { }
