import { NgClass } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IpiTooltipDirective, TooltipPosition } from '@ipi-soft/ng-components/tooltip';

export interface IpiRadioData {
  label: string;
  value: any;
  tooltip?: string;
  isHover?: boolean;
}

export interface IpiRadioButtonOptions {
  checked?: number;
  inline?: boolean;
  data: IpiRadioData[];
  formGroup?: FormGroup;
  formControlName?: string;
}

@Component({
  selector: 'ipi-radio-button',
  templateUrl: './radio-button.component.html',
  styleUrls: ['./radio-button.component.css'],
  imports: [
    NgClass,
    FormsModule,
    ReactiveFormsModule,
    IpiTooltipDirective,
  ]
})

export class IpiRadioButtonComponent {

  @Input() options!: IpiRadioButtonOptions;

  @Output() selectChange = new EventEmitter<IpiRadioData>();

  // random ID for name of the radiobutton so no collision happen with other radio components
  public buttonGroupId = Math.random();

  public tooltipPositionAbove = TooltipPosition.Above;

  public onChange(item: IpiRadioData): void {
    this.selectChange.emit(item);
  }

}
