import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface CocktailTransitionRequest{
  cocktail: any
  imageRect: DOMRect
  imageUrl: string
}

@Injectable({
  providedIn: 'root'
})
export class CocktailTransitionService {

  private transitionSubject = new Subject<CocktailTransitionRequest>()
  transition$ = this.transitionSubject.asObservable()

  private detailReadySubject = new Subject<string>()
  detailReady$ = this.detailReadySubject.asObservable()

  constructor() { }

  startTransition(cocktail:any, imageRect: DOMRect, imageUrl:string): void {
    console.log('arrivato al servizio')
    this.transitionSubject.next({cocktail, imageRect, imageUrl})
  }

  notifyDetailReady(cocktailId: string): void{
    this.detailReadySubject.next(cocktailId)
  }
}
