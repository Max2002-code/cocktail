import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { NgSelectModule } from "@ng-select/ng-select";
import { FullPagesRoutingModule } from "./pages-routing";
import { DocumentComponent } from "./document/document.component";
import { FormsModule } from "@angular/forms";
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { PdfViewerComponent } from './pdf-viewer/pdf-viewer.component';
import { SafeUrlPipe } from "./pdf-viewer/pipe";
import { StatisticsComponent } from './statistics/statistics.component';
import { LottiComponent } from './lotti/lotti.component';
import { UsersComponent } from './users/users.component';
import { ReportComponent } from './report/report.component';
import { IMaskModule } from "angular-imask";

@NgModule({
    imports: [
        CommonModule,
        FullPagesRoutingModule,
        NgSelectModule,
        FormsModule,
        NgxDatatableModule,
        IMaskModule,
    ],
    declarations: [
        DocumentComponent,
        PdfViewerComponent,
        SafeUrlPipe,
        StatisticsComponent,
        LottiComponent,
        UsersComponent,
        ReportComponent,
    ],
})
export class FullPagesModule { }