import { Component, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, Input, NgZone, ViewChild, HostListener } from '@angular/core';
import { FormGroup, FormsModule } from '@angular/forms';

import { Subscription } from 'rxjs';

import { ControlErrors } from '@ipi-soft/ng-components/select';

import { OSService, MobileOS, OverlayService } from '@ipi-soft/ng-components/services';

import { IpiCalendarComponent } from './components/calendar/calendar.component';
import { DefaultCalendarRangeStrategy } from './datepicker-selection-strategy.component';

import { IpiDatepickerService } from './datepicker-service';

export interface DateSelectionEvent<D> {
  value: D;
  event: Event;
}

/** A class representing a range of dates. */
export class DateRange {
  constructor(
    readonly start: Date | null,
    readonly end: Date | null,
  ) {}
}

export class DateRangeFormControls {
  constructor(
    readonly start: string,
    readonly end: string,
  ) {}
}

export interface IpiDatepickerOptions {
  label: string,
  formGroup: FormGroup,
  formControlName: string | DateRangeFormControls,
  min?: Date;
  max?: Date;
  errors?: ControlErrors;
}

@Component({
  selector: 'ipi-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    IpiCalendarComponent,
  ],
})

export class IpiDatepickerComponent {

  constructor(
    private ngZone: NgZone,
    private osService: OSService,
    private elementRef: ElementRef,
    private overlayService: OverlayService,
    private changeDetectorRef: ChangeDetectorRef,
    private datepickerService: IpiDatepickerService,
    private rangeSelectionStrategy: DefaultCalendarRangeStrategy,
  ) {}

  @ViewChild('datepicker') datepicker!: ElementRef<HTMLElement> | null;
  @ViewChild('calendar') calendar!: ElementRef<HTMLElement> | null;

  @Input() options!: IpiDatepickerOptions;

  public get activeDate(): Date | null {
    return this._activeDate;
  }
  public set activeDate(value: Date) {
    const validDate =
      this.datepickerService.getValidDateOrNull(this.datepickerService.deserialize(value)) ||
      this.datepickerService.today();

    this._activeDate = this.datepickerService.clampDate(validDate, this.minDate, this.maxDate);

    this._activeDate = value;
    this.shouldShowCalendar = false;
  }

  public get minDate(): Date | null {
    return this._minDate;
  }
  public set minDate(value: Date | null) {
    this._minDate = this.datepickerService.getValidDateOrNull(this.datepickerService.deserialize(value));
  }

  public get maxDate(): Date | null {
    return this._maxDate;
  }
  public set maxDate(value: Date | null) {
    this._maxDate = this.datepickerService.getValidDateOrNull(this.datepickerService.deserialize(value));
  }

  public get selectedDate(): DateRange | Date | null {
    return this._selected;
  }
  public set selectedDate(value: DateRange | Date | null) {
    if (this.options.formControlName instanceof DateRangeFormControls) {
      if (value instanceof DateRange) {
        this._selected = value;
      } else {
        this._selected = new DateRange(this.datepickerService.getValidDateOrNull(this.datepickerService.deserialize(value)), null);
      }

      this.options.formGroup.controls[this.options.formControlName.start].setValue(this._selected.start, { emitEvent: false });
      this.options.formGroup.controls[this.options.formControlName.end].setValue(this._selected.end, { emitEvent: false });
     } else {
        this._selected = this.datepickerService.getValidDateOrNull(this.datepickerService.deserialize(value));

        this.options.formGroup.controls[this.options.formControlName].setValue(this._selected, { emitEvent: false });
     }
  }

  public shouldShowCalendar!: boolean;

  public closeButtonFocused = false;

  public formErrorMessage: string | null = null; 

  private errors!: ControlErrors;

  private _activeDate!: Date | null;
  private _selected!: DateRange | Date | null;
  private _minDate: Date | null = this.options?.min ? this.options.min : null;
  private _maxDate: Date | null = this.options?.max ? this.options.max : null;

  private formControlSubscriptions: Subscription[] = [];

  public ngOnInit(): void {
    this._selected = 
      this.options.formControlName instanceof DateRangeFormControls 
      ? new DateRange(null, null)
      : null;

    this.maxDate = this.options.max ? this.options.max : null;
    this.minDate = this.options.min ? this.options.min : null;

    this.initDefaultErrors();

    this.changeDetectorRef.detectChanges();

    this.ngZone.runOutsideAngular(() => {
      if (this.datepicker) {
        this.datepicker.nativeElement.addEventListener('focus', () => this.activateControl());
      }
     });
  }

  public ngAfterViewInit(): void {
    this.setFormSubscriptions();
  }

  public ngOnDestroy(): void {
    if (this.datepicker) {
      this.datepicker.nativeElement.removeEventListener('focusin', () => this.activateControl());
    }

    this.formControlSubscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public activateControl(): void {
    if (this.calendar) {
      return;
    }

    this.ngZone.run(() => {
      this.shouldShowCalendar = true;
      })

      this.changeDetectorRef.markForCheck();
  
      setTimeout(() => { 
        this.generateCalendarPosition(this.calendar!);

        this.overlayService.appendToOverlay(this.calendar!.nativeElement, true);

        this.changeDetectorRef.detectChanges();
      })
  }

  @HostListener('document:click', ['$event'])
  onClick(event: PointerEvent): void {
    if (!this.shouldShowCalendar) {
      return;
    }

    if (this.datepicker) {
      const isIputClicked = this.checkPosition(event, this.elementRef.nativeElement.getBoundingClientRect());

      if (isIputClicked) {
        this.shouldShowCalendar = isIputClicked;

        if (!this.shouldShowCalendar) {
          this.overlayService.removeFromOverlay(this.calendar!.nativeElement);
        }

        return;
      }
    }

    if (this.calendar) {
      const isCalendarClicked = this.checkPosition(event, this.calendar.nativeElement.getBoundingClientRect());

      if (isCalendarClicked) {
        this.ngZone.run(() => {
          this.shouldShowCalendar = isCalendarClicked;
        })
  
        if (!this.shouldShowCalendar) {
          this.overlayService.removeFromOverlay(this.calendar!.nativeElement);
        }
  
        return;
      }
    }

    this.closeCalendar();

    if (!this.shouldShowCalendar) {
      this.overlayService.removeFromOverlay(this.calendar!.nativeElement);
    }
  }

  public getDisplayValue(): string {
    if (!this.selectedDate) {
      return 'No date selected.';
    }

    if (this.selectedDate instanceof Date) {
      return this.datepickerService.formatter.format(this.selectedDate);
    }
  
    if (this.selectedDate instanceof DateRange) {
      if (this.selectedDate.start && this.selectedDate.end) {
        return `${this.datepickerService.formatter.format(this.selectedDate.start)} - ${this.datepickerService.formatter.format(this.selectedDate.end)}`;
      }

      if (this.selectedDate.start) {
        return `${this.datepickerService.formatter.format(this.selectedDate.start)} - `;
      }
    }
  
    return 'No date selected.';
  }

  public getformErrorMessage(): string | null {
    this.formErrorMessage = this.getErrorIfControlInvalid();

    return this.formErrorMessage ? this.formErrorMessage : null;
  }

  public onCloseClick(): void {
    this.closeCalendar();

    if (this.datepicker) {
      this.datepicker.nativeElement.focus();
    }
  }

  public onCloseKeyDown(event: KeyboardEvent): void {
    if (event.code.startsWith('Arrow') || event.code === 'Space') {
      event.preventDefault();
    }

    if (event.code === 'Enter' || event.code === 'Space') {
      this.closeCalendar();

      if (this.datepicker) {
        this.datepicker.nativeElement.focus();
      }

    }
  }

  public handleDragAndDropEnd(event: any): void {
    this.selectedDate = new DateRange(event.value.start, event.value.end);
  }

  public handleUserSelection(event: DateSelectionEvent<Date | null>): void {
    const selection = this.selectedDate;

    const value = event.value;
    const isRange = selection instanceof DateRange;

    if (!value) {
      this.selectedDate = null;

      return;
    }

    if (isRange && this.rangeSelectionStrategy) {
      const newSelection = this.rangeSelectionStrategy.selectionFinished(
        value,
        selection,
      );

      this.selectedDate = newSelection;
    } else if (value && (isRange || !this.datepickerService.sameDate(value, selection))) {
      this.selectedDate = value;
    }
  }

  private closeCalendar(): void {
    this.shouldShowCalendar = false;

    if (this.options.formControlName instanceof DateRangeFormControls) {
      this.options.formGroup.controls[this.options.formControlName.start].markAsTouched();
      this.options.formGroup.controls[this.options.formControlName.end].markAsTouched();
    } else {
      this.options.formGroup.controls[this.options.formControlName].markAsTouched();
    }

    this.overlayService.removeFromOverlay(this.calendar!.nativeElement);
  }

  private generateCalendarPosition(calendar: ElementRef): void {
    const calendarEl = calendar.nativeElement;
    const elementRefRect = this.elementRef.nativeElement.getBoundingClientRect();

    if (this.osService.mobileOS === MobileOS.iOS) {
      elementRefRect.y += window.visualViewport!.offsetTop;
      elementRefRect.x += window.visualViewport!.offsetLeft;
    }

    calendarEl.style.left = elementRefRect.x + 'px';
    calendarEl.style.top = elementRefRect.y + elementRefRect.height + 10 + 'px';

    if (window.innerHeight < calendarEl.getBoundingClientRect().bottom) {
      calendarEl.style.top = 'unset';
      calendarEl.style.left = elementRefRect.x + 'px';
      calendarEl.style.bottom = window.innerHeight - elementRefRect.y + 10 + 'px';
    }
  }

  private setFormSubscriptions(): void { 
    if (this.options.formControlName instanceof DateRangeFormControls) {
      const startControl = this.options.formGroup.controls[this.options.formControlName.start];
      const endControl = this.options.formGroup.controls[this.options.formControlName.end];

      this.formControlSubscriptions.push(
        startControl.valueChanges.subscribe((value) => {
          if (value && this.selectedDate instanceof DateRange) {
            this.selectedDate = new DateRange(
              this.datepickerService.getValidDateOrNull(this.datepickerService.deserialize(value)),
              this.datepickerService.getValidDateOrNull(this.datepickerService.deserialize(this.selectedDate.end))
            )
          }

          this.changeDetectorRef.detectChanges();
        }),

        endControl.valueChanges.subscribe((value) => {
          if (value && this.selectedDate instanceof DateRange) {
            this.selectedDate = new DateRange(
              this.datepickerService.getValidDateOrNull(this.datepickerService.deserialize(this.selectedDate.start)),
              this.datepickerService.getValidDateOrNull(this.datepickerService.deserialize(value))
            )

            this.changeDetectorRef.detectChanges();
          }
        }),
      );

      return;
    } else {
      const control = this.options.formGroup.controls[this.options.formControlName];

      this.formControlSubscriptions.push(
        control.valueChanges.subscribe(() => {
          this.selectedDate = control.value;

          this.changeDetectorRef.detectChanges();
        })
      );
    }
  } 

  // Unified position checker for both input and calendar
  private checkPosition(event: PointerEvent, rect: DOMRect): boolean {
      const x = event.clientX;
      const y = event.clientY;
  
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return true;
      }

      return false;      
  }

  private initDefaultErrors(): void {
    let defaultErrors: ControlErrors = {
      required: 'This is a required field',
    }

    if (this.options.min) {
      this.setMinValidator();
  
      defaultErrors['datepickerMin'] = `Start date should be before ${this.datepickerService.formatter.format(this.minDate!)}`;
    }

    if (this.options.max) {
      this.setMaxValidator();

      defaultErrors['datepickerMax'] = `End date should be before ${this.datepickerService.formatter.format(this.maxDate!)}`;
    }

    if (!this.options.errors) {
      this.errors = defaultErrors;

      return;
    }

    this.errors = {
      ...defaultErrors,
      ...this.options.errors
    }
  }

  private getErrorIfControlInvalid(): string | null {
    if (this.options.formControlName instanceof DateRangeFormControls) {
      const startControl = this.options.formGroup.controls[this.options.formControlName.start];
      const endControl = this.options.formGroup.controls[this.options.formControlName.end];

      if (startControl.touched && startControl.invalid || endControl.touched && endControl.invalid) {
        for (const error in this.errors) {
          if (this.options.formGroup.controls[this.options.formControlName.start].hasError(error)) {

            return this.errors[error];
          }

          if (this.options.formGroup.controls[this.options.formControlName.end].hasError(error)) {
            return this.errors[error];
          }
        }
      }
    } else {
      const control = this.options.formGroup.controls[this.options.formControlName];

      if (control.touched && control.invalid) {
        for (const error in this.errors) {
          if (this.options.formGroup.controls[this.options.formControlName].hasError(error)) {
            return this.errors[error];
          }
        }
      }
    }

    return null;
  }

  private setMinValidator(): void {
    const minValidator = this.datepickerService.minValidator(this.options.min!);

    if (this.options.formControlName instanceof DateRangeFormControls) {
      this.options.formGroup.controls[this.options.formControlName.start].addValidators(minValidator);
    } else {
      this.options.formGroup.controls[this.options.formControlName].addValidators(minValidator);
    }
  }

  private setMaxValidator(): void {
    const maxValidator = this.datepickerService.maxValidator(this.options.max!);
  
    if (this.options.formControlName instanceof DateRangeFormControls) {
      this.options.formGroup.controls[this.options.formControlName.end].addValidators(maxValidator);
    } else {
      this.options.formGroup.controls[this.options.formControlName].addValidators(maxValidator);
    }
  }

}
