import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

export interface QuantitySelectorOptions {
  quantity?: number;
  min?: number;
  max?: number;
  formGroup?: FormGroup;
  formControlName?: string;
}

@Component({
  selector: 'app-quantity-selector',
  templateUrl: './quantity-selector.component.html',
  styleUrls: ['./quantity-selector.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class QuantitySelectorComponent {
  @Input() options!: QuantitySelectorOptions;
  @Output() quantityChange = new EventEmitter<number>();

  public decrease(): void {
    if (this.isFormBound()) {
      const control = this.options.formGroup?.controls[this.options.formControlName!];
      if (control && control.value > (this.options.min ?? 1)) {
        control.setValue(control.value - 1);
        this.quantityChange.emit(control.value);
      }
    } else {
      if (this.options.quantity! > (this.options.min ?? 1)) {
        this.options.quantity!--;
        this.quantityChange.emit(this.options.quantity);
      }
    }
  }

  public increase(): void {
    if (this.isFormBound()) {
      const control = this.options.formGroup?.controls[this.options.formControlName!];
      if (control && control.value < (this.options.max ?? 99)) {
        control.setValue(control.value + 1);
        this.quantityChange.emit(control.value);
      }
    } else {
      if (this.options.quantity! < (this.options.max ?? 99)) {
        this.options.quantity!++;
        this.quantityChange.emit(this.options.quantity);
      }
    }
  }

  private isFormBound(): boolean {
    return !!(this.options.formGroup && this.options.formControlName);
  }
}
