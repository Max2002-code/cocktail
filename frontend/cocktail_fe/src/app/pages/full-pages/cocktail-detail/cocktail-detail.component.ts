import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService } from 'src/app/shared/service/api.service';
import { CocktailTransitionService } from 'src/app/shared/service/transition/cocktail-transition.service';


interface CocktailDetail {
  [key: string]: string | null;

  idDrink: string;
  strDrink: string;
  strDrinkAlternate: string | null;
  strTags: string | null;

  strCategory: string | null;
  strIBA: string | null;
  strAlcoholic: string | null;
  strGlass: string | null;

  strInstructions: string | null;
  strInstructionsIT: string | null;

  strDrinkThumb: string;
}


interface Ingredient {
  name: string;
  measure: string;
}


@Component({
  selector: 'app-cocktail-detail',
  templateUrl: './cocktail-detail.component.html',
  styleUrls: ['./cocktail-detail.component.css']
})
export class CocktailDetailComponent implements OnInit {

  private cocktailId = ''
  private transitionNotified = false
  cocktail: CocktailDetail | null = null;
  ingredients: Ingredient[] = [];
  loading = true;
  error = false;


  constructor( private route: ActivatedRoute, private router: Router, private http: ApiService,
    private cocktailService:CocktailTransitionService, private transitionService: CocktailTransitionService
  ) {}

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.loading = false;
      this.error = true;
      return;
    }

    this.cocktailId = id

    this.loadCocktail(id);
  }


  private loadCocktail(id: string): void {

    this.loading = true;
    this.error = false;

    this.http.getCocktailById(id).subscribe({
        next: (response: any) => {
          console.log(response)

          const cocktail = response?.drinks?.[0] ?? null;

          if (!cocktail) {
            this.error = true;
            this.loading = false;
            this.notifyTransitionReady()
            return;
          }

          this.cocktail = cocktail;

          this.ingredients = this.buildIngredients(cocktail);

          this.loading = false;

          requestAnimationFrame(() => {
            this.notifyTransitionReady()
          })
        },
        error: () => {

          this.loading = false;
          this.error = true;
          this.notifyTransitionReady()
        }

      });

  }

  private buildIngredients(
    cocktail: CocktailDetail
  ): Ingredient[] {

    const ingredients: Ingredient[] = [];

    for (let i = 1; i <= 15; i++) {

      const ingredient =
        cocktail[`strIngredient${i}`];

      const measure =
        cocktail[`strMeasure${i}`];

      if (
        !ingredient ||
        !ingredient.trim()
      ) {
        continue;
      }

      ingredients.push({
        name: ingredient.trim(),
        measure: measure?.trim() ?? ''
      });

    }

    return ingredients;
  }

  get instructions(): string {

    if (!this.cocktail) {
      return '';
    }

    /*
     * Se sono disponibili le istruzioni italiane,
     * le preferiamo.
     */
    return (
      this.cocktail.strInstructionsIT ||
      this.cocktail.strInstructions ||
      ''
    );

  }

  get tags(): string[] {

    if (!this.cocktail?.strTags) {
      return [];
    }

    return this.cocktail.strTags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => !!tag);
  }

  getMediumImg(src:string){
    return src + '/medium'
  }

  goBack(): void {
    this.router.navigate(['/cocktails']);
  }

  private notifyTransitionReady():void {
    if(!this.cocktailId || this.transitionNotified) return

    this.transitionNotified = true

    this.transitionService.notifyDetailReady(this.cocktailId)
  }

}