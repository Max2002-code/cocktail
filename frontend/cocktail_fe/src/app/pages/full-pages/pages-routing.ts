import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CocktailListComponent } from './cocktail-list/cocktail-list.component';

const routes: Routes = [
    {
        path:'',
        children:[
            { path:'', redirectTo: '', pathMatch:"full" },
            { path: 'cocktail_list', component: CocktailListComponent }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FullPagesRoutingModule { }