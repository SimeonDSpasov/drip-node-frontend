import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { Subscription } from 'rxjs';

import { IpiTooltipDirective, TooltipPosition } from '@ipi-soft/ng-components/tooltip';

export interface IpiCheckboxOptions {
  formGroup?: FormGroup;
  formControlName?: string;
}

@Component({
  selector: 'ipi-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.css'],
  imports: [
    NgClass,
    FormsModule,
    NgTemplateOutlet,
    IpiTooltipDirective,
    ReactiveFormsModule,
  ],
})

export class IpiCheckboxComponent {

  constructor(private changeDetectorRef: ChangeDetectorRef) { }

  @Input() checked = false;
  @Input() disabled = false;
  @Input() tooltip: string | null = null;

  @Input() options: IpiCheckboxOptions | null = null;

  @Output() clickChange = new EventEmitter<boolean>();

  public tooltipPosition = TooltipPosition;

  private controlSubscription!: Subscription;

  public ngAfterViewInit(): void {
    this.changeDetectorRef.detach();

    this.checkIfControlDisabled();
  }

  public ngOnChanges(changes: any): void {
    if(changes['checked']) {
      this.changeDetectorRef.detectChanges();
    }
  }

  public ngOnDestroy(): void {
    if (this.controlSubscription) {
      this.controlSubscription.unsubscribe();
    }
  }

  public onChange(): void {
    this.clickChange.emit(this.checked);

    this.changeDetectorRef.detectChanges();
  }

  private checkIfControlDisabled(): void {
    if (!this.options || !this.options.formGroup || !this.options.formControlName || !this.options.formGroup.get(this.options.formControlName)) {
      return;
    }

    this.controlSubscription = this.options.formGroup.controls[this.options.formControlName].statusChanges.subscribe(() => {
      this.changeDetectorRef.detectChanges();
    })

    this.disabled = this.options.formGroup.controls[this.options.formControlName].disabled;

    this.changeDetectorRef.detectChanges();
  }

}
