import { ComponentRef, Injectable, ViewContainerRef } from '@angular/core';

import { OverlayService } from './../overlay.service';

import { IpiLoaderComponent } from './loader.component';

@Injectable({
  providedIn: 'root',
})

export class LoaderService {

  constructor(
    private overlayService: OverlayService) { }

  private viewContainerRef: ViewContainerRef | null = null;
  private appContainerElement: HTMLDivElement | null = null;

  private loaderRef: ComponentRef<IpiLoaderComponent> | null = null;

  /**
   * Call this method globally in order to set a more global ViewContainerRef
   * @param viewContainerRef - the Host Container Ref where we want the Loader to be attached. i.e the App Component or Layout Component
   * @param appContainerElement - An optional app container selector. When provided it will set opacity 0.4 to that container when Loader is shown. Example - '.app-container'
   */
  public init(viewContainerRef: ViewContainerRef, appContainerElement?: string) {
    this.viewContainerRef = viewContainerRef;

    if (appContainerElement) {
      this.appContainerElement = document.querySelector(appContainerElement) as HTMLDivElement;
    }
  }

  public show(): void {
    if (this.viewContainerRef) {
      if (this.loaderRef) {
        return;
      }

      this.loaderRef = this.viewContainerRef.createComponent(IpiLoaderComponent);
      this.setAppContainerOpacity('0.4');

      this.overlayService.appendToOverlay(this.loaderRef.location.nativeElement, true);
    }
  }

  public hide(): void {
    if (this.loaderRef) {
      this.loaderRef.destroy();
      this.setAppContainerOpacity('1');

      this.overlayService.removeFromOverlay(this.loaderRef.location.nativeElement);

      this.loaderRef = null;
    }
  }

  private setAppContainerOpacity(opacity: string): void {
    if (this.appContainerElement) {
      this.appContainerElement.style.opacity = opacity;
    }
  }

}
