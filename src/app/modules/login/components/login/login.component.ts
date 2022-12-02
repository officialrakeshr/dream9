import { AppState } from './../../../../@core/redux/app.state';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { addUser } from 'src/app/@core/redux/login/login.action';
import { selectUser } from 'src/app/@core/redux/login/login.selector';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/@core/services/user/user.service';
import { UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy({checkProperties:true})
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  isAdmin:boolean=false;
  private now: string = new Date().toString();
  user$ = this.store.select(selectUser);
  constructor(private store: Store<AppState>, private route: ActivatedRoute, private router: Router, private api: UserService) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.store.dispatch(addUser({ payload: { username: '', token: '' } }))
    }, 0)
  }
  handleChange(evt:any){
    this.isAdmin = evt.checked;
  }
  validateToken(user: string, password:string) {
    this.api.login(user,password).subscribe(o=>{
      this.store.dispatch(
        addUser({ payload: { username: user, token: o.accessToken } })
      );
      this.api.adminAccess().subscribe(o=>{
        this.router.navigate(['./home/adminDashboard'])
      })
    })
  }

  validateTokenUser(user:string){
    this.api.login(user,user.toUpperCase()).subscribe(o=>{
      this.store.dispatch(
        addUser({ payload: { username: user, token: o.accessToken } })
      );
      this.api.employeeAccess().subscribe(o=>{
        this.api.userMatchAvailable().subscribe(o=>{
          if(o){
            this.router.navigate(['./home/playerDashboard'])
          }else {
            this.router.navigate(['./home/rank'])
          }
        })
      })
    })
  }
}
