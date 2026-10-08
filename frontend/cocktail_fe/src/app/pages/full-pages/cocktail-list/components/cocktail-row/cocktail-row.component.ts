import { Component, EventEmitter, Input, Output } from '@angular/core';

interface Cocktail{
  idDrink: string
  strDrink: string
  strDrinkThumb: string
}

export interface CocktailOpenEvent {
  cocktail: Cocktail
  imageRect: DOMRect
  imageElement: HTMLElement
}

@Component({
  selector: 'app-cocktail-row',
  templateUrl: './cocktail-row.component.html',
  styleUrls: ['./cocktail-row.component.css']
})
export class CocktailRowComponent {

  @Input() cocktail!:Cocktail
  @Input() index: number = 0
  @Input() favorite: boolean = false

  @Output() favoriteChange = new EventEmitter<string>()
  @Output() open = new EventEmitter<CocktailOpenEvent>()

  toggleFavorite(event:MouseEvent): void {

    event.stopPropagation()

    this.favoriteChange.emit(this.cocktail.idDrink)
  }

  openCocktail(imageElement: HTMLElement): void {
    const imageRect = imageElement.getBoundingClientRect()

    this.open.emit({ cocktail:this.cocktail, imageRect, imageElement })
  }

  openFromButton(event: MouseEvent, imageElement:HTMLElement){
    event.stopPropagation()

    this.openCocktail(imageElement)
  }

  getSmallThumbail(src:string){
    if (!src){
      return ''
    }
    
    return src + '/small'
  }

}
