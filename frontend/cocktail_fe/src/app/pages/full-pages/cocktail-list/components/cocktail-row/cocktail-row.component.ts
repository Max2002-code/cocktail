import { Component, EventEmitter, Input, Output } from '@angular/core';

interface Cocktail{
  idDrink: string
  strDrink: string
  strDrinkThumb: string
}

@Component({
  selector: 'app-cocktail-row',
  templateUrl: './cocktail-row.component.html',
  styleUrls: ['./cocktail-row.component.css']
})
export class CocktailRowComponent {

  @Input() cocktail!:Cocktail
  @Input() favorite: boolean = false

  @Output() favoriteChange = new EventEmitter<string>()
  @Output() open = new EventEmitter<string>()

  toggleFavorite(): void {
    this.favoriteChange.emit(this.cocktail.idDrink)
  }

  openCocktail(): void {
    this.open.emit(this.cocktail.idDrink)
  }

  getSmallThumbail(src:string){
    return src + '/small'
  }

}
