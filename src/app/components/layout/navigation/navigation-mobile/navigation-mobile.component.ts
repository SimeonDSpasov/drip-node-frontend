import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NavigationOption } from './../navigation.component';

import { IpiImageComponent } from './../../../custom/image';
import { ScrollBlockService } from './../../../custom/services';

import { NavigationMobileAnimation } from './../../../../animations/navigation-mobile.animation';

import { CartService } from './../../../services/cart.service';

@Component({
  selector: 'app-navigation-mobile',
  templateUrl: './navigation-mobile.component.html',
  styleUrls: ['./navigation-mobile.component.css'],
  animations: [NavigationMobileAnimation],
  imports: [
    RouterLink,
    IpiImageComponent,
  ],
})

export class NavigationMobileComponent {

  constructor(
    public cartService: CartService,
    private scrollBlockService: ScrollBlockService,
  ) { }

  @Input() activeOptionIndex: number | null = null;
  @Input() navigationOptions: NavigationOption[] = [];

  public isExpanded: boolean = false;

  public triggerAnimation(): void {
    this.isExpanded = !this.isExpanded;

    if (this.isExpanded) {
      setTimeout(() => {
        this.scrollBlockService.activate();
      }, 350);

      return;
    }

    this.scrollBlockService.deactivate();
  }

}
