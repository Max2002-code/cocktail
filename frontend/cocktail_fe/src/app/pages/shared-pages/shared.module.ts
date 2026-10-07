import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { IMaskModule } from 'angular-imask';
import { PaginatorComponent } from '../full-pages/cocktail-list/components/paginator/paginator.component';
import { CocktailTransitionComponent } from './cocktail-transition/cocktail-transition/cocktail-transition.component';

@NgModule({
  declarations: [
    PaginatorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    IMaskModule
  ],
  exports: [PaginatorComponent]
})
export class SharedModule { }
