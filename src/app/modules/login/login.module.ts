import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './components/login/login.component';
import { RouterModule } from '@angular/router';
import { PrimengModule } from 'src/app/@shared/modules/primeng/primeng.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from 'src/app/@core/interceptors/jwt.interceptor';

@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    PrimengModule,
    RouterModule.forChild([
      { path: '', component: LoginComponent },
    ]),
  ],
  providers:[
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ]
})
export class LoginModule {}
