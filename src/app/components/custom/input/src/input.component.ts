import { Component, ChangeDetectorRef, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AbstractControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { Subscription } from 'rxjs';

import { IpiImageComponent } from '@ipi-soft/ng-components/image';

import { IpiTooltipDirective, TooltipPosition } from '@ipi-soft/ng-components/tooltip';

export interface IpiInputOptions {
  label: string;
  type?: string;
  tooltip?: string;
  disabled?: boolean;
  placeholder?: string;
  helperText?: string;
  helperRoute?: string;
  prefixImg?: string;
  suffixImg?: string;
  formGroup?: FormGroup;
  formControlName?: string;
  errors?: IpiControlErrors;
}

export interface IpiControlErrors {
  [x: string]: string;
}

@Component({
  selector: 'ipi-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css'],
  imports: [
    NgClass,
    NgTemplateOutlet,
    RouterLink,
    FormsModule,
    IpiImageComponent,
    ReactiveFormsModule,
    IpiTooltipDirective,
    IpiTooltipDirective
  ]
})

export class IpiInputComponent {

  constructor(private changeDetectorRef: ChangeDetectorRef) { 
    this.changeDetectorRef.detach();
  }

  @Input() options!: IpiInputOptions;

  @Output() inputChange = new EventEmitter<string>();
  @Output() suffixImgChange = new EventEmitter<void>();
  @Output() helperTextChange = new EventEmitter<void>();

  public label!: string;
  public controlInvalid = false;
  public tooltipPosition = TooltipPosition;

  private controlSubscription!: Subscription;
  private control: AbstractControl | null = null;

  public ngOnInit(): void {
    this.setControl();

    this.changeDetectorRef.detectChanges();
  }

  public ngOnDestroy(): void {
    if (this.controlSubscription) {
      this.controlSubscription.unsubscribe();
    }
  }

  public onInput(event: any): void {
    this.inputChange.emit(event.target.value);

    this.changeDetectorRef.detectChanges();
  }

  public onSuffixImage(): void {
    this.suffixImgChange.emit();

    this.changeDetectorRef.detectChanges();
  }

  public onHelperText(): void {
    this.helperTextChange.emit();

    this.changeDetectorRef.detectChanges();
  }

  @HostListener('focusout', ['$event'])
   onFocusOut(): void {
    this.initChange();
  }

  private setControl(): void {
    if (!this.options) {
      return;
    }

    if (!this.options.placeholder) {
      this.options.placeholder = this.options.label;
    }
  
    if (!this.options.formGroup || !this.options.formControlName) {
      return;
    }

    this.control = this.options.formGroup.controls[this.options.formControlName];

    this.checkIfControlDisabled(this.control);

    this.control.markAsTouched();

    this.controlSubscription = this.control.statusChanges.subscribe(() => {
      this.initChange();
    });
  }

  private initChange(): void {
    if (!this.control) {
      return;
    }

    this.checkIfControlInvalid(this.control);

    this.getLabel();

    this.changeDetectorRef.detectChanges();
  }

  private checkIfControlInvalid(control: AbstractControl): void {
    this.controlInvalid = control.touched && control.invalid;
  }

  private checkIfControlDisabled(control: AbstractControl): void {
    if (control.disabled || this.options.disabled) {
      control.disable();
  
      this.options.disabled = true;
    }
  }

  private getLabel(): void {
    this.label = '';

    const options = this.options!;
    const formGroup = options.formGroup;
    const formControlName = options.formControlName;

    if (formGroup && formControlName && options.errors && this.controlInvalid) {
      for (const error in options.errors) {
        if (formGroup.controls[formControlName].hasError(error)) {
          this.label = options.errors[error];

          return;
        }
      }

    }
  }

}
