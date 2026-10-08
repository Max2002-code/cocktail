import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import gsap from 'gsap';
import { catchError, filter, firstValueFrom, forkJoin, of } from 'rxjs';

import { ApiService } from 'src/app/shared/service/api.service';
import { CocktailTransitionService } from 'src/app/shared/service/transition/cocktail-transition.service';
import { ingredientImage, isLiquidAmount, layerColor, partsCount, volumeMl } from 'src/app/shared/utils/cocktail-measure';
import { GlassLayer } from './components/glass/glass.component';


/*
 * Solo dati dell'API TheCocktailDB: i campi della ricetta (lookup.php), tipo e gradazione di
 * ogni ingrediente (search.php?i=) e le foto degli ingredienti. Niente stime né conversioni.
 */
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
  strImageAttribution: string | null;
}


interface Ingredient {
  name: string;
  measure: string;

  // foto dell'ingrediente (dall'API immagini)
  image: string;
  imageBig: string;
  noImage: boolean;

  // dall'ingrediente, solo se l'API li fornisce
  type: string | null;
  abv: string | null;
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

  // gli strati del bicchiere: solo gli ingredienti con un volume esplicito
  layers: GlassLayer[] = [];
  filled = false;

  // ingrediente evidenziato (passando sulla riga o sulla mensola)
  activeIndex: number | null = null;

  // vero finché la foto sta atterrando: la polaroid vera aspetta e poi prende il suo posto
  transitionActive$ = this.transitionService.active$;

  loading = true;
  error = false;


  constructor( private route: ActivatedRoute, private router: Router, private http: ApiService,
    private transitionService: CocktailTransitionService, private host: ElementRef<HTMLElement>
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
          console.log(response);
          const cocktail = response?.drinks?.[0] ?? null;

          if (!cocktail) {
            this.error = true;
            this.loading = false;
            this.notifyTransitionReady()
            return;
          }

          this.cocktail = cocktail;

          this.ingredients = this.buildIngredients(cocktail);
          this.layers = this.buildLayers();

          this.loading = false;

          this.loadIngredientDetails();

          // le cose sulla mensola aspettano fuori scena finché il drink non comincia a riempirsi
          setTimeout(() => this.hideShelf());

          this.startFill();

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

  /*
   * Gli strati del bicchiere. Il primo ingrediente della ricetta sta in cima, così la legenda
   * accanto al bicchiere segue l'ordine della scheda.
   *  - misura in oz, cl, ml...: strato proporzionale al volume;
   *  - se la ricetta è tutta in "parts": strati proporzionali alle parti (rapporti esatti);
   *  - liquido senza volume ("1 splash", "Dash", "Juice of 1/2"): sottile strato-segnaposto;
   *  - non liquidi (sale, "1 slice", foglie): nessuno strato, restano nella scheda e sulla mensola.
   */
  private buildLayers(): GlassLayer[] {
    const entries = this.ingredients.map(ingredient => ({
      ingredient,
      ml: volumeMl(ingredient.measure),
      parts: partsCount(ingredient.measure),
      liquid: isLiquidAmount(ingredient.measure)
    }));

    const hasVolume = entries.some(entry => entry.ml !== null);

    // senza volumi assoluti, le parti danno comunque proporzioni esatte
    const useParts = !hasVolume && entries.some(entry => entry.parts !== null);

    const included = entries
      .map(entry => {
        const weight = entry.ml !== null ? entry.ml : useParts && entry.parts !== null ? entry.parts : null;

        return { entry, weight };
      })
      .filter(item => item.weight !== null || item.entry.liquid);

    return included
      .map((item, index) => ({
        name: item.entry.ingredient.name,
        color: layerColor(index, included.length),
        ml: item.weight ?? 0,
        measure: item.entry.ingredient.measure,
        marker: item.weight === null
      }))
      .reverse();
  }

  // tipo e gradazione di ogni ingrediente: chiamate in parallelo, la pagina non le aspetta
  private loadIngredientDetails(): void {
    const requests = this.ingredients.map(ingredient =>
      this.http.getIngredientByName(ingredient.name).pipe(catchError(() => of(null)))
    );

    forkJoin(requests).subscribe(responses => {
      responses.forEach((response: any, index) => {
        const info = response?.ingredients?.[0];

        if (!info) {
          return;
        }

        this.ingredients[index].type = info.strType || null;
        this.ingredients[index].abv = info.strABV || null;
      });
    });
  }

  /*
   * Il bicchiere si riempie quando il "sorso" ha scoperto la pagina:
   * aprendo il dettaglio da un link diretto parte subito.
   */
  private async startFill(): Promise<void> {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.filled = true;
      return;
    }

    await Promise.race([
      firstValueFrom(this.transitionService.active$.pipe(filter(active => !active))),
      new Promise(resolve => setTimeout(resolve, 2500))
    ]);

    await new Promise(resolve => setTimeout(resolve, 350));

    this.filled = true;
    this.dealShelf();
  }

  /* gli ingredienti sulla mensola: nascosti in attesa, poi si posano uno dopo l'altro mentre il bicchiere si riempie */
  private shelfItems(): HTMLElement[] {
    return Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('.shelf-item'));
  }

  private hideShelf(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    gsap.set(this.shelfItems(), { y: -34, opacity: 0 });
  }

  private dealShelf(): void {
    gsap.to(this.shelfItems(), {
      y: 0,
      opacity: 1,
      duration: 0.6,
      ease: 'power3.out',
      stagger: 0.08,
      clearProps: 'transform,opacity'
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
        measure: measure?.trim() ?? '',
        image: ingredientImage(ingredient, 'Small'),
        imageBig: ingredientImage(ingredient, 'Medium'),
        noImage: false,
        type: null,
        abv: null
      });

    }

    return ingredients;
  }

  setActive(index: number | null): void {
    this.activeIndex = index;
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
