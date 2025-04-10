import { Component, OnDestroy, ContentChild, TemplateRef, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { OverlayService } from '@ipi-soft/ng-components/services';

@Component({
  selector: 'ipi-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css'],
  imports: [
    NgTemplateOutlet,
  ],
})

export class IpiDialogComponent implements OnDestroy {

  constructor(
    private elementRef: ElementRef,
    private overlayService: OverlayService) {
  }

  @ContentChild('title') title?: TemplateRef<any>;
  @ContentChild('description') description?: TemplateRef<any>;
  @ContentChild('content') content?: TemplateRef<any>;
  @ContentChild('actions') actions?: TemplateRef<any>;

  @ViewChild('closeIcon') closeIconTemplate?: ElementRef;

  @Input() closeIcon: boolean = false;

  @Output() closeIconClick = new EventEmitter<void>();

  public ngAfterViewInit(): void {
    this.overlayService.appendToOverlay(this.elementRef.nativeElement, true);
  }

  public ngOnDestroy(): void {
    this.overlayService.removeFromOverlay(this.elementRef.nativeElement);
  }

  public onCloseIconClick(): void {
    this.closeIconClick.emit();
  }

  public handleKeydown(event: KeyboardEvent): void {
    if (!(document.activeElement === this.closeIconTemplate?.nativeElement)) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.closeIconClick.emit();
    }
  }

}
