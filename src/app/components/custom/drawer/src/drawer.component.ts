import { Component, OnDestroy, ContentChild, TemplateRef, EventEmitter, Output, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { animate, state, style, transition, trigger } from '@angular/animations';

import { ScrollBlockService } from '@ipi-soft/ng-components/services';

const OpenCloseAnimation = trigger('openCloseAnimation', [
  state('true', style({
      transform: 'translateX(0%)',
    }),
  ),
  state('false', style({
      transform: 'translateX(100%)',
    }),
  ),
  transition('false <=> true', animate('0.25s cubic-bezier(0.4, 0, 0.1, 1)')),
]);

@Component({
  selector: 'ipi-drawer',
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.css'],
  animations: [OpenCloseAnimation],
  imports: [
    NgTemplateOutlet,
  ],
})

export class IpiDrawerComponent implements AfterViewInit, OnDestroy {

  constructor(
    private scrollBlockService: ScrollBlockService,
    private changeDetector: ChangeDetectorRef) {

    this.scrollBlockService.activate();
  }

  public isOpen = false;

  @Output() closeChange = new EventEmitter<void>();

  @ContentChild('title') title?: TemplateRef<any>;
  @ContentChild('description') description?: TemplateRef<any>;
  @ContentChild('content') content?: TemplateRef<any>;
  @ContentChild('actions') actions?: TemplateRef<any>;

  public ngOnDestroy(): void {
    this.scrollBlockService.deactivate();
  }

  public ngAfterViewInit(): void {
    this.isOpen = true;

    this.changeDetector.detectChanges();
  }

  public close(): void {
    if (!this.closeChange) {
      return;
    }

    this.isOpen = false;

    setTimeout(() => {
      this.closeChange.emit();
    }, 250);
  }

}
