import { Component, AfterViewInit, ViewContainerRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FooterComponent } from './footer/footer.component';
import { NavigationComponent } from './navigation/navigation.component';

import { PlatformService } from './../services/platform.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  imports: [
    RouterOutlet,
    FooterComponent,
    NavigationComponent,
  ],
})

export class LayoutComponent {
  
  constructor(
    private viewContainerRef: ViewContainerRef,
    private platformService: PlatformService) {

  }

}
