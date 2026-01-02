import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { CandidatureComponent } from './candidature/candidature.component';
import { DossierComponent } from './dossier/dossier.component';

const routes: Routes = [
    { path: '', redirectTo: 'candidature', pathMatch: 'full' },
    { path: 'candidature', component: CandidatureComponent },
    { path: 'dossier', component: DossierComponent }
];

@NgModule({
    declarations: [
        CandidatureComponent,
        DossierComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild(routes)
    ]
})
export class CandidatModule { }
