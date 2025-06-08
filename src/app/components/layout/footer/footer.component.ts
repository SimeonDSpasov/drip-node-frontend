import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { PlatformService } from './../../services/platform.service';

@Component({
  standalone: true,
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  imports: [
    CommonModule,
    RouterModule
  ],
})

export class FooterComponent implements AfterViewInit {
  currentYear: number = new Date().getFullYear();
  @ViewChild('footer') footer!: ElementRef;

  constructor(
    private platformService: PlatformService) { }

  ngAfterViewInit() {
    if (this.platformService.isBrowser()) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('footer-visible');
            } else {
              entry.target.classList.remove('footer-visible');
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '0px'
        }
      );

      observer.observe(this.footer.nativeElement);
    }
  }
}
