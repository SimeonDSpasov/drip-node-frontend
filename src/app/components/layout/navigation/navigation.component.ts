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
  standalone: true,
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

  private routeSubscription!: Subscription;
  public activeOptionIndex: number | null = null;

  public guestNavigationOptions: NavigationOption[] = [
    {
      label: 'Продукти',
      path: '',
      // scrollTo: 'products'
    },
    { 
      label: 'За нас',
      path: 'about-us',
      // scrollTo: 'technologies',
    },
    { 
      label: 'Въпроси',
      path: '',
      // scrollTo: 'faq',
    },
  ];

  private subscribeToRouterEvents(): void {
    this.routeSubscription = this.router.events.subscribe(event => {
      if (!(event instanceof NavigationEnd)) {
        return;
      }

      const path = event.url.slice(1);

      if (!history.state) {
        this.activeOptionIndex = null;

        return;
      }

      if (history.state.ind !== undefined) {
        this.activeOptionIndex = history.state.ind;
      }
      else {
        const index = this.guestNavigationOptions.findIndex(option => option.path === path && !option.scrollTo);

        this.activeOptionIndex = index !== -1 ? index : null;
      }

      if (history.state.scrollTo) {
        setTimeout(() => {
          const element = document.querySelector('#' + history.state.scrollTo) as HTMLElement;

          if (!element) {
            return;
          }

          window.scrollTo({ top: element.getBoundingClientRect().top - 120, behavior: 'smooth' });
        }, 100);
      }
    });
  }

}
