import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthModel } from 'src/app/models/auth.model';
import { Observable } from 'rxjs';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';

@Injectable({
  providedIn: 'root'
})
export class AppHttpClient {
  private authLocalToken = `token-${environment.USER_KEY}`;

  constructor(private http: HttpClient) { }

  public createAuthorizationHeader() {
    const auth = this.getAuthLocalStorage()

    if (!auth){
      return new HttpHeaders()
    }

    return new HttpHeaders({
      Authorization: `Bearer ${auth.key}`
    })
  }
      
  public getAuthLocalStorage(): AuthModel | undefined {
    try {

      const auth = localStorage.getItem(this.authLocalToken);
      if (auth) {
        return JSON.parse(auth);
      }
    } catch (error) {
      console.error(error);
      return undefined;
    }
    return undefined;
  }

  //get backend locale
  get<T = any>(url: string): Observable<T> {
    let headers = this.createAuthorizationHeader();
    return this.http.get<T>(url, { headers:headers });
  }

  //post backend locale
  post<T = any>(url:string, data:any) {
    let headers = this.createAuthorizationHeader();
    return this.http.post<any>(url, data, {
      headers: headers
    });
  }

  getExternal<T = any>(url: string): Observable<T> {
    return this.http.get<T>(url)
  }

}
