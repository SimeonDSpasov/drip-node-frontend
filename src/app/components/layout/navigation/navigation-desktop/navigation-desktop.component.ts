import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IpiImageComponent } from './../../../custom/image';

import { NavigationOption } from './../navigation.component';

import { CartService } from './../../../services/cart.service';

@Component({
  selector: 'app-navigation-desktop',
  templateUrl: './navigation-desktop.component.html',
  styleUrls: ['./navigation-desktop.component.css'],
  imports: [
    RouterLink,
    IpiImageComponent
  ],
})

export class NavigationDesktopComponent {

  constructor(
    public cartService: CartService,
  ) { }

  @Input() activeOptionIndex: number | null = null;
  @Input() navigationOptions: NavigationOption[] = [];

}
