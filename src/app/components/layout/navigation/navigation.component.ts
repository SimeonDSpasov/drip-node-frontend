import { Component, AfterViewInit, OnDestroy, effect } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { NavigationMobileComponent } from './navigation-mobile/navigation-mobile.component';
import { NavigationDesktopComponent } from './navigation-desktop/navigation-desktop.component';

import { PlatformService } from './../../services/platform.service';

export interface NavigationOption {
  label: string;
  path: string;
  scrollTo?: string;
}

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css'],
  imports: [
    NavigationMobileComponent,
    NavigationDesktopComponent,
  ],
})

export class NavigationComponent {

  constructor(
    private router: Router,
    private platformService: PlatformService) {

  }

}
