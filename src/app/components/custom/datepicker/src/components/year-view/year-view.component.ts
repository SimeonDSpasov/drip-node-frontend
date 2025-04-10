import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { Subscription } from 'rxjs';

import { DateRange } from './../../datepicker.component';

import { CalendarBody, CalendarCell } from './../calendar-body/calendar-body.component';

import { IpiDatepickerService } from './../../datepicker-service';

@Component({
  selector: 'ipi-calendar-year-view',
  templateUrl: './year-view.component.html',
  styleUrls: ['./year-view.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    CalendarBody,
    ReactiveFormsModule,
  ],
})

export class IpiCalendarYearView {

  constructor(
    public datePickerService: IpiDatepickerService,
    private changeDetectorRef: ChangeDetectorRef) {
      this._activeDate = this.datePickerService.today();
  }

  /** The body of calendar table */
  @ViewChild(CalendarBody) CalendarBody!: CalendarBody;

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

    if (this.datePickerService.getYear(oldActiveDate) !== this.datePickerService.getYear(this._activeDate)) {
      this.init();
    }
  }

  @Input()
  public get selected(): DateRange| Date | null {
    return this._selected;
  }
  public set selected(value: DateRange | Date | null) {
    if (value instanceof DateRange) {
      this._selected = value;
    } else {
      this._selected = this.datePickerService.getValidDateOrNull(this.datePickerService.deserialize(value));
    }

    this.setSelectedMonth(value);
  }

  @Input()
  public get minDate(): Date | null {
    return this._minDate;
  }
  public set minDate(value: Date | null) {
    this._minDate = this.datePickerService.getValidDateOrNull(this.datePickerService.deserialize(value));
  }

  @Input()
  public get maxDate(): Date | null {
    return this._maxDate;
  }
  public set maxDate(value: Date | null) {
    this._maxDate = this.datePickerService.getValidDateOrNull(this.datePickerService.deserialize(value));
  }

  /** Emits when a new month is selected. */
  @Output() selectedChange: EventEmitter<Date> = new EventEmitter<Date>();

  /** Emits the selected month. This doesn't imply a change on the selected date */
  @Output() monthSelected: EventEmitter<Date> = new EventEmitter<Date>();

  /** Emits when any date is activated. */
  @Output() activeDateChange: EventEmitter<Date> = new EventEmitter<Date>();

  /** Grid of calendar cells representing the months of the year. */
  public months!: CalendarCell[][];

  /**
   * The month in this year that the selected Date falls on.
   * Null if the selected Date is in a different year.
  */
  public selectedMonth!: number | null;

  /** The label for this year (e.g. "2017"). */
  public yearLabel!: string;

  /** The month in this year that today falls on. Null if today is in a different year. */
  public todayMonth!: number | null;

  private _activeDate: Date;
  private _minDate!: Date | null;
  private _maxDate!: Date | null;
  private _selected!: DateRange | Date | null;

  /** Flag used to filter out space/enter keyup events that originated outside of the view. */
  private selectionKeyPressed!: boolean;

  private dateFormats = {
    dateInput: null,
    display: {
      dateInput: { year: 'numeric', month: 'numeric', day: 'numeric' },
      monthLabel: { month: 'short' },
      monthYearLabel: { year: 'numeric', month: 'short' },
      dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
      monthYearA11yLabel: { year: 'numeric', month: 'long' },
    },
  }

  public ngAfterContentInit(): void {
    this.init();
  }

  /** Initializes this year view. */
  public init(): void {
    this.setSelectedMonth(this.selected);

    this.todayMonth = this.getMonthInCurrentYear(this.datePickerService.today());

    this.yearLabel = this.datePickerService.getYearName(this.activeDate);

    let monthNames = this.datePickerService.getMonthNames('short');

    // First row of months only contains 5 elements so we can fit the year label on the same row.
    this.months = [ [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11]]
      .map(row => row.map(month => this.createCellForMonth(month, monthNames[month])));
    this.changeDetectorRef.markForCheck();
  }

  /** Handles when a new month is selected. */
  public onMonthSelected(event: any): void {
    const month = event.value;

    const selectedMonth = this.datePickerService.createDate(
      this.datePickerService.getYear(this.activeDate),
      month,
      1,
    );

    this.monthSelected.emit(selectedMonth);

    const selectedDate = this.getDateFromMonth(month);
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
  public updateActiveDate(event: any): void {
    const month = event.value;
    const oldActiveDate = this._activeDate;

    this.activeDate = this.getDateFromMonth(month);

    if (this.datePickerService.compareDate(oldActiveDate, this.activeDate)) {
      this.activeDateChange.emit(this.activeDate);
    }
  }

  /** Handles keydown events on the calendar body when calendar is in year view. */
  public handleCalendarBodyKeydown(event: KeyboardEvent): void {
    const oldActiveDate = this._activeDate;

    switch (event.code) {
      case 'ArrowLeft':
        this.activeDate = this.datePickerService.addCalendarMonths(this._activeDate, -1);
        break;
      case 'ArrowRight':
        this.activeDate = this.datePickerService.addCalendarMonths(this._activeDate, 1);
        break;
      case 'ArrowUp':
        this.activeDate = this.datePickerService.addCalendarMonths(this._activeDate, -4);
        break;
      case 'ArrowDown':
        this.activeDate = this.datePickerService.addCalendarMonths(this._activeDate, 4);
        break;
      case 'Home':
        this.activeDate = this.datePickerService.addCalendarMonths(
          this._activeDate,
          -this.datePickerService.getMonth(this._activeDate),
        );
        break;
      case 'End':
        this.activeDate = this.datePickerService.addCalendarMonths(
          this._activeDate,
          11 - this.datePickerService.getMonth(this._activeDate),
        );
        break;
      case 'PageUp':
        this.activeDate = this.datePickerService.addCalendarYears(
          this._activeDate,
          event.altKey ? -10 : -1,
        );
        break;
      case 'PageDown':
        this.activeDate = this.datePickerService.addCalendarYears(
          this._activeDate,
          event.altKey ? 10 : 1,
        );
        break;
      case 'Enter':
      case 'Space':
        // Note that we only prevent the default action here while the selection happens in
        // `keyup` below. We can't do the selection here, because it can cause the calendar to
        // reopen if focus is restored immediately. We also can't call `preventDefault` on `keyup`
        // because it's too late (see #23305).
        this.selectionKeyPressed = true;
        break;
      default:
        // Don't prevent default or focus active cell on keys that we don't explicitly handle.
        return;
    }

    if (this.datePickerService.compareDate(oldActiveDate, this.activeDate)) {
      this.activeDateChange.emit(this.activeDate);
      this.focusActiveCellAfterViewChecked();
    }

    // Prevent unexpected default actions such as form submission.
    event.preventDefault();
  }

  /** Handles keyup events on the calendar body when calendar is in year view. */
  public handleCalendarBodyKeyup(event: KeyboardEvent): void {
    if (event.code === 'Space' || event.code === 'Enter') {
      if (this.selectionKeyPressed) {
        this.onMonthSelected({ value: this.datePickerService.getMonth(this._activeDate), event });
      }

      this.selectionKeyPressed = false;
    }
  }

  /** Focuses the active cell after the microtask queue is empty. */
  public focusActiveCell(): void {
    this.CalendarBody.focusActiveCell();
  }

  /** Schedules the matCalendarBody to focus the active cell after change detection has run */
  public focusActiveCellAfterViewChecked(): void {
    this.CalendarBody.scheduleFocusActiveCellAfterViewChecked();
  }

  /**
   * Gets the month in this year that the given Date falls on.
   * Returns null if the given Date is in another year.
   */
  private getMonthInCurrentYear(date: Date | null): number | null {
    return date && this.datePickerService.getYear(date) == this.datePickerService.getYear(this.activeDate)
      ? this.datePickerService.getMonth(date)
      : null;
  }

  /**
   * Takes a month and returns a new date in the same day and year as the currently active date.
   *  The returned date will have the same month as the argument date.
   */
  private getDateFromMonth(month: number): Date {
    const normalizedDate = this.datePickerService.createDate(
      this.datePickerService.getYear(this.activeDate),
      month,
      1,
    );

    const daysInMonth = this.datePickerService.getNumDaysInMonth(normalizedDate);

    return this.datePickerService.createDate(
      this.datePickerService.getYear(this.activeDate),
      month,
      Math.min(this.datePickerService.getDate(this.activeDate), daysInMonth),
    );
  }

  /** Creates an MatCalendarCell for the given month. */
  private createCellForMonth(month: number, monthName: string) {
    const date = this.datePickerService.createDate(this.datePickerService.getYear(this.activeDate), month, 1);
    const ariaLabel = this.datePickerService.formatDate(date, this.dateFormats.display.monthYearA11yLabel);

    return new CalendarCell(
      month,
      monthName.toLocaleUpperCase(),
      ariaLabel,
      this.shouldEnableMonth(month),
    );
  }

  /** Whether the given month is enabled. */
  private shouldEnableMonth(month: number) {
    const activeYear = this.datePickerService.getYear(this.activeDate);

    if (month === undefined || month === null || this.isYearAndMonthAfterMaxDate(activeYear, month) || this.isYearAndMonthBeforeMinDate(activeYear, month)) {
      return false;
    }

    return true;
  }

  /**
   * Tests whether the combination month/year is after this.maxDate, considering
   * just the month and year of this.maxDate
   */
  private isYearAndMonthAfterMaxDate(year: number, month: number) {
    if (this.maxDate) {
      const maxYear = this.datePickerService.getYear(this.maxDate);
      const maxMonth = this.datePickerService.getMonth(this.maxDate);

      return year > maxYear || (year === maxYear && month > maxMonth);
    }

    return false;
  }

  /**
   * Tests whether the combination month/year is before this.minDate, considering
   * just the month and year of this.minDate
   */
  private isYearAndMonthBeforeMinDate(year: number, month: number) {
    if (this.minDate) {
      const minYear = this.datePickerService.getYear(this.minDate);
      const minMonth = this.datePickerService.getMonth(this.minDate);

      return year < minYear || (year === minYear && month < minMonth);
    }

    return false;
  }

  /** Sets the currently-selected month based on a model value. */
  private setSelectedMonth(value: DateRange | Date | null): void {
    if (value instanceof DateRange) {
      this.selectedMonth = 
        this.getMonthInCurrentYear(value.start) || this.getMonthInCurrentYear(value.end);
    } else {
      this.selectedMonth = this.getMonthInCurrentYear(value);
    }
  }

}
