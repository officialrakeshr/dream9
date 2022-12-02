import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimengModule } from './modules/primeng/primeng.module';
import { ApiService } from './services/api.service';
import { CanDeactivateGuard } from '../@core/guards/deactivate-guard';

@NgModule({
  declarations: [],
  imports: [CommonModule],
  exports: [PrimengModule],
  providers:[ApiService,CanDeactivateGuard]
})
export class SharedModule {}
