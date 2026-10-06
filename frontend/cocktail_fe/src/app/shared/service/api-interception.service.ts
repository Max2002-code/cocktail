// src/app/interceptors/api-interception.service.ts

import { Injectable, OnDestroy } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '../../app.module'; // Percorso corretto all'interfaccia AppState
import { getToken } from '../../store/selectors/login.selector';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class ApiInterceptionService implements HttpInterceptor, OnDestroy {

  private ngDestroy$ = new Subject<void>();
  private token: string | null = null;

  constructor(private router: Router, private store: Store<AppState>) {
    // Ascolta il token nello store
    this.store.select(getToken)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(token => {
        this.token = token;
        if (token) {
          localStorage.setItem('token', token); // Salva anche in localStorage
        }
      });
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const route = this.router.url.split('?')[0];

    // Usa il token da store, oppure da localStorage
    const authToken = this.token || localStorage.getItem('token');

    if (authToken && route !== '/ticketconfirm') {
      const cleanedToken = authToken.replace(/"/g, '');
      req = req.clone({
        setHeaders: {
          Authorization: `Token ${cleanedToken}`
        }
      });
    }

    return next.handle(req);
  }

  ngOnDestroy(): void {
    this.ngDestroy$.next();
    this.ngDestroy$.complete();
  }
}
