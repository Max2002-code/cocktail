import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import gsap from 'gsap';
import { filter, firstValueFrom } from 'rxjs';
import { ApiService } from 'src/app/shared/service/api.service';
import { IntroService } from 'src/app/shared/service/intro/intro.service';
import { ToastService } from 'src/app/shared/service/toast/toast.service';
import { CocktailTransitionService } from 'src/app/shared/service/transition/cocktail-transition.service';
import { CocktailOpenEvent } from './components/cocktail-row/cocktail-row.component';

interface Category{
  strCategory:string
}

interface Cocktail{
  idDrink: string
  strDrink: string
  strDrinkThumb: string
}

/*
 * Le righe si ingrandiscono mentre si avvicinano al punto di messa a fuoco (FOCUS_AT, in
 * frazione dell'altezza dello schermo) e si rimpiccioliscono e sbiadiscono allontanandosene.
 */
const FOCUS_AT = 0.56
const MIN_SCALE = 0.8
const MIN_OPACITY = 0.4

@Component({
  selector: 'app-cocktail-list',
  templateUrl: './cocktail-list.component.html',
  styleUrls: ['./cocktail-list.component.css']
})
export class CocktailListComponent implements OnInit, AfterViewInit, OnDestroy{

  // l'entrata del titolo si vede una volta per caricamento: tornando dal dettaglio non si ripete
  private static heroPlayed = false

  categories: Category[] = []
  cocktails:Cocktail[] = []
  selectedCategory:string | undefined

  currentPage:number = 1
  pageSize:number = 10

  searchTerm:string = '';
  sortBy:'name-asc' | 'name-desc' = 'name-asc';
  onlyFavorites:boolean = false;
  filteredCocktails: Cocktail[] = [];

  private imagePreloadCache = new Map<string, Promise<void>>()

  constructor(private http:ApiService, private toastService: ToastService, private transitionService: CocktailTransitionService,
    private intro: IntroService, private host: ElementRef<HTMLElement>, private zone: NgZone){}

  private focusFrame = 0
  private listObserver?: MutationObserver
  private focusEnabled = !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  private onScroll = () => {
    if (!this.focusEnabled || this.focusFrame){
      return
    }

    this.focusFrame = requestAnimationFrame(() => {
      this.focusFrame = 0
      this.applyFocus()
    })
  }

  ngAfterViewInit(): void {
    this.playHero()

    if (!this.focusEnabled){
      return
    }

    // fuori da Angular: lo scroll non deve far girare il change detection
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onScroll, { passive: true })
      window.addEventListener('resize', this.onScroll)

      // cambiano le righe (categoria, pagina, filtri): si ricalcola
      this.listObserver = new MutationObserver(() => this.onScroll())
      this.listObserver.observe(this.host.nativeElement, { childList: true, subtree: true })
    })

    this.onScroll()
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll)
    window.removeEventListener('resize', this.onScroll)

    this.listObserver?.disconnect()
    cancelAnimationFrame(this.focusFrame)
  }

  private applyFocus(): void {
    const rows = Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('app-cocktail-row'))

    const viewport = window.innerHeight
    const focus = viewport * FOCUS_AT

    // prima si legge tutto, poi si scrive: nessun layout forzato a ogni riga
    const distances = rows.map(row => {
      const rect = row.getBoundingClientRect()

      // il perno è a metà altezza: la scala non sposta il centro, quindi non si innesca da sola
      return Math.min(1, Math.abs(rect.top + rect.height / 2 - focus) / (viewport * 0.55))
    })

    rows.forEach((row, index) => {
      const distance = distances[index]

      row.style.transform = `scale(${(1 - (1 - MIN_SCALE) * Math.pow(distance, 1.2)).toFixed(3)})`
      row.style.opacity = (1 - (1 - MIN_OPACITY) * Math.pow(distance, 1.6)).toFixed(3)
    })
  }

  /*
   * Il testo del titolo sale da sotto il bordo della riga che lo maschera.
   * Nel css è già nella sua posizione finale: se qualcosa fallisce la pagina resta leggibile.
   */
  private async playHero(): Promise<void> {
    if (CocktailListComponent.heroPlayed || window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      return
    }

    CocktailListComponent.heroPlayed = true

    const lines = this.host.nativeElement.querySelectorAll('.line-inner')

    // finché dura il rito d'apertura il titolo aspetta fuori scena
    gsap.set(lines, { yPercent: 110 })

    // il timeout evita che il titolo resti nascosto se il segnale non arriva
    await Promise.race([
      firstValueFrom(this.intro.done$.pipe(filter(done => done))),
      new Promise(resolve => setTimeout(resolve, 4000))
    ])

    gsap.to(lines, {
      yPercent: 0,
      duration: 0.9,
      ease: 'power4.out',
      stagger: 0.09,
      clearProps: 'transform'
    })
  }

  get totalPages():number {
    return Math.max(1, Math.ceil(this.cocktails.length / this.pageSize))
  }

  get paginatedCocktails(): Cocktail[] {
    const start = (this.currentPage - 1) * this.pageSize

    const end = start + this.pageSize

    return this.filteredCocktails.slice(start, end)
  }

  async ngOnInit() {
    try{
      const data = await firstValueFrom(this.http.getCategory())
      this.categories = data.drinks.sort((a:Category, b:Category) => 
        a.strCategory.localeCompare(b.strCategory))

      if(this.categories) {
        this.selectCategory(this.categories[0].strCategory)
      }
    } 
    catch(error) {
      console.error(error)

      this.toastService.error("Errore nel download delle categorie")
    }
  }

  async selectCategory(category:string | undefined){
    this.resetPage()
    this.selectedCategory = category
    

    if(category){
      try{
        const data = await firstValueFrom(this.http.getDrinksByCategory(category))
        this.cocktails = data.drinks
        this.filteredCocktails = [...this.cocktails]
      }
      catch(error){
        console.error(error)

        this.toastService.error("Errore nel download delle informazioni dei cocktails")
      }
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page
  }

  resetPage():void {
    this.currentPage = 1
  }

  isFavorite(id:string){
    return false
  }

  toggleFavorite(event: string){
    console.log(event)
  }

  async openCocktailDetail(event: CocktailOpenEvent): Promise<void> {
    
    const imageUrl = this.getTransitionImageUrl(event.cocktail.strDrinkThumb)

    try{
      await this.preloadImage(imageUrl)
    }
    catch (error){

    }

    this.transitionService.startTransition(event.cocktail, event.imageRect, imageUrl, event.imageElement)
  }

  applyFilters(){
    let result = [...this.cocktails]

    switch(this.sortBy){
      case 'name-asc':
        result.sort((a:Cocktail, b:Cocktail) => a.strDrink.localeCompare(b.strDrink))
        break

      case 'name-desc':
        result.sort((a:Cocktail, b:Cocktail) => b.strDrink.localeCompare(a.strDrink))
        break
    }


    this.filteredCocktails = result
    this.currentPage = 1
  }

  clearSearch(){
    this.selectedCategory = this.categories[0].strCategory
    this.filteredCocktails = this.cocktails
    this.searchTerm = ''
  }

  async searchCocktailByName(){

    let search = this.searchTerm.trim()
    if (search === '' || search === null || search === undefined){
      this.clearSearch()

      return
    }

    try{
      const data = await firstValueFrom(this.http.getCocktailByName(this.searchTerm))
      this.selectedCategory = undefined
      this.filteredCocktails = data.drinks
    }
    catch(error){
      console.error(error)

      this.toastService.error('Errore nella ricerca del cockatil per nome')
    }
  }

  // stesso URL (originale, 700px) per il preload in hover, per il click e per l'hero del dettaglio:
  // l'immagine è già in cache quando parte la transizione
  private getTransitionImageUrl(imageUrl:string){
    return imageUrl.replace(/\/(small|medium|large)\/?$/, '')
  }

  private preloadImage(url:string): Promise<void> {
    const cached = this.imagePreloadCache.get(url)

    if(cached) return cached

    const promise = new Promise<void>((resolve, reject) => {
      
      const image = new Image()
      image.onload = () => resolve()
      image.onerror = () => reject()

      image.src = url
    })

    this.imagePreloadCache.set(url, promise)

    return promise
  }

  preloadCocktailImage(cocktail:Cocktail): void {
    if(!cocktail.strDrinkThumb) return

    const imageUrl = this.getTransitionImageUrl(cocktail.strDrinkThumb)

    this.preloadImage(imageUrl).catch(() => {

    })
  }

}
