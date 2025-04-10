import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IpiImageComponent } from './../../../custom/image';

import { NavigationOption } from './../navigation.component';

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

  constructor() { }

  @Input() activeOptionIndex: number | null = null;
  @Input() navigationOptions: NavigationOption[] = [];

}
