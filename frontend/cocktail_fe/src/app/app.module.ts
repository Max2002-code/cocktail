import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppHttpClient } from './shared/service/app-http-client.service';
import { FullLayaoutComponent } from './layout/full/full-layaout/full-layaout.component';
import { ContentLayoutComponent } from './layout/content/content-layout/content-layout.component';
import { StoreModule } from '@ngrx/store';
import { ApiInterceptionService } from './shared/service/api-interception.service';
import { AuthUser } from './models/user.model';
import { LoginComponent } from './pages/content-pages/login/login.component';
import { AuthService } from './shared/auth/auth.service';
import { AuthGuard } from './shared/auth/auth-guard.service';
import { LogoutComponent } from './pages/content-pages/logout/logout.component';
import { ErrorComponent } from './pages/content-pages/error/error.component';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { ApiService } from './shared/service/api.service';
import { ToastComponent } from './pages/shared-pages/toast/toast.component';
import { CocktailTransitionComponent } from './pages/shared-pages/cocktail-transition/cocktail-transition/cocktail-transition.component';
import { IntroLoaderComponent } from './pages/shared-pages/intro-loader/intro-loader.component';

export interface AppState {
  auth: any;
  token: string | null;
  user: AuthUser | null;
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    FullLayaoutComponent,
    ContentLayoutComponent,
    LogoutComponent,
    ErrorComponent,
    ToastComponent,
    CocktailTransitionComponent,
    IntroLoaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    StoreModule.forRoot({}, {}),
    NgxMaskDirective,
    NgxMaskPipe,
  ],
  providers: [AppHttpClient,
    {provide: HTTP_INTERCEPTORS, useClass: ApiInterceptionService, multi:true}, 
    ApiService,
    AuthGuard,
    provideNgxMask()],
  bootstrap: [AppComponent]
})
export class AppModule { }