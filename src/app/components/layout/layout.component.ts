import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { CartComponent } from './../cart/cart.component';
import { FooterComponent } from './footer/footer.component';
import { NavigationComponent } from './navigation/navigation.component';

import { UserService } from './../../services/user.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CartComponent,
    FooterComponent,
    NavigationComponent
  ]
})

export class LayoutComponent {
  isPaymentRoute: boolean = false;

  constructor(
    private userService: UserService,
    private router: Router
  ) {
    this.init();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isPaymentRoute = event.url.includes('/payment/');
    });
  }

  private async init(): Promise<void> {
    await this.userService.setUserFromDatabase();
  }
}
