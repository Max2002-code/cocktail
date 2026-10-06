import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { ChangeComuneComponent } from './change-comune/change-comune.component';

const routes: Routes = [
    {
        path:'',
        children:[
            {
                path:'login',
                component: LoginComponent,
            },
            { path:'change/comune', component: ChangeComuneComponent }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ContentPagesRoutingModule { }