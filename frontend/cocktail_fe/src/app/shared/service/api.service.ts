import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AppHttpClient } from './app-http-client.service';
import { AuthSession } from '../../models/auth.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  readonly base_url = environment.apiUrl.replace(/\/$/, '') + '/api/';
  readonly cocktail_Url = environment.cockatilUrl + '/api/json/v1/1/';

  constructor(private httpClient: AppHttpClient) { }

  login(username: string, password: string): Observable<AuthSession> {
    return this.httpClient.post<AuthSession>(this.base_url + 'auth/login', { username, password });
  }

  register(username: string, password: string): Observable<AuthSession> {
    return this.httpClient.post<AuthSession>(this.base_url + 'auth/register', { username, password });
  }

  getFavorites() {
    return this.httpClient.get<unknown[]>(this.base_url + 'favorites/');
  }

  getCategory() {
    return this.httpClient.getExternal(this.cocktail_Url + 'list.php?c=list');
  }

  getDrinksByCategory(category: string) {
    return this.httpClient.getExternal(this.cocktail_Url + 'filter.php?c=' + encodeURIComponent(category));
  }

  // tipo, descrizione e gradazione di un ingrediente (chiamata pubblica: niente token)
  getIngredientByName(name:string){
    let url = this.cocktail_Url + `json/v1/1/search.php?i=${encodeURIComponent(name)}`

    return this.httpClient.getExternal(url)
  }

  getCocktailById(id:string){
    let url = this.cocktail_Url + `/json/v1/1/lookup.php?i=${id}`
  getCocktailByName(name: string) {
    return this.httpClient.getExternal(this.cocktail_Url + 'search.php?s=' + encodeURIComponent(name));
  }

  getCocktailById(id: string) {
    return this.httpClient.getExternal(this.cocktail_Url + 'lookup.php?i=' + encodeURIComponent(id));
  }
}
