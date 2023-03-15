import { StoreModule } from '@ngrx/store';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './@shared/shared.module';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { loginReducer, pushMessage } from './@core/redux/login/login.reducer';
import { CoreModule } from './@core/core.module';
import { CanDeactivateGuard } from './@core/guards/deactivate-guard';
import { WebsocketComponent } from './websocket/websocket.component';

@NgModule({
  declarations: [AppComponent, WebsocketComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    AppRoutingModule,
    SharedModule,
    StoreModule.forRoot({ login: loginReducer, push: pushMessage }),
    CoreModule,
    !environment.production ? StoreDevtoolsModule.instrument() : [],
  ],
  exports: [SharedModule, CoreModule],
  providers: [CanDeactivateGuard],
  bootstrap: [AppComponent],
})
export class AppModule {}
