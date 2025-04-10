import { DOCUMENT } from '@angular/common';

import { Directive, Input, ElementRef, Inject, HostListener } from '@angular/core';

import { OSService, MobileOS, OverlayService } from '@ipi-soft/ng-components/services';

export enum TooltipPosition {
  Before,
  After,
  Above,
  Below
}

@Directive({
  standalone: true,
  selector: '[ipiTooltip]'
})

export class IpiTooltipDirective {

  constructor(
    private osService: OSService,
    private elementRef: ElementRef,
    private overlayService: OverlayService,
    @Inject(DOCUMENT) private document: Document) {
      this.platform = this.osService.mobileOS;
    }

  @Input() ipiTooltip = '';
  @Input() tooltipPosition = TooltipPosition.Before;

  private platform;

  private tooltip!: HTMLElement;
  private triangle!: HTMLElement;
  private tooltipWrapper!: HTMLElement;

  private isActivated = false;

  private triangleWidth = 8;
  private tooltipWidth!: number;
  private parentElementPos!: DOMRect;

  private errorMargin = 2;

  public ngOnDestroy(): void {
    this.onMouseLeave();
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    (this.elementRef.nativeElement as HTMLElement).style.touchAction = 'manipulation';
    this.parentElementPos = this.getParentElementPosition();
    this.openToolTip();
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    (this.elementRef.nativeElement as HTMLElement).style.touchAction = 'auto';
    this.closeToolTip();
  }

  @HostListener('window:resize')
  onResize() {
    this.closeToolTip();
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    event.preventDefault();

    (this.elementRef.nativeElement as HTMLElement).style.userSelect = 'none';
      this.parentElementPos = this.getParentElementPosition();
      this.openToolTip();
  }

  @HostListener('touchend')
  onTouchEnd(): void {
    this.closeToolTip();
  }

  @HostListener('touchcancel')
  onTouchCancel(): void {
    this.closeToolTip();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    if (this.isActivated) {
      this.parentElementPos = this.getParentElementPosition();

      let parentPosTop = this.parentElementPos.top;

      const tooltipElement = document.querySelector('.tooltip-wrapper') as HTMLElement;

      if (this.platform === MobileOS.iOS) {
        parentPosTop += window.visualViewport!.offsetTop;
      }

      tooltipElement.style.top = `${parentPosTop}px`;
    }
  }

  private getParentElementPosition(): DOMRect {
    return this.elementRef.nativeElement.getBoundingClientRect();
  }

  private openToolTip(): void {
    this.createTooltip();
    this.createTriangle();
    this.createTooltipWrapper();

    this.tooltipWrapper.appendChild(this.tooltip);
    this.tooltipWrapper.appendChild(this.triangle);

    this.overlayService.appendToOverlay(this.tooltipWrapper);

    this.positionTooltip();

    this.isActivated = true;
  }

  private closeToolTip(): void {
    if (this.tooltipWrapper) {
      this.overlayService.removeFromOverlay(this.tooltipWrapper);

      this.isActivated = false;
    }
  }

  private createTooltip(): void {
    this.tooltip = this.document.createElement('div');
    this.tooltip.classList.add('tooltip');

    this.tooltip.innerHTML = this.ipiTooltip;

    this.tooltip.style.gap = '10px';
    this.tooltip.style.color = 'white';
    this.tooltip.style.minWidth = '50px';
    this.tooltip.style.minHeight = '10px';
    this.tooltip.style.fontSize = '12px';
    this.tooltip.style.fontWeight = '400';
    this.tooltip.style.maxWidth = '200px';
    this.tooltip.style.lineHeight = '16px';
    this.tooltip.style.padding = '4px 8px';
    this.tooltip.style.textAlign = 'center';
    this.tooltip.style.borderRadius = '4px';
    this.tooltip.style.whiteSpace = 'pre-wrap';
    this.tooltip.style.wordBreak = 'break-word';
    this.tooltip.style.backgroundColor = '#0B1222';
  }

  private createTriangle(): void {
    this.triangle = this.document.createElement('div');
    this.triangle.classList.add('triangle');

    this.triangle.style.width = '0';
    this.triangle.style.height = '0';
    this.triangle.style.content = '';
    this.triangle.style.borderRight = '8px solid #0B1222';
    this.triangle.style.borderTop = '5px solid transparent';
    this.triangle.style.borderBottom = '5px solid transparent';
  }

  private createTooltipWrapper(): void {
    this.tooltipWrapper = this.document.createElement('div');
    this.tooltipWrapper.classList.add('tooltip-wrapper');

    this.tooltipWrapper.style.display = 'flex';
    this.tooltipWrapper.style.position = 'absolute';
    this.tooltipWrapper.style.alignItems = 'center';

    const keyframes = [
      { opacity: 0 },
      { opacity: 1 }
    ];

    this.tooltipWrapper.animate(keyframes, {
      duration: 400,
      easing: 'ease'
    });
  }

  private positionTooltip(): void {
    if (this.overlayService.overlay) {
      this.tooltipWidth = this.overlayService.overlay.querySelector('.tooltip-wrapper')?.firstElementChild?.clientWidth || 0;
    }

    switch (this.tooltipPosition) {
      case TooltipPosition.Before:
        this.positionBefore();
        break;
      case TooltipPosition.After:
        this.positionAfter();
        break;
      case TooltipPosition.Above:
        this.positionAbove();
        break;
      case TooltipPosition.Below:
        this.positionBelow();
        break;
    }

    this.repositionTooltip();
  }

  private positionBefore(): void {
    let parentPosTop = this.parentElementPos.top;
    let parentPosLeft = this.parentElementPos.left;

    this.tooltipWrapper.style.flexDirection = 'row';
    this.triangle.style.transform = 'rotate(180deg)';
    this.tooltipWrapper.style.transform = `translateY(${this.parentElementPos.height / 2}px) translateY(-50%)`;

    if (this.platform === MobileOS.iOS) {
      parentPosTop += window.visualViewport!.offsetTop;
      parentPosLeft += window.visualViewport!.offsetLeft;
    }

    this.tooltipWrapper.style.left = `${parentPosLeft - this.tooltipWidth - this.triangleWidth}px`;
    this.tooltipWrapper.style.top = `${parentPosTop}px`;
  }

  private positionAfter(): void {
    let parentPosTop = this.parentElementPos.top;
    let parentPosRight = this.parentElementPos.right;

    this.triangle.style.transform = 'rotate(0deg)';
    this.tooltipWrapper.style.flexDirection = 'row-reverse';
    this.tooltipWrapper.style.transform = `translateY(${this.parentElementPos.height / 2}px) translateY(-50%)`;

    if (this.platform === MobileOS.iOS) {
      parentPosTop += window.visualViewport!.offsetTop;
      parentPosRight += window.visualViewport!.offsetLeft;
    }

    this.tooltipWrapper.style.top = `${parentPosTop}px`;
    this.tooltipWrapper.style.left = `${parentPosRight}px`;
  }

  private positionAbove(): void {
    let parentPosTop = this.parentElementPos.top;
    let parentPosLeft = this.parentElementPos.left;

    this.tooltipWrapper.style.flexDirection = 'column';
    this.tooltipWrapper.style.transform = 'translateY(-100%)';
    this.tooltipWrapper.style.transform = 'translateY(-100%)';

    if (this.platform === MobileOS.iOS) { 
      parentPosTop += window.visualViewport!.offsetTop;
      parentPosLeft += window.visualViewport!.offsetLeft;
    }

    this.tooltipWrapper.style.top = `${parentPosTop}px`;
    this.tooltipWrapper.style.left = ` ${ (parentPosLeft + this.parentElementPos.width / 2) - this.tooltipWidth / 2 }px`;


    this.triangle.style.transform = 'rotate(-90deg) translateX(1px)';
  }

  private positionBelow(): void {
    let parentPosTop = this.parentElementPos.top;
    let parentPosLeft = this.parentElementPos.left;

    this.tooltipWrapper.style.flexDirection = 'column-reverse';
    this.triangle.style.transform = 'rotate(90deg) translateX(1px)';
    this.tooltipWrapper.style.transform = `translateY(${this.parentElementPos.height}px)`;

    if (this.platform === MobileOS.iOS) { 
      parentPosTop += window.visualViewport!.offsetTop;
      parentPosLeft += window.visualViewport!.offsetLeft;
    }

    this.tooltipWrapper.style.top = ` ${parentPosTop}px`;
    this.tooltipWrapper.style.left = ` ${ (parentPosLeft + this.parentElementPos.width / 2) - this.tooltipWidth / 2 }px`;  
  }

  private repositionTooltip(): void {
    const tooltipPosition = this.tooltipWrapper.getBoundingClientRect();

    let tooltipX = tooltipPosition.x;

    if (this.platform === MobileOS.iOS) {
      tooltipX += window.visualViewport!.offsetLeft;
    }

    switch (this.tooltipPosition) {
      case TooltipPosition.Before:
        if (tooltipPosition.x < 0) {
          this.positionAfter();
        }

        if (window.innerWidth - tooltipPosition.right <= tooltipPosition.width) {
          this.positionAbove();
        }

        break;
      case TooltipPosition.After:
        
        if (window.innerWidth < tooltipX + tooltipPosition.width) {
          this.positionBefore();
        }

        if (tooltipPosition.width > this.parentElementPos.left) {
          this.positionAbove();
        }

        break;
      case TooltipPosition.Above:
        if (tooltipX < 0) {
          this.positionAfter();

          break;
        }

        if (tooltipPosition.left > window.innerWidth / 2 && (tooltipPosition.left + tooltipPosition.width / 2) + this.errorMargin < this.parentElementPos.left + this.parentElementPos.width / 2) {
          this.positionBefore();

          break;
        }

        if (this.parentElementPos.top < tooltipPosition.height) {
          this.positionBelow();
        }

        break;
      case TooltipPosition.Below:
        if (tooltipX < 0) {
          this.positionAfter();

          break;
        }

        if (tooltipPosition.left > window.innerWidth / 2 && (tooltipPosition.left + tooltipPosition.width / 2) + this.errorMargin < this.parentElementPos.left + this.parentElementPos.width / 2) {
          this.positionBefore();

          break;
        }

        if (window.innerHeight - this.parentElementPos.bottom < tooltipPosition.height) {
          this.positionAbove();
        }

        break;
    }
  }

}
