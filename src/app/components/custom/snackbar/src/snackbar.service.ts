import { Injectable, ComponentRef, ApplicationRef, EmbeddedViewRef, createComponent } from '@angular/core';

import { OverlayService } from '@ipi-soft/ng-components/services';

import { IpiSnackbarComponent, IpiSnackbarOptions, SnackbarPosition, verticalPosition, horizontalPosition } from './snackbar.component';

@Injectable({
  providedIn: 'root'
})

export class IpiSnackbarService {

  constructor(
    private appRef: ApplicationRef,
    private overlayService: OverlayService) { }

  private maxSnackbars = 5;
  private fixedContainer!: HTMLElement;

  private defaultSnackbarOptions: IpiSnackbarOptions = {
    error: false,
    animationDuration: 3,
    backgroundColor: '#000000',
    placeholderTextColor: '#FFFFFF',
    messageTextColor: '#FFFFFF',
    progressColor: '#FFFFFF',
    xIconColor: '#FFFFFF',
    errorBackgroundColor: '#F96138'
  };

  private positionOptions: SnackbarPosition = {
    verticalPosition: verticalPosition.Bottom,
    horizontalPosition: horizontalPosition.Center
  };

  private snackbarsArray: ComponentRef<IpiSnackbarComponent>[] = [];

  public open(message: string, options?: Partial<IpiSnackbarOptions>): void {
    this.createFixedComponent();

    const snackbarOptions = {
      ...this.defaultSnackbarOptions,
      ...options
    };

    const snackbarRef = this.createAndAppendSnackbar(snackbarOptions);

    snackbarRef.instance.message = message;

    this.closeIfMaxSnackbar();

    this.snackbarsArray.push(snackbarRef);

    this.subscribeToClosingEvents(snackbarRef);
  }
  
  public setPosition(options: SnackbarPosition): void {
    this.positionOptions = options;
  }

  public setMaxSnackbars(length: number): void {
    this.maxSnackbars = length;
  }

  public updateDefaultOptions(options: Partial<IpiSnackbarOptions>): void {
    this.defaultSnackbarOptions = { ...this.defaultSnackbarOptions, ...options };
  }

  private createFixedComponent(): void {
    if (!this.fixedContainer || this.fixedContainer.children.length === 0) {
      this.fixedContainer = document.createElement('div');

      this.setFixedComponentStyling();

      this.overlayService.appendToOverlay(this.fixedContainer, false);
    }
  }

  private createAndAppendSnackbar(options: IpiSnackbarOptions): ComponentRef<IpiSnackbarComponent> {
    const componentRef = createComponent(IpiSnackbarComponent, { environmentInjector: this.appRef.injector });

    componentRef.instance.options = options;
    componentRef.instance.positionOptions = this.positionOptions;

    this.appRef.attachView(componentRef.hostView);

    const snackbarElement = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;

    this.applyCustomStyles(snackbarElement, options);

    this.fixedContainer.appendChild(snackbarElement);

    setTimeout(() => {
      componentRef.destroy();
      this.close(this.snackbarsArray.indexOf(componentRef));

      if (this.snackbarsArray.length === 0) {
        this.overlayService.removeFromOverlay(this.fixedContainer);
      }
    }, options.animationDuration * 1000);

    return componentRef;
  }

  private applyCustomStyles(snackbarElement: HTMLElement, options: IpiSnackbarOptions): void {
    const styles = {
      '--ipi-snackbar-background-color': options.backgroundColor,
      '--ipi-snackbar-placeholder-text-color': options.placeholderTextColor,
      '--ipi-snackbar-message-text-color': options.messageTextColor,
      '--ipi-snackbar-progress-color': options.progressColor,
      '--ipi-snackbar-x-icon-color': options.xIconColor,
      '--ipi-snackbar-animation-duration': options.animationDuration ? `${options.animationDuration}s` : undefined
    };
  
    for (const [cssVar, value] of Object.entries(styles)) {
      if (value) {
        snackbarElement.style.setProperty(cssVar, value);
      }
    }
  }

  private closeIfMaxSnackbar(): void {
    if (this.snackbarsArray.length === this.maxSnackbars) {
      this.close(0);
    }
  }

  private subscribeToClosingEvents(snackbarRef: ComponentRef<IpiSnackbarComponent>): void {
    snackbarRef.instance.closed.subscribe(() => {
      this.close(this.snackbarsArray.indexOf(snackbarRef));

      if (this.snackbarsArray.length === 0) {
        this.overlayService.removeFromOverlay(this.fixedContainer);
      }
    });

    snackbarRef.onDestroy(() => {
      snackbarRef.instance.closed.unsubscribe();
    });
  }

  private setFixedComponentStyling(): void {
    this.fixedContainer.style.display = 'flex';
    this.fixedContainer.style.flexDirection = 'column';
    this.fixedContainer.style.alignItems = 'flex-end';
    this.fixedContainer.style.bottom = '0px';
    this.fixedContainer.style.left = '50%';
    this.fixedContainer.style.transform = 'translateX(-50%)';

    if (this.positionOptions.horizontalPosition === horizontalPosition.Left) {
      this.fixedContainer.style.left = '0px';
      this.fixedContainer.style.transform = 'translateX(0%)';
    } else if (this.positionOptions.horizontalPosition === horizontalPosition.Right) {
      this.fixedContainer.style.left = '';
      this.fixedContainer.style.right = '0px';
      this.fixedContainer.style.transform = 'translateX(0%)';
    }

    if (this.positionOptions.verticalPosition === verticalPosition.Top) {
      this.fixedContainer.style.bottom = '';
      this.fixedContainer.style.top = '0px';
    }

    this.fixedContainer.style.position = 'fixed';
    this.fixedContainer.style.zIndex = '1000';
  }

  private close(index: number): void {
    if (this.snackbarsArray[index]) {
      this.snackbarsArray[index].destroy();
      this.snackbarsArray.splice(index, 1);
    }
  }
}
