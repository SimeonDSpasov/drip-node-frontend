import { Inject, Injectable, Injector } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';

import { FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';

import { ScrollBlockService } from './scroll-block.service';

interface OverlayChildElement {
  element: HTMLElement;
  /* If atleast one element has the blockable property the overlay scrolling will be prevented */
  blockable: boolean;
}

@Injectable({
  providedIn: 'root'
})

export class OverlayService {

  constructor(
    private injector: Injector,
    private focusTrapFactory: FocusTrapFactory,
    private scrollBlockService: ScrollBlockService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  private focusTrap!: FocusTrap;

  private blockActivated = false;

  private overlayElement!: HTMLElement | null;
  private overlayChildren: OverlayChildElement[] = [];

  public get overlay(): HTMLElement | null {
    return this.overlayElement;
  }

  public appendToOverlay(content: HTMLElement, blockable = false): void {
    if (!this.overlayElement) {
      this.createOverlay();
    }
  
    const overlayChild: OverlayChildElement = {
      element: content,
      blockable
    };

    this.overlayElement!.appendChild(overlayChild.element);
    this.overlayChildren.push(overlayChild);

    if (overlayChild.blockable && !this.blockActivated) {
      this.scrollBlockService.activate();
      this.blockActivated = true;
    }
  }

  public removeFromOverlay(content: HTMLElement): void {
    if (!this.overlayElement) {
      return;
    }

    const componentIndex = this.overlayChildren.findIndex(comp => comp.element === content);

    if (componentIndex > -1) {
      this.overlayChildren.splice(componentIndex, 1);
    }

    if (content.parentNode === this.overlayElement) {
      this.overlayElement.removeChild(content);
    }

    if (!this.overlayChildren.some(comp => comp.blockable) && this.blockActivated) {
      this.blockActivated = false;

      this.scrollBlockService.deactivate();
    }

    if (this.overlayElement.childElementCount === 0) {
      this.removeOverlay(this.overlayElement);
    }
  }

  private createOverlay(): void {
    const overlayDiv = this.document.createElement('div');

    overlayDiv.style.top = '0';
    overlayDiv.style.left = '0';
    overlayDiv.style.width = '100%';
    overlayDiv.style.height = '100%';
    overlayDiv.style.zIndex = '900';
    overlayDiv.style.position = 'fixed';
    overlayDiv.style.pointerEvents = 'none';

    this.overlayElement = overlayDiv;
    document.body.appendChild(overlayDiv);

    this.focusTrap = this.focusTrapFactory.create(this.overlayElement);
    this.focusTrap.focusInitialElementWhenReady();
  }

  private removeOverlay(overlayElement: HTMLElement): void {
    this.focusTrap.destroy();
  
    overlayElement.remove();
    this.overlayElement = null;
  }

}
