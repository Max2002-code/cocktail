import { Routes, RouterModule } from '@angular/router';
import { DocumentComponent } from './document/document.component';
import { NgModule } from '@angular/core';
import { PdfViewerComponent } from './pdf-viewer/pdf-viewer.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { LottiComponent } from './lotti/lotti.component';
import { UsersComponent } from './users/users.component';
import { ReportComponent } from './report/report.component';

const routes: Routes = [
    {
        path:'',
        children:[
            { path:'', redirectTo: '', pathMatch:"full" },
            { path:'documenti', component: DocumentComponent, data: {title: 'list'} },
            { path:'viewer/:tipo/:id', component: PdfViewerComponent,},
            { path: 'statistics', component:StatisticsComponent},
            { path: 'scatole', component:LottiComponent},
            { path: 'userStats', component:UsersComponent },
            { path: 'user/single', component:ReportComponent },
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FullPagesRoutingModule { }