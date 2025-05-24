import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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

  constructor(
    private userService: UserService,
  ) {
    this.init();
  }

  private async init(): Promise<void> {
    await this.userService.setUserFromDatabase();
  }
}
