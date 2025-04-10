import { Injectable } from '@angular/core';

interface scrollBlockingStyles {
  top: string,
  height: string,
  position: string,
}

@Injectable({
  providedIn: 'root'
})

export class ScrollBlockService {

  private isActivated = false;

  private previousStyles: scrollBlockingStyles = {
      position: '',
      top: '',
      height: '',
  }

  public activate(): void {
    if (this.isActivated) {
      return;
    }

    this.isActivated = true;

    this.previousStyles = this.getPreviousStyles();

    const yOffset = window.scrollY;

    document.body.style.position = 'fixed';
    document.body.style.top = '-' + yOffset + 'px';
    document.body.style.height = 'calc(100% + ' + yOffset + 'px)';
  }

  public deactivate(): void {
    if (!this.isActivated) {
      return;
    }

    this.isActivated = false;

    const top = Math.abs(parseInt(document.body.style.top));

    document.body.style.position = this.previousStyles.position;
    document.body.style.top = this.previousStyles.top;
    document.body.style.height = this.previousStyles.height;

    window.scrollTo(0, top);
  }

  private getPreviousStyles(): scrollBlockingStyles {
    return { 
        position: document.body.style.position,
        top: document.body.style.top,
        height: document.body.style.height
    };
  }

}
