import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AppHttpClient } from './app-http-client.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  public base_url = environment.apiUrl+"/api/";
  public cocktail_Url = environment.cockatilUrl + '/api/'

  constructor(private httpClient:AppHttpClient) { }

  getCategory(){
    let url = this.cocktail_Url + 'json/v1/1/list.php?c=list'

    return this.httpClient.getExternal(url)
  }

  getDrinksByCategory(category:string){
    let url = this.cocktail_Url + `json/v1/1/filter.php?c=${category}`

    return this.httpClient.getExternal(url)
  }

  getCocktailByName(name:string){
    let url = this.cocktail_Url + `/json/v1/1/search.php?s=${name}`

    return this.httpClient.get(url)
  }

  // tipo, descrizione e gradazione di un ingrediente (chiamata pubblica: niente token)
  getIngredientByName(name:string){
    let url = this.cocktail_Url + `json/v1/1/search.php?i=${encodeURIComponent(name)}`

    return this.httpClient.getExternal(url)
  }

  getCocktailById(id:string){
    let url = this.cocktail_Url + `/json/v1/1/lookup.php?i=${id}`

    return this.httpClient.get(url)
  }
}
