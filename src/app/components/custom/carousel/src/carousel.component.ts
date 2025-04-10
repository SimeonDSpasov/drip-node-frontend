import { Component, ViewChild, ElementRef, HostListener, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { Subject, Subscription, throttleTime } from 'rxjs';

@Component({
  selector: 'ipi-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css'],
})

export class IpiCarouselComponent {

  constructor() { }

  @ViewChild('carousel') carousel!: ElementRef<HTMLDivElement>;

  @ViewChild('prevButton') prevButton!: ElementRef;
  @ViewChild('nextButton') nextButton!: ElementRef;

  public scrollProgress = 0;
  public scrollAnimationDuration = 500; // ms
  
  public scrollSubject = new Subject<'prev' | 'next'>();

  private currentCenteredElemIndex = 0; 

  private isProgrammaticScroll = false;
  private scrollSubscription!: Subscription;

  private platformId = inject(PLATFORM_ID);

  public ngAfterViewInit(): void {
    this.applyScrollSnapAlign();

    if (isPlatformBrowser(this.platformId)) {
      this.adjustCarouselSpacing();
    }

    this.scrollSubject.pipe(throttleTime(this.scrollAnimationDuration)).subscribe((direction: 'prev' | 'next') => {
      this.scroll(direction);
    });

    this.updateCurrentCenterdElemIndex(this.carousel.nativeElement);
  }

  public ngOnDestroy(): void {
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
  }

  public scroll(direction: 'prev' | 'next'): void {
    const carouselEl = this.carousel.nativeElement;
    const children = Array.from(carouselEl.children) as HTMLElement[];
  
    if (direction === 'next') {
      this.currentCenteredElemIndex = Math.min(this.currentCenteredElemIndex + 1, children.length - 1);

    } else {
      this.currentCenteredElemIndex = Math.max(this.currentCenteredElemIndex - 1, 0);
    }
  
    const targetElement = children[this.currentCenteredElemIndex];
  
    this.isProgrammaticScroll = true; 
  
    if (!targetElement) {
      return;
    }
    
    switch (this.currentCenteredElemIndex) {
      case 0:
        carouselEl.scrollTo({ left: 0, behavior: 'smooth' });
    
        break;
      case children.length - 1:
        const scrollEnd = carouselEl.scrollWidth - carouselEl.clientWidth;

        carouselEl.scrollTo({ left: scrollEnd, behavior: 'smooth' });

        break;
      default:
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }  

    setTimeout(() => {
      this.isProgrammaticScroll = false;
    }, this.scrollAnimationDuration);
  }

  @HostListener('window:resize')
  public onResize(): void {
    const carouselEl = this.carousel.nativeElement;

    const carouselCenter = carouselEl.offsetWidth / 2;
    const scrollLeft = carouselEl.scrollLeft;

    const children = Array.from(carouselEl.children) as HTMLElement[];

    const currentlyCenteredElement = children.find(child => {
      const childLeft = child.offsetLeft - scrollLeft;
      const childCenter = childLeft + child.offsetWidth / 2;
      return Math.abs(childCenter - carouselCenter) < child.offsetWidth / 2;
    });

    if (currentlyCenteredElement) {
      const targetLeft = currentlyCenteredElement.offsetLeft;
      const targetCenter = targetLeft + currentlyCenteredElement.offsetWidth / 2;
      const newScrollPosition = targetCenter - carouselCenter;

      carouselEl.scrollTo({ left: newScrollPosition, behavior: 'smooth' });
    }
  }

  public onNavigationKeydown(event: KeyboardEvent, direction: 'prev' | 'next'): void {
    if (event.code === 'Space' || event.code === 'Enter') {
      this.scroll(direction);

      return;
    }

    if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
      if (this.nextButton.nativeElement === document.activeElement) {
        this.prevButton.nativeElement.focus();
      } else {
        this.nextButton.nativeElement.focus();
      }
    }
  }

  public onScroll(event: Event): void {
    const container = event.target as HTMLElement;
  
    this.updateProgressBar(container);
  
    if (this.isProgrammaticScroll) {
      return;
    }

    this.updateCurrentCenterdElemIndex(container);
  }

  private updateProgressBar(container: HTMLElement) {
    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth - container.clientWidth;

    this.scrollProgress = ((scrollLeft / scrollWidth) * 100) - (104 / container.clientWidth);
  }

  private updateCurrentCenterdElemIndex(container: HTMLElement): void {
    const carouselEl = this.carousel.nativeElement;
    const carouselWidth = carouselEl.offsetWidth;
    const carouselCenter = container.scrollLeft + carouselWidth / 2;

    const children = Array.from(carouselEl.children) as HTMLElement[];
  
    let closestIndex = 0;
    let minDistance = Infinity;
  
    for (let i = 0; i < children.length; i++) {
      const childCenter = children[i].offsetLeft + children[i].offsetWidth / 2;
      const distance = Math.abs(carouselCenter - childCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    this.currentCenteredElemIndex = closestIndex;
  }

  private applyScrollSnapAlign(): void {
    const children = this.carousel.nativeElement.children;

    for (let i = 0; i < children.length; i++) {
      (children[i] as HTMLElement).style.scrollSnapAlign = 'center';
    }
  }

  private adjustCarouselSpacing(): void {
    const carouselEl = this.carousel.nativeElement;
  
    const carouselRect = carouselEl.getBoundingClientRect();
    const rightCalculatedValue = window.innerWidth - carouselRect.right;
  
    const leftCalculatedValue = carouselRect.left;

    carouselEl.style.marginRight = `-${rightCalculatedValue}px`;
    carouselEl.style.paddingRight = `${rightCalculatedValue}px`;

    carouselEl.style.marginLeft = `-${leftCalculatedValue}px`;
    carouselEl.style.paddingLeft = `${leftCalculatedValue}px`;
  }

}
