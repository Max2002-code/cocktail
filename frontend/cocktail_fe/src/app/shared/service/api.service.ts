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
}
