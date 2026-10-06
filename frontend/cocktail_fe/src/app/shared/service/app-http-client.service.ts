import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthModel } from 'src/app/models/auth.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppHttpClient {
  private authLocalToken = `token-${environment.USER_KEY}`;

  constructor(private http: HttpClient) { }

  public createAuthorizationHeader() {
    const auth = this.getAuthLocalStorage()

    let headers: HttpHeaders = new HttpHeaders({ 'Content-Type': 'application/json'})
    if(!auth) {return headers;}
    headers = new HttpHeaders({'Content-Type': 'application/json', 'Authorization': "Token "+auth.key});
    return headers;
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

  get(url: string) {
    let headers = new HttpHeaders({'Content-Type': 'application/json'});
    headers = this.createAuthorizationHeader();
    return this.http.get<any>(url, { headers:headers });
  }

  post(url:string, data:any) {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    headers = this.createAuthorizationHeader();
    return this.http.post<any>(url, data, {
      headers: headers
    });
  }

  getBlob(url:string, opt:any={}): Observable<any>{
    let headers = this.createAuthorizationHeader()
    opt.headers = headers
    return this.http.get(url, opt)
  }

}
