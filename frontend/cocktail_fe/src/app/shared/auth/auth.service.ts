import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, catchError, finalize, map, Observable, of, Subscription, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
// Import or define UserType
import { UserModel } from 'src/app/models/user.model';
import { ReportServiceService } from '../service/report.service.service';
import { Router } from '@angular/router';

export type UserType = UserModel | undefined;

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy{

  private unsubscribe: Subscription[]=[];
  private authLocalStorageToken = `token-${environment.USER_KEY}`;
  private userLocalStorageToken = `user-${environment.USER_KEY}`;

  currentUser$: Observable<UserType>;
  isLoading$: Observable<boolean>;
  currentUserSubject: BehaviorSubject<UserType>;
  isLoadingSubject: BehaviorSubject<boolean>;
  

  get currentUserValue(): UserType{
    return this.currentUserSubject?.value;
  }

  set currentUserValue(user: UserType) {
    this.currentUserSubject?.next(user);
  }


  constructor(private authHttpService:ReportServiceService, private router:Router) { 
  this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.currentUserSubject = new BehaviorSubject<UserType>(undefined);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.isLoading$ = this.isLoadingSubject.asObservable(); 
  }

  login(username:string, password:string): Observable<UserType> {
    this.isLoadingSubject?.next(true)

    return this.authHttpService.login(username, password).pipe(
      map((auth: UserModel)=>{
        const result = this.setAuthFromLocalStorage(auth);
        return result;
      }),
      switchMap(() => {
        const user = this.getUserByToken()
        return user;
      }),
      catchError((err)=>{
        console.error(err);
        return of(undefined);
      }),
      finalize(()=> this.isLoadingSubject?.next(false))
    )
  }

  logout(){
    localStorage.removeItem(this.authLocalStorageToken);
    localStorage.removeItem(this.userLocalStorageToken);
    
    this.router.navigate(['/login'], {
      queryParams: {  }
    })
  }

  private setAuthFromLocalStorage(auth: UserModel): boolean {
    if (auth && auth.key) {
      localStorage.setItem(this.authLocalStorageToken, JSON.stringify(auth));
      return true;
    }
    return false;
  }

  getUserByToken(): Observable<UserType> {
    const auth = this.getAuthFromLocalStorage();
    if (!auth || !auth.key) {
      return of(undefined);
    }

    this.isLoadingSubject?.next(true);
    return this.authHttpService.getUserByToken().pipe(
      map((user: UserType) => {
        if (user) {
          this.currentUserSubject?.next(user);
        } else {
          this.logout();
        }
        return user;
      }),
      finalize(() => this.isLoadingSubject?.next(false))
    );
  }

  public getAuthFromLocalStorage(): UserModel | undefined {
    try {
      const lsValue = localStorage.getItem(this.authLocalStorageToken);
      if (!lsValue) {
        return undefined;
      }
      return JSON.parse(lsValue);
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  public setUserFromLocalStorage(user: UserModel): boolean {
    if (user){
      localStorage.setItem(this.userLocalStorageToken, JSON.stringify(user));
      return true;
    }
    return false
  }

  public getUserFromLocalStorage(): UserModel | undefined {
    const userStr = localStorage.getItem(this.userLocalStorageToken);
    if (userStr)
      return JSON.parse(userStr) as UserModel;
    return undefined;
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
