import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { ParcoursComponent } from './parcours/parcours.component';
import { InscriptionsComponent } from './inscriptions/inscriptions.component';
import { SoutenanceComponent } from './soutenance/soutenance.component';
import { DocumentsComponent } from './documents/documents.component';

const routes: Routes = [
    { path: '', redirectTo: 'parcours', pathMatch: 'full' },
    { path: 'parcours', component: ParcoursComponent },
    { path: 'inscriptions', component: InscriptionsComponent },
    { path: 'soutenance', component: SoutenanceComponent },
    { path: 'documents', component: DocumentsComponent }
];

@NgModule({
    declarations: [
        ParcoursComponent,
        InscriptionsComponent,
        SoutenanceComponent,
        DocumentsComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild(routes)
    ]
})
export class DoctorantModule { }
