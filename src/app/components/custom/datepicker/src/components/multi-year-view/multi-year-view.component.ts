import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DateSelectionEvent } from './../../datepicker.component';

import { IpiDatepickerService } from './../../datepicker-service';

import { DateRange } from './../../datepicker.component';

import { CalendarCell, CalendarBody } from './../calendar-body/calendar-body.component';

@Component({
  selector: 'ipi-calendar-multi-year-view',
  templateUrl: './multi-year-view.component.html',
  styleUrls: ['./multi-year-view.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    CalendarBody,
    ReactiveFormsModule,
  ],
})

export class IpiCalendarMultiYearView {

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private datePickerService: IpiDatepickerService)
  {
    this._activeDate = this.datePickerService.today();
  }

  /** Flag used to filter out space/enter keyup events that originated outside of the view. */
  private selectionKeyPressed!: boolean;

  /** The date to display in this multi-year view (everything other than the year is ignored). */
  @Input()
  public get activeDate(): Date {
    return this._activeDate;
  }
  public set activeDate(value: Date) {
    let oldActiveDate = this._activeDate;

    const validDate =
      this.datePickerService.getValidDateOrNull(this.datePickerService.deserialize(value)) ||
      this.datePickerService.today();
    this._activeDate = this.datePickerService.clampDate(validDate, this.minDate, this.maxDate);

    if (!this.isSameMultiYearView(oldActiveDate, this._activeDate, this.minDate, this.maxDate)) {
      this.init();
    }
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

    this.setSelectedYear(value);
  }
  private _selected!: DateRange | Date | null;

  /** The minimum selectable date. */
  @Input()
  public get minDate(): Date | null {
    return this._minDate;
  }
  public set minDate(value: Date | null) {
    this._minDate = this.datePickerService.getValidDateOrNull(this.datePickerService.deserialize(value));
  }

  /** The maximum selectable date. */
  @Input()
  public get maxDate(): Date | null {
    return this._maxDate;
  }
  public set maxDate(value: Date | null) {
    this._maxDate = this.datePickerService.getValidDateOrNull(this.datePickerService.deserialize(value));
  }

  /** Emits when a new year is selected. */
  @Output() selectedChange: EventEmitter<Date> = new EventEmitter<Date>();

  /** Emits the selected year. This doesn't imply a change on the selected date */
  @Output() yearSelected: EventEmitter<Date> = new EventEmitter<Date>();

  /** Emits when any date is activated. */
  @Output() activeDateChange: EventEmitter<Date> = new EventEmitter<Date>();

  /** The body of calendar table */
  @ViewChild(CalendarBody) calendarBody!: CalendarBody;

  /** Grid of calendar cells representing the currently displayed years. */
  _years!: CalendarCell[][];

  /** The year that today falls on. */
  _todayYear!: number;

  /** The year of the selected date. Null if the selected date is null. */
  public selectedYear!: number | null;

  private _activeDate: Date;
  private _maxDate!: Date | null;
  private _minDate!: Date | null;

  public ngAfterContentInit(): void {
    this.init();
  }

  public init(): void {
    this._todayYear = this.datePickerService.getYear(this.datePickerService.today());

    // We want a range years such that we maximize the number of
    // enabled dates visible at once. This prevents issues where the minimum year
    // is the last item of a page OR the maximum year is the first item of a page.

    // The offset from the active year to the "slot" for the starting year is the
    // *actual* first rendered year in the multi-year view.
    const activeYear = this.datePickerService.getYear(this._activeDate);
    const minYearOfPage = activeYear - this.datePickerService.getActiveOffset(this.activeDate, this.minDate, this.maxDate);

    this._years = [];
  
    for (let i = 0, row: number[] = []; i < this.datePickerService.yearsPerPage; i++) {
      row.push(minYearOfPage + i);
  
      if (row.length == this.datePickerService.yearsPerRow) {
        this._years.push(row.map(year => this.createCellForYear(year)));

        row = [];
      }
    }

    this.changeDetectorRef.markForCheck();
  }

  /** Handles when a new year is selected. */
  public onYearSelected(event: DateSelectionEvent<number>): void {
    const year = event.value;
    const selectedYear = this.datePickerService.createDate(year, 0, 1);
    const selectedDate = this.getDateFromYear(year);

    this.yearSelected.emit(selectedYear);
    this.selectedChange.emit(selectedDate);
  }

  /**
   * Takes the index of a calendar body cell wrapped in an event as argument. For the date that
   * corresponds to the given cell, set `activeDate` to that date and fire `activeDateChange` with
   * that date.
   *
   * This function is used to match each component's model of the active date with the calendar
   * body cell that was focused. It updates its value of `activeDate` synchronously and updates the
   * parent's value asynchronously via the `activeDateChange` event. The child component receives an
   * updated value asynchronously via the `activeCell` Input.
   */
  public updateActiveDate(event: DateSelectionEvent<number>): void {
    const year = event.value;
    const oldActiveDate = this._activeDate;

    this.activeDate = this.getDateFromYear(year);
    if (this.datePickerService.compareDate(oldActiveDate, this.activeDate)) {
      this.activeDateChange.emit(this.activeDate);
    }
  }

  /** Handles keydown events on the calendar body when calendar is in multi-year view. */
  public handleCalendarBodyKeydown(event: KeyboardEvent): void {
    const oldActiveDate = this._activeDate;

    switch (event.code) {
      case 'ArrowLeft':
        this.activeDate = this.datePickerService.addCalendarYears(this._activeDate, -1);
        break;
      case 'ArrowRight':
        this.activeDate = this.datePickerService.addCalendarYears(this._activeDate, 1);
        break;
      case 'ArrowUp':
        this.activeDate = this.datePickerService.addCalendarYears(this._activeDate, - this.datePickerService.yearsPerRow);
        break;
      case 'ArrowDown':
        this.activeDate = this.datePickerService.addCalendarYears(this._activeDate, this.datePickerService.yearsPerRow);
        break;
      case 'Home':
        this.activeDate = this.datePickerService.addCalendarYears(
          this._activeDate,
          - this.datePickerService.getActiveOffset(this.activeDate, this.minDate, this.maxDate),
        );
        break;
      case 'End':
        this.activeDate = this.datePickerService.addCalendarYears(
          this._activeDate,
          this.datePickerService.yearsPerPage -
            this.datePickerService.getActiveOffset(this.activeDate, this.minDate, this.maxDate) -
            1,
        );
        break;
      case 'PageUp':
        this.activeDate = this.datePickerService.addCalendarYears(
          this._activeDate,
          event.altKey ? - this.datePickerService.yearsPerPage * 10 : - this.datePickerService.yearsPerPage,
        );
        break;
      case 'PageDown':
        this.activeDate = this.datePickerService.addCalendarYears(
          this._activeDate,
          event.altKey ? this.datePickerService.yearsPerPage * 10 : this.datePickerService.yearsPerPage,
        );
        break;
      case 'Enter':
      case 'Space':
        this.selectionKeyPressed = true;
        break;
      default:
        // Don't prevent default or focus active cell on keys that we don't explicitly handle.
        return;
    }
  
    if (this.datePickerService.compareDate(oldActiveDate, this.activeDate)) {
      this.activeDateChange.emit(this.activeDate);
    }

    this.focusActiveCellAfterViewChecked();
    // Prevent unexpected default actions such as form submission.
    event.preventDefault();
  }

  /** Handles keyup events on the calendar body when calendar is in multi-year view. */
  public handleCalendarBodyKeyup(event: KeyboardEvent): void {
    if (event.code === 'Space' || event.code === 'Enter') {
      if (this.selectionKeyPressed) {
        this.onYearSelected({ value: this.datePickerService.getYear(this._activeDate), event });
      }

      this.selectionKeyPressed = false;
    }
  }

  public getActiveCell(): number {
    return this.datePickerService.getActiveOffset(this.activeDate, this.minDate, this.maxDate);
  }

  /** Focuses the active cell after the microtask queue is empty. */
  public focusActiveCell(): void {
    this.calendarBody.focusActiveCell();
  }

  /** Focuses the active cell after change detection has run and the microtask queue is empty. */
  public focusActiveCellAfterViewChecked() {
    this.calendarBody.scheduleFocusActiveCellAfterViewChecked();
  }

  /**
   * Takes a year and returns a new date on the same day and month as the currently active date
   *  The returned date will have the same year as the argument date.
   */
  private getDateFromYear(year: number) {
    const activeMonth = this.datePickerService.getMonth(this.activeDate);
    const daysInMonth = this.datePickerService.getNumDaysInMonth(this.datePickerService.createDate(year, activeMonth, 1));

    const normalizedDate = this.datePickerService.createDate(
      year,
      activeMonth,
      Math.min(this.datePickerService.getDate(this.activeDate), daysInMonth),
    );
  
    return normalizedDate;
  }

  /** Creates an CalendarCell for the given year. */
  private createCellForYear(year: number) {
    const date = this.datePickerService.createDate(year, 0, 1);
    const yearName = this.datePickerService.getYearName(date);

    return new CalendarCell(year, yearName, yearName, this.shouldEnableYear(year));
  }

  /** Whether the given year is enabled. */
  private shouldEnableYear(year: number): boolean {
    // disable if the year is greater than maxDate lower than minDate
    if (
      year === undefined ||
      year === null ||
      (this.maxDate && year > this.datePickerService.getYear(this.maxDate)) ||
      (this.minDate && year < this.datePickerService.getYear(this.minDate))
    ) {
      return false;
    }

    return true;
  }

  /** Sets the currently-highlighted year based on a model value. */
  private setSelectedYear(value: DateRange | Date | null) {
    this.selectedYear = null;

    if (value instanceof DateRange) {
      const displayValue = value.start || value.end;

      if (displayValue) {
        this.selectedYear = this.datePickerService.getYear(displayValue);
      }
    } else if (value) {
      this.selectedYear = this.datePickerService.getYear(value);
    }
  }

  private isSameMultiYearView(
    date1: Date,
    date2: Date,
    minDate: Date | null,
    maxDate: Date | null,
  ): boolean {
    const year1 = this.datePickerService.getYear(date1);
    const year2 = this.datePickerService.getYear(date2);
    const startingYear = this.getStartingYear(minDate, maxDate);
    return (
      Math.floor((year1 - startingYear) / this.datePickerService.yearsPerPage) ===
      Math.floor((year2 - startingYear) / this.datePickerService.yearsPerPage)
    );
  }
  
  private getStartingYear(
    minDate: Date | null,
    maxDate: Date | null,
  ): number {
    let startingYear = 0;
    if (maxDate) {
      const maxYear = this.datePickerService.getYear(maxDate);
      startingYear = maxYear - this.datePickerService.yearsPerPage + 1;
    } else if (minDate) {
      startingYear = this.datePickerService.getYear(minDate);
    }
    return startingYear;
  }

}
