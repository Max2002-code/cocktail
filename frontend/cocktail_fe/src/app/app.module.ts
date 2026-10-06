import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppHttpClient } from './shared/service/app-http-client.service';
import { FullLayaoutComponent } from './layout/full/full-layaout/full-layaout.component';
import { ContentLayoutComponent } from './layout/content/content-layout/content-layout.component';
import { StoreModule } from '@ngrx/store';
import { ApiInterceptionService } from './shared/service/api-interception.service';
import { UserModel } from './models/user.model';
import { AuthService } from './shared/auth/auth.service';
import { AuthGuard } from './shared/auth/auth-guard.service';
import { LogoutComponent } from './pages/content-pages/logout/logout.component';
import { ErrorComponent } from './pages/content-pages/error/error.component';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { ApiService } from './shared/service/api.service';
import { ToastComponent } from './pages/shared-pages/toast/toast.component';

export interface AppState {
  auth: any;
  token: string | null;
  user: UserModel | null;
}

function appInitializer(authService: AuthService) {
  return () => {
    return new Promise((resolve) => {
      //@ts-ignore
      authService.getUserByToken().subscribe().add(resolve);
    });
  };
}

@NgModule({
  declarations: [
    AppComponent,
    FullLayaoutComponent,
    ContentLayoutComponent,
    LogoutComponent,
    ErrorComponent,
    ToastComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    StoreModule.forRoot({}, {}),
    NgxMaskDirective,
    NgxMaskPipe,
  ],
  providers: [AppHttpClient,
    {provide: HTTP_INTERCEPTORS, useClass: ApiInterceptionService, multi:true}, 
    {provide: APP_INITIALIZER, useFactory: appInitializer, multi:true, deps:[AuthService]},
    ApiService,
    AuthGuard,
    provideNgxMask()],
  bootstrap: [AppComponent]
})
export class AppModule { }