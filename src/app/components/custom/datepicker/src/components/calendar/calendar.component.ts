import { Component, EventEmitter, Input, Output } from '@angular/core';

import { IpiButtonComponent } from '@ipi-soft/ng-components/button';

import { IpiCalendarYearView } from './../year-view/year-view.component';
import { IpiCalendarMonthView } from './../month-view/month-view-calendar.component';
import { IpiCalendarMultiYearView } from './../multi-year-view/multi-year-view.component';

import { IpiDatepickerService } from './../../datepicker-service';

import { DateRange, DateSelectionEvent } from './../../datepicker.component';

export const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'Jun',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

export type activeDateView = 'month' | 'year' | 'multi-year';

@Component({
  selector: 'ipi-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  imports: [
    IpiButtonComponent,
    IpiCalendarYearView,
    IpiCalendarMonthView,
    IpiCalendarMultiYearView,
  ],
})

export class IpiCalendarComponent {

  constructor(private datePickerService: IpiDatepickerService) {}

  @Input()
  public get activeDate(): any {
    return this._activeDate;
  }
  public set activeDate(value: Date | null) {
        const validDate =
      this.datePickerService.getValidDateOrNull(this.datePickerService.deserialize(value)) ||
      this.datePickerService.today();
    
    this._activeDate = this.datePickerService.clampDate(validDate, validDate, validDate);
  }

  @Input()
  public get minDate(): Date | null {
    return this._minDate;
  }
  public set minDate(value: Date | null) {
    this._minDate = this.datePickerService.getValidDateOrNull(this.datePickerService.deserialize(value));
  }

  @Input()
  public get selected(): DateRange | Date | null {
    return this._selected;
  }
  public set selected(value: DateRange | Date | null) {
    if (value instanceof DateRange) {
      this._selected = value;
    } else {
      this._selected = this.datePickerService.getValidDateOrNull(this.datePickerService.deserialize(value));
    }
  }

  @Input()
  public get maxDate(): Date | null {
    return this._maxDate;
  }
  public set maxDate(value: Date | null) {
    this._maxDate = this.datePickerService.getValidDateOrNull(this.datePickerService.deserialize(value));
  }

  @Input() comparisonStart!: Date | null;

  /** End of the comparison range. */
  @Input() comparisonEnd!: Date | null;

  /** ARIA Accessible name of the `<input StartDate/>` */
  @Input() startDateAccessibleName!: string | null;

  /** ARIA Accessible name of the `<input EndDate/>` */
  @Input() endDateAccessibleName!: string | null;

  @Output() monthSelected: EventEmitter<Date> = new EventEmitter<Date>();
  @Output() yearSelected: EventEmitter<Date> = new EventEmitter<Date>();
  @Output() activeDateChange = new EventEmitter<DateSelectionEvent<number>>();
  @Output() userDragDrop = new EventEmitter<DateSelectionEvent<DateRange>>();
  @Output() selectedChange: EventEmitter<Date | null> = new EventEmitter<Date | null>();
  @Output() userSelection: EventEmitter<DateSelectionEvent<Date | null>> = new EventEmitter<DateSelectionEvent<Date | null>>();
  @Output() calendarClose: EventEmitter<any> = new EventEmitter<any>();

  public isButtonHidden = true;

  public activeDateView: activeDateView = 'month';

  public activeDrag: DateSelectionEvent<Date> | null = null;

  private _activeDate!: Date;
  private _minDate!: Date | null;
  private _maxDate!: Date | null;
  private _selected!: DateRange | Date | null;

  public calendarDateViewChange(): void {
    this.activeDateView = this.activeDateView == 'month' ? 'multi-year' : 'month';
  }

  public onCalendarDateViewKeydown(event: KeyboardEvent): void {
    if (event.code.startsWith('Arrow')) {
      event.preventDefault();
    }

    if (event.code === 'Enter' || event.code === 'Space') {
      this.calendarDateViewChange();
    }
  }

  public goToPreviousView(): void {
    this.activeDate =
      this.activeDateView == 'month'
        ? this.datePickerService.addCalendarMonths(this.activeDate, -1)
        : this.datePickerService.addCalendarYears(
            this.activeDate,
            this.activeDateView == 'year' ? -1 : - this.datePickerService.yearsPerPage,
          );
  }

  public goToNextView(): void {
    this.activeDate =
      this.activeDateView == 'month'
        ? this.datePickerService.addCalendarMonths(this.activeDate, 1)
        : this.datePickerService.addCalendarYears(
            this.activeDate,
            this.activeDateView == 'year' ? 1 : this.datePickerService.yearsPerPage,
          );
  }

  public onArrowKeydown(event: KeyboardEvent, direction: 'next' | 'previous'): void {
    if (event.code.startsWith('Arrow')) {
      event.preventDefault();
    }

    if (event.code === 'Enter' || event.code === 'Space') {
      if (direction === 'next') {
        this.goToNextView();
      } else {
        this.goToPreviousView();
      }
    }
  }

  public previousEnabled(): boolean {
    if (!this.minDate) {
      return true;
    }
    return (
      !this.minDate || !this.isSameView(this.activeDate, this.minDate)
    );
  }

  public nextEnabled(): boolean {
    return (
      !this.maxDate || !this.isSameView(this.activeDate, this.maxDate)
    );
  }

  public dragStarted(event: any): void {
    this.activeDrag = event;
  }

  /**
   * Called when a drag completes. It may end in cancelation or in the selection
   * of a new range.
   */
  public dragEnded(event: any): void {
    if (!this.activeDrag) return;

    if (event.value) {
      this.userDragDrop.emit(event as DateSelectionEvent<DateRange>);
    }

    this.activeDrag = null;
  }

  public get viewButtonText(): string {
    if (this.activeDateView === 'month') {
      return this.getCurrentMonthAndYear(this.activeDate);
    }

    if (this.activeDateView === 'year') {
        return this.getCurrentYear(this.activeDate);
    }

    return this.formatYearRange(...this.formatMinAndMaxYearLabels());
  }

  public goToDateInView(date: Date, view: 'month' | 'year' | 'multi-year'): void {
    this.activeDate = date;
    this.activeDateView = view;
  }

  public monthSelectedInYearView(normalizedMonth: Date): void {
    this.monthSelected.emit(normalizedMonth);
  }

  public yearSelectedInMultiYearView(normalizedYear: Date): void {
    this.yearSelected.emit(normalizedYear);
  }

  public dateSelected(event: any): void {
    const date = event.value;

    if (this.selected instanceof DateRange ||
      (date && !this.datePickerService.sameDate(date, this.selected))) {
      this.selectedChange.emit(date);
    }

    this.userSelection.emit({value: date, event });
  }

  public toggleButtonVisibility(event: FocusEvent) {
    if (event.type === 'focusout') {
      this.isButtonHidden = true;
    } else if (event.type === 'focusin') {
      this.isButtonHidden = false;
    }
  }

  private getCurrentMonthAndYear(date: Date): string {  
    const month = months[date.getMonth()];
    const year = date.getFullYear();
  
    return `${month} ${year}`;
  }

  private getCurrentYear(date: Date): string {
    return date.getFullYear().toString();
  }

  private formatYearRange(start: string, end: string): string {
    return `${start} \u2013 ${end}`;
  }

  private formatMinAndMaxYearLabels(): [minYearLabel: string, maxYearLabel: string] {
    // The offset from the active year to the "slot" for the starting year is the
    // *actual* first rendered year in the multi-year view, and the last year is
    // just yearsPerPage - 1 away.
    const activeYear = this.datePickerService.getYear(this.activeDate);
    const minYearOfPage =
      activeYear -
      this.datePickerService.getActiveOffset(
        this.activeDate,
        this.minDate,
        this.maxDate,
      );
    const maxYearOfPage = minYearOfPage + this.datePickerService.yearsPerPage - 1;
    const minYearLabel = this.datePickerService.getYearName(
      this.datePickerService.createDate(minYearOfPage, 0, 1),
    );
    const maxYearLabel = this.datePickerService.getYearName(
      this.datePickerService.createDate(maxYearOfPage, 0, 1),
    );

    return [minYearLabel, maxYearLabel];
  }

  private isSameView(date1: Date, date2: Date): boolean {
    if (this.activeDateView == 'month') {
      return (
        this.datePickerService.getYear(date1) == this.datePickerService.getYear(date2) &&
        this.datePickerService.getMonth(date1) == this.datePickerService.getMonth(date2)
      );
    }
    if (this.activeDateView == 'year') {
      return this.datePickerService.getYear(date1) == this.datePickerService.getYear(date2);
    }

    // Otherwise we are in 'multi-year' view.
    return this.datePickerService.isSameMultiYearView(
      date1,
      date2,
      this.minDate,
      this.maxDate,
    );
  }

}
