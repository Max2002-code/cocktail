import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from 'src/app/shared/service/api.service';
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

@Component({
  selector: 'app-cocktail-list',
  templateUrl: './cocktail-list.component.html',
  styleUrls: ['./cocktail-list.component.css']
})
export class CocktailListComponent implements OnInit{

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

  constructor(private http:ApiService, private toastService: ToastService, private transitionService: CocktailTransitionService){}

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
    
    const imageUrl = this.getOriginalImageUrl(event.cocktail.strDrinkThumb)

    try{
      await this.preloadImage(imageUrl)
    }
    catch (error){

    }

    this.transitionService.startTransition(event.cocktail, event.imageRect, imageUrl)
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

  private getOriginalImageUrl(imageUrl:string){
    return imageUrl.replace(/\/(small|medium|large)\/?$/, '')
  }

  private getTransitionImageUrl(imageUrl:string){
    const base_url = imageUrl.replace(/\/(small|medium|large)\/?$/, '')

    return `${base_url}/large`
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
