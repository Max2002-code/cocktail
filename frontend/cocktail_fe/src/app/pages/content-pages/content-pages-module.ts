import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { LoginComponent } from "./login/login.component";
import { ContentPagesRoutingModule } from "./content-pages-routing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ChangeComuneComponent } from "./change-comune/change-comune.component";

@NgModule({
    imports: [
        CommonModule,
        ContentPagesRoutingModule,
        FormsModule,
        ReactiveFormsModule
    ],
    declarations: [
        LoginComponent,
        ChangeComuneComponent,
    ]
})
export class ContentPagesModule { }