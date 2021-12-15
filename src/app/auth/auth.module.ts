import { NgModule } from '@angular/core';
import { AuthComponent } from './auth.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthRoutingModule } from './auth-routing.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [AuthComponent],
  imports: [ReactiveFormsModule, RouterModule, AuthRoutingModule, SharedModule],
})
export class AuthModule {}
