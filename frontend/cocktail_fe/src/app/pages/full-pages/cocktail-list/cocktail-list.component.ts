import { Component, OnInit } from '@angular/core';
import { first, firstValueFrom } from 'rxjs';
import { ApiService } from 'src/app/shared/service/api.service';
import { ToastService } from 'src/app/shared/service/toast/toast.service';

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

  constructor(private http:ApiService, private toastService: ToastService){}

  get totalPages():number {
    return Math.max(1, Math.ceil(this.cocktails.length / this.pageSize))
  }

  get paginatedCocktails(): Cocktail[] {
    const start = (this.currentPage - 1) * this.pageSize

    const end = start + this.pageSize

    return this.cocktails.slice(start, end)
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
      }
      catch(error){
        console.error(error)

        this.toastService.error("Errore nel download delle informazioni dei cocktails")
      }
    }
  }

  getSmallThumbnail(src: string){
    return src + '/small'
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

  openCocktailDetail(event:string){
    console.log(event)
  }

}
