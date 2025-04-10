import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { AbstractControl, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';

import { Subscription } from 'rxjs';

import { IpiImageComponent } from '@ipi-soft/ng-components/image';

import { IpiControlErrors } from '@ipi-soft/ng-components/input';

export interface IpiTextAreaOptions {
  label: string;
  icon?: string;
  placeholder?: string;
  formGroup?: FormGroup;
  formControlName?: string;
  errors?: IpiControlErrors;
}

@Component({
  selector: 'ipi-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.css'],
  imports: [
    NgClass,
    FormsModule,
    IpiImageComponent,
    ReactiveFormsModule,
  ],
})

export class IpiTextAreaComponent {

  constructor(private changeDetectorRef: ChangeDetectorRef) {
    this.changeDetectorRef.detach();
  }

  @Input() options!: IpiTextAreaOptions;

  @Output() textAreaChange = new EventEmitter<string>();

  public controlError!: string;
  public controlInvalid = false;
  public control!: AbstractControl;

  private controlSubscription!: Subscription;

  public ngOnInit(): void {
    this.setControl();

    this.changeDetectorRef.detectChanges();
  }

  public ngOnDestroy(): void {
    if (this.controlSubscription) {
      this.controlSubscription.unsubscribe();
    }
  }

  public onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;

    this.textAreaChange.emit(target.value);

    this.changeDetectorRef.detectChanges();
  }

  private setControl(): void{
    if (!this.options.formGroup || !this.options.formControlName) {
      return;
    }

    this.control = this.options.formGroup.controls[this.options.formControlName];

    this.control.markAsTouched();

    this.controlSubscription = this.control.statusChanges.subscribe(() => {
      this.setControlInvalid(this.control);

      this.getErrors();

      this.changeDetectorRef.detectChanges();
    })
  }

  private setControlInvalid(control: AbstractControl): void {
    this.controlInvalid = control.touched && control.invalid;
  }

  private getErrors(): void {
    const options = this.options!;
    const formGroup = options.formGroup;
    const formControlName = options.formControlName;

    if (formGroup && formControlName && options.errors && this.controlInvalid) {

      for (const error in options.errors) {
        if (formGroup.controls[formControlName].hasError(error)) {
          this.controlError = options.errors[error];

          return;
        }
      }

    }

    this.controlError = '';
  }

}
