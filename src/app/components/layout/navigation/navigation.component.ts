import { Component, AfterViewInit, OnDestroy, effect } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { NavigationMobileComponent } from './navigation-mobile/navigation-mobile.component';
import { NavigationDesktopComponent } from './navigation-desktop/navigation-desktop.component';

import { PlatformService } from './../../services/platform.service';
import { UserService } from './../../../services/user.service';

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

export class NavigationComponent implements AfterViewInit, OnDestroy {
  constructor(
    private router: Router,
    private platformService: PlatformService,
    private userService: UserService) {
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
    }
  ];

  public adminNavigationOptions: NavigationOption[] = [
    {
      label: 'Admin Panel',
      path: 'admin'
    }
  ];

  public get navigationOptions(): NavigationOption[] {
    if (this.userService.isUserAdmin() || this.userService.isUserMasterAdmin()) {
      return [...this.guestNavigationOptions, ...this.adminNavigationOptions];
    }
    return this.guestNavigationOptions;
  }

  ngAfterViewInit(): void {
    this.subscribeToRouterEvents();
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  private subscribeToRouterEvents(): void {
    if (this.platformService.isServer()) {
      return;
    }

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
        const index = this.navigationOptions.findIndex(option => option.path === path && !option.scrollTo);

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
