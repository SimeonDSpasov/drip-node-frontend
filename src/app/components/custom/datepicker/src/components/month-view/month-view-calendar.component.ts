import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';

import { hasModifierKey } from '@angular/cdk/keycodes';

import { IpiDatepickerService } from './../../datepicker-service';

import { CalendarBody, CalendarCell } from './../calendar-body/calendar-body.component';

import { DateRange, DateSelectionEvent } from './../../datepicker.component';

import { DefaultCalendarRangeStrategy } from './../../datepicker-selection-strategy.component';

@Component({
  selector: 'ipi-calendar-month-view',
  templateUrl: './month-view-calendar.component.html',
  styleUrls: ['./month-view-calendar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CalendarBody,
  ],
})

export class IpiCalendarMonthView {

  constructor(
    public datepickerService: IpiDatepickerService,
    private changeDetectorRef: ChangeDetectorRef,
    private rangeSelectionStartegy: DefaultCalendarRangeStrategy) { 
      this._activeDate = this.datepickerService.today();
  }

  @ViewChild(CalendarBody) calendarBody!: CalendarBody;

  @Input()
  public get activeDate(): Date {
    return this._activeDate;
  }
  public set activeDate(value: Date | null) {
    const oldActiveDate = this._activeDate;
  
    const validDate =
      this.datepickerService.getValidDateOrNull(this.datepickerService.deserialize(value)) ||
      this.datepickerService.today();
  
    this._activeDate = this.datepickerService.clampDate(validDate, validDate, validDate);

    if (!this.hasSameMonthAndYear(oldActiveDate, this._activeDate)) {
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
      this._selected = this.datepickerService.getValidDateOrNull(this.datepickerService.deserialize(value));
    }

    this.setRanges(this._selected);
  }

  @Input()
  public get minDate(): Date | null {
    return this._minDate;
  }
  public set minDate(value: Date | null) {
    this._minDate = this.datepickerService.getValidDateOrNull(this.datepickerService.deserialize(value));
  }

  @Input()
  public get maxDate(): Date | null {
    return this._maxDate;
  }
  public set maxDate(value: Date | null) {
    this._maxDate = this.datepickerService.getValidDateOrNull(this.datepickerService.deserialize(value));
  }

  @Input() activeDrag: DateSelectionEvent<Date> | null = null;

  @Output() dragStarted = new EventEmitter<DateSelectionEvent<Date>>();
  @Output() dragEnded = new EventEmitter<DateSelectionEvent<DateRange | null>>();

  @Output() activeDateChange: EventEmitter<Date> = new EventEmitter<Date>();

  @Output() userSelection: EventEmitter<DateSelectionEvent<Date | null>> =
  new EventEmitter<DateSelectionEvent<Date | null>>();

  @Output() selectedChange: EventEmitter<Date | null> = new EventEmitter<Date | null>();

  public monthLabel!: string;

  /** Grid of calendar cells representing the dates of the month. */
  public weeks!: CalendarCell[][];

  /** The number of blank cells in the first row before the 1st of the month. */
  public firstWeekOffset!: number;

  /** Start value of the currently-shown date range. */
  public rangeStart!: number | null;

  /** End value of the currently-shown date range. */
  public rangeEnd!: number | null;

  /** Start of the preview range. */
  public previewStart!: number | null;

  /** End of the preview range. */
  public previewEnd!: number | null;

  /** Whether the user is currently selecting a range of dates. */
  public isRange!: boolean;

  /** The date of the month that today falls on. Null if today is in another month. */
  public todayDate!: number | null;

  public weekdays!: { long: string; narrow: string; id: number }[];

  private selectionKeyPressed!: boolean;

  private _minDate!: Date | null;

  private _maxDate!: Date | null;

  private _selected!: DateRange | Date | null;

  private _activeDate!: Date;

  private uniqueIdCounter = 0;

  public ngOnChanges(changes: SimpleChanges): void {
    const comparisonChange = changes['comparisonStart'] || changes['comparisonEnd'];

    if (comparisonChange && !comparisonChange.firstChange) {
      this.setRanges(this.selected);
    }

    if (changes['activeDrag']) {
      this.clearPreview();
    }
  }

  public ngAfterContentInit(): void {
    this.init();
  }

  public getActiveCell(): number {
    return this.datepickerService.getDate(this.activeDate) - 1;
  }

  public updateActiveDate(event: DateSelectionEvent<number>): void {
    const month = event.value;
    const oldActiveDate = this._activeDate;
    this.activeDate = this.getDateFromDayOfMonth(month);

    if (this.datepickerService.compareDate(oldActiveDate, this.activeDate)) {
      this.activeDateChange.emit(this._activeDate);
    }
  }

  /** Handles when a new date is selected. */
  public dateSelected(event: DateSelectionEvent<number>): void {
    const date = event.value;
    const selectedDate = this.getDateFromDayOfMonth(date);

    let rangeStartDate: number | null;
    let rangeEndDate: number | null;

    if (this._selected instanceof DateRange) {
      rangeStartDate = this.getDateInCurrentMonth(this._selected.start);
      rangeEndDate = this.getDateInCurrentMonth(this._selected.end);
    } else {
      rangeStartDate = rangeEndDate = this.getDateInCurrentMonth(this._selected);
    }

    if (rangeStartDate !== date || rangeEndDate !== date) {
      this.selectedChange.emit(selectedDate);
    }

    this.userSelection.emit({ value: selectedDate, event: event.event });

    this.clearPreview();
  }

  public handleCalendarBodyKeydown(event: KeyboardEvent): void {
    const oldActiveDate = this._activeDate;

    switch (event.code) {
      case 'ArrowLeft':
        this.activeDate = this.datepickerService.addCalendarDays(this._activeDate, -1);
        break;
      case 'ArrowRight':
        this.activeDate = this.datepickerService.addCalendarDays(this._activeDate, 1);
        break;
      case 'ArrowUp':
        this.activeDate = this.datepickerService.addCalendarDays(this._activeDate, -7);
        break;
      case 'ArrowDown':
        this.activeDate = this.datepickerService.addCalendarDays(this._activeDate, 7);
        break;
      case 'Home':
        this.activeDate = this.datepickerService.addCalendarDays(
          this._activeDate,
          1 - this.datepickerService.getDate(this._activeDate),
        );
        break;
      case 'End':
        this.activeDate = this.datepickerService.addCalendarDays(
          this._activeDate,
          this.datepickerService.getNumDaysInMonth(this._activeDate) -
            this.datepickerService.getDate(this._activeDate),
        );
        break;
      case 'PageUp':
        this.activeDate = event.altKey
          ? this.datepickerService.addCalendarYears(this._activeDate, -1)
          : this.datepickerService.addCalendarMonths(this._activeDate, -1);
        break;
      case 'PageDown':
        this.activeDate = event.altKey
          ? this.datepickerService.addCalendarYears(this._activeDate, 1)
          : this.datepickerService.addCalendarMonths(this._activeDate, 1);
        break;
      case 'Enter':
      case 'Space':
        this.selectionKeyPressed = true;

          // Prevent unexpected default actions such as form submission.
          // Note that we only prevent the default action here while the selection happens in
          // `keyup` below. We can't do the selection here, because it can cause the calendar to
          // reopen if focus is restored immediately. We also can't call `preventDefault` on `keyup`
          // because it's too late (see #23305).
          event.preventDefault();
        
        return;
      case 'Escape':
        // Abort the current range selection if the user presses escape mid-selection.
        if (this.previewEnd != null && !hasModifierKey(event)) {
          this.clearPreview();
          // If a drag is in progress, cancel the drag without changing the
          // current selection.
          if (this.activeDrag) {
            this.dragEnded.emit({ value: null, event });
          } else {
            this.selectedChange.emit(null);
            this.userSelection.emit({ value: null, event });
          }
          event.preventDefault();
        }
        return;
      default:
        // Don't prevent default or focus active cell on keys that we don't explicitly handle.
        return;
    }

    if (this.datepickerService.compareDate(oldActiveDate, this.activeDate)) {
      this.activeDateChange.emit(this.activeDate);

      this.focusActiveCellAfterViewChecked();
    }

    event.preventDefault();
  }

  public previewChanged({ value: cell }: DateSelectionEvent<CalendarCell<Date> | null>) {
    if (this.rangeSelectionStartegy) {
      if (!this.selected) {
         return; 
      }

      // We can assume that this will be a range, because preview
      // events aren't fired for single date selections.
      const value = (cell ? cell.rawValue! : null) as Date | null;

      const previewRange = this.rangeSelectionStartegy.createPreview(
        value,
        this.selected as DateRange,
      );

      this.previewStart = this.getCellCompareValue(previewRange.start);
      this.previewEnd = this.getCellCompareValue(previewRange.end);

      if (this.activeDrag && value) {
        const dragRange = this.rangeSelectionStartegy.createDrag?.(
          this.activeDrag.value,
          this.selected as DateRange,
          value,
        );

        if (dragRange) {
          this.previewStart = this.getCellCompareValue(dragRange.start);
          this.previewEnd = this.getCellCompareValue(dragRange.end);
        }
      }

      this.changeDetectorRef.markForCheck();
    }
  }

  public handleCalendarBodyKeyup(event: KeyboardEvent): void {
    if (event.code === 'Space' || event.code === 'Enter') {
      if (this.selectionKeyPressed && this.shouldEnableDate(this._activeDate)) {
        this.dateSelected({ value: this.datepickerService.getDate(this._activeDate), event });
      }

      this.selectionKeyPressed = false;
    }
  }

  public focusActiveCellAfterViewChecked(): void {
    this.calendarBody.scheduleFocusActiveCellAfterViewChecked();
  }

  private clearPreview() {
    this.previewStart = this.previewEnd = null;
  }

  /**
 * Gets the date in this month that the given Date falls on.
 * Returns null if the given Date is in another month.
 */
  private getDateInCurrentMonth(date: Date | null): number | null {
    return date && this.hasSameMonthAndYear(date, this.activeDate)
      ? this.datepickerService.getDate(date)
      : null;
  }

  private init(): void {
    this.setRanges(this.selected);
    IpiDatepickerService
    this.todayDate = this.getCellCompareValue(this.datepickerService.today());

    this.monthLabel = this.datepickerService.dateFormats.display.monthLabel
      ? this.datepickerService.formatDate(this.activeDate, this.datepickerService.dateFormats.display.monthLabel)
      : this.datepickerService
          .getMonthNames('short')
          [this.datepickerService.getMonth(this.activeDate)].toLocaleUpperCase();

    let firstOfMonth = this.datepickerService.createDate(
      this.datepickerService.getYear(this.activeDate),
      this.datepickerService.getMonth(this.activeDate),
      1,
    );

    this.firstWeekOffset =
      (this.datepickerService.DAYS_PER_WEEK +
        this.datepickerService.getDayOfWeek(firstOfMonth) -
        this.datepickerService.getFirstDayOfWeek()) %
        this.datepickerService.DAYS_PER_WEEK;

    this.initWeekdays();
    this.createWeekCells();
  }

  private setRanges(selectedValue: DateRange | Date | null) {
    if (selectedValue instanceof DateRange) {

    this.rangeStart = this.getCellCompareValue(selectedValue.start);
    this.rangeEnd = this.getCellCompareValue(selectedValue.end);

    this.isRange = true;
    } else if (selectedValue instanceof Date) {
      this.rangeStart = this.rangeEnd = this.getCellCompareValue(selectedValue);
      this.isRange = false;
    }
  }

  private getCellCompareValue(date: Date | null): number | null {
    if (date) {
      // We use the time since the Unix epoch to compare dates in this view, rather than the
      // cell values, because we need to support ranges that span across multiple months/years.
      const year = this.datepickerService.getYear(date);
      const month = this.datepickerService.getMonth(date);
      const day = this.datepickerService.getDate(date);
      return new Date(year, month, day).getTime();
    }

    return null;
  }

  private initWeekdays(): void {
    const firstDayOfWeek = this.datepickerService.getFirstDayOfWeek();

    const narrowWeekdays = this.datepickerService.getDayOfWeekNames('narrow');
    const longWeekdays = this.datepickerService.getDayOfWeekNames('long');

    // Rotate the labels for days of the week based on the configured first day of the week.
    let weekdays = longWeekdays.map((long, i) => {
      return { long, narrow: narrowWeekdays[i], id: this.uniqueIdCounter++ };
    });

    this.weekdays = weekdays.slice(firstDayOfWeek).concat(weekdays.slice(0, firstDayOfWeek));
  }

  private createWeekCells(): void {
    const daysInMonth = this.datepickerService.getNumDaysInMonth(this.activeDate);
    const dateNames = this.datepickerService.getDateNames();

    this.weeks = [[]];

    for (let i = 0, cell = this.firstWeekOffset; i < daysInMonth; i++, cell++) {
      if (cell == this.datepickerService.DAYS_PER_WEEK) {
        this.weeks.push([]);
        cell = 0;
      }

      const date = this.datepickerService.createDate(
        this.datepickerService.getYear(this.activeDate),
        this.datepickerService.getMonth(this.activeDate),
        i + 1,
      );

      const enabled = this.shouldEnableDate(date);
      const ariaLabel = this.datepickerService.formatDate(date, this.datepickerService.dateFormats.display.dateA11yLabel);

      this.weeks[this.weeks.length - 1].push(
        new CalendarCell<Date>(
          i + 1,
          dateNames[i],
          ariaLabel,
          enabled,
          this.getCellCompareValue(date)!,
          date,
        ),
      );
    }
  }

  private hasSameMonthAndYear(firstDate: Date | null, secondDate: Date | null): boolean {
    return !!(
      firstDate &&
      secondDate &&
      this.datepickerService.getMonth(firstDate) == this.datepickerService.getMonth(secondDate) &&
      this.datepickerService.getYear(firstDate) == this.datepickerService.getYear(secondDate)
    );
  }

  protected onDragEnded(event: DateSelectionEvent<Date | null>): void {
    if (!this.activeDrag) return;

    if (event.value) {
      // Propagate drag effect
      const dragDropResult = this.rangeSelectionStartegy?.createDrag?.(
        this.activeDrag.value,
        this.selected as DateRange,
        event.value,
      );
      
      if ((!dragDropResult?.end || !this.shouldEnableDate(dragDropResult.end)) || (!dragDropResult?.start || !this.shouldEnableDate(dragDropResult.start))) {
          return;
      }

      this.dragEnded.emit({value: dragDropResult, event: event.event});
    } else {
      this.dragEnded.emit({value: null, event: event.event});
    }
  }

  private shouldEnableDate(date: Date): boolean {
    return (
      !!date &&
      (!this.minDate || this.datepickerService.compareDate(date as any, this.minDate) >= 0) &&
      (!this.maxDate || this.datepickerService.compareDate(date as any, this.maxDate) <= 0)
    );
  }

  private getDateFromDayOfMonth(dayOfMonth: number): Date {
    return this.datepickerService.createDate(
      this.datepickerService.getYear(this.activeDate),
      this.datepickerService.getMonth(this.activeDate),
      dayOfMonth,
    );
  }

}
