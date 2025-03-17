import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NavigationOption } from './../navigation.component';

@Component({
  selector: 'app-navigation-mobile',
  templateUrl: './navigation-mobile.component.html',
  styleUrls: ['./navigation-mobile.component.css'],
  animations: [],
  imports: [
  ],
})

export class NavigationMobileComponent {

  constructor() { }

  @Input() activeOptionIndex: number | null = null;
  @Input() navigationOptions: NavigationOption[] = [];



}
