import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertComponent } from './alert/alert.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { PlaceHolderDirective } from './placeHolder/place-holder.directive';
import { DropdownDirective } from './dropdown.directive';

@NgModule({
  declarations: [
    AlertComponent,
    LoadingSpinnerComponent,
    PlaceHolderDirective,
    DropdownDirective,
  ],
  imports: [CommonModule],
  exports: [
    AlertComponent,
    LoadingSpinnerComponent,
    PlaceHolderDirective,
    DropdownDirective,
    CommonModule,
  ],
})
export class SharedModule {}
