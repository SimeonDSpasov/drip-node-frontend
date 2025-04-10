import { Injectable } from '@angular/core';

import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})

export class IpiDatepickerService {

  public DAYS_PER_WEEK = 7;

  public yearsPerRow = 4;
  public yearsPerPage = 24;

  private dateLocale = 'en-US';

  public formatter = new Intl.DateTimeFormat(this.dateLocale, {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });

  public dateFormats = { 
    display: {
      dateInput: { year: 'numeric', month: 'numeric', day: 'numeric' },
      monthLabel: { month: 'short' },
      monthYearLabel: { year: 'numeric', month: 'short' },
      dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
      monthYearA11yLabel: { year: 'numeric', month: 'long' },
    },
  }

  public today(): Date {
    return new Date();
  }

  public getDate(date: Date): number {
    return date.getDate();
  }

  public getMonth(date: Date): number {
    return date.getMonth();
  }

  public getYear(date: Date): number {
    return date.getFullYear();
  }

  public getDayOfWeek(date: Date): number {
    return date.getDay();
  }

  public getDateLocale(): string {
    return this.dateLocale;
  }

  public setDateLocale(value: string): void {
    this.formatter = new Intl.DateTimeFormat(value, {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    })

    this.dateLocale = value;
  }

  public getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
    const dtf = new Intl.DateTimeFormat(this.dateLocale, { month: style, timeZone: 'utc' });

    return this.range(12, i => this.format(dtf, new Date(2017, i, 1)));
  }

  public getFirstDayOfWeek(): number {
    if (typeof Intl !== 'undefined' && Intl.Locale) {
      const locale = new Intl.Locale(this.dateLocale) as {
        getWeekInfo?: () => {firstDay: number};
        weekInfo?: {firstDay: number};
      };

      // Some browsers implement a `getWeekInfo` method while others have a `weekInfo` getter.
      // Note that this isn't supported in all browsers so we need to null check it.
      const firstDay = (locale.getWeekInfo?.() || locale.weekInfo)?.firstDay ?? 0;

      // `weekInfo.firstDay` is a number between 1 and 7 where, starting from Monday,
      // whereas our representation is 0 to 6 where 0 is Sunday so we need to normalize it.
      return firstDay === 7 ? 0 : firstDay;
    }

    // Default to Sunday if the browser doesn't provide the week information.
    return 0;
  }

  public getValidDateOrNull(obj: unknown): Date | null {
    return this.isDateInstance(obj) && this.isValid(obj as Date) ? (obj as Date) : null;
  }

  public getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
    const dtf = new Intl.DateTimeFormat(this.dateLocale, { weekday: style, timeZone: 'utc'});

    return this.range(7, i => this.format(dtf, new Date(2017, 0, i + 1)));
  }

  public getDateNames(): string[] {
    const dtf = new Intl.DateTimeFormat(this.dateLocale, {day: 'numeric', timeZone: 'utc'});

    return this.range(31, i => this.format(dtf, new Date(2017, 0, i + 1)));
  }

  public getYearName(date: Date): string {
    const dtf = new Intl.DateTimeFormat(this.dateLocale, {year: 'numeric', timeZone: 'utc'});

    return this.format(dtf, date);
  }

  public getNumDaysInMonth(date: Date): number {
    return this.getDate(
      this.createDateWithOverflow(this.getYear(date), this.getMonth(date) + 1, 0),
    );
  }

  public createDate(year: number, month: number, date: number): Date {
    // Check for invalid month and date (except upper bound on date which we have to check after
    // creating the Date).
    if (month < 0 || month > 11) {
      throw Error(`Invalid month index "${month}". Month index has to be between 0 and 11.`);
    }

    if (date < 1) {
      throw Error(`Invalid date "${date}". Date has to be greater than 0.`);
    }

    let result = this.createDateWithOverflow(year, month, date);
    // Check that the date wasn't above the upper bound for the month, causing the month to overflow
    if (result.getMonth() != month) {
      throw Error(`Invalid date "${date}" for month with index "${month}".`);
    }

    return result;
  }

  public addCalendarDays(date: Date, days: number): Date {
    return this.createDateWithOverflow(
      this.getYear(date),
      this.getMonth(date),
      this.getDate(date) + days,
    );
  }

  public addCalendarMonths(date: Date, months: number): Date {
    let newDate = this.createDateWithOverflow(
      this.getYear(date),
      this.getMonth(date) + months,
      this.getDate(date),
    );

    // It's possible to wind up in the wrong month if the original month has more days than the new
    // month. In this case we want to go to the last day of the desired month.
    // Note: the additional + 12 % 12 ensures we end up with a positive number, since JS % doesn't
    // guarantee this.
    if (this.getMonth(newDate) != (((this.getMonth(date) + months) % 12) + 12) % 12) {
      newDate = this.createDateWithOverflow(this.getYear(newDate), this.getMonth(newDate), 0);
    }

    return newDate;
  }

  public addCalendarYears(date: Date, years: number): Date {
    return this.addCalendarMonths(date, years * 12);
  }

  public setTime(date: Date, hours: number, minutes: number): Date {
    if (!this.isValid(date)) {
      throw new Error("Invalid date provided");
    }

    if (hours < 0 || hours > 23) {
      throw new Error("Invalid hours provided, must be between 0 and 23");
    }

    if (minutes < 0 || minutes > 59) {
      throw new Error("Invalid minutes provided, must be between 0 and 59");
    }

    const updatedDate = new Date(date);

    updatedDate.setHours(hours);
    updatedDate.setMinutes(minutes);

    return updatedDate;
  }

  public sameDate(first: Date | null, second: Date | null): boolean {
    if (first && second) {
      let firstValid = this.isValid(first);
      let secondValid = this.isValid(second);

      if (firstValid && secondValid) {
        return !this.compareDate(first, second);
      }

      return firstValid == secondValid;
    }

    return first == second;
  }

  /**
  * Compares two dates.
  * @param first The first date to compare.
  * @param second The second date to compare.
  * @returns 0 if the dates are equal, a number less than 0 if the first date is earlier,
  *     a number greater than 0 if the first date is later.
  */
  public compareDate(first: Date, second: Date): number {
    return (
      this.getYear(first) - this.getYear(second) ||
      this.getMonth(first) - this.getMonth(second) ||
      this.getDate(first) - this.getDate(second)
    );
  }

  public deserialize(value: any): Date | null {
    if (value == null || (this.isDateInstance(value) && this.isValid(value))) {
      return value;
    }
    return this.invalid();
  }

  public clampDate(date: Date, min?: Date | null, max?: Date | null): Date {
    if (min && this.compareDate(date, min) < 0) {
      return min;
    }

    if (max && this.compareDate(date, max) > 0) {
      return max;
    }

    return date;
  }

  public formatDate(date: Date, displayFormat: Object): string {
    if (!this.isValid(date)) {
      throw Error('DatepickerService: Cannot format invalid date.');
    }

    const dtf = new Intl.DateTimeFormat(this.dateLocale, {...displayFormat, timeZone: 'utc'});
    return this.format(dtf, date);
  }

  public minValidator(minDate: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const controlValue = control.value;
  
        const min = this.getValidDateOrNull(minDate);

        return !min || !controlValue || this.compareDate(min, controlValue) <= 0
            ? null
            : { 'datepickerMin': { min, actual: controlValue } };
    };
  }

  public maxValidator(maxDate: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const controlValue = control.value;

        const max = this.getValidDateOrNull(maxDate);

        return !max || !controlValue || this.compareDate(max, controlValue) >= 0
            ? null
            : { 'datepickerMax': { max, actual: controlValue } };
    };
  }

  /** Creates a date but allows the month and date to overflow. */
  private createDateWithOverflow(year: number, month: number, date: number) {
    // Passing the year to the constructor causes year numbers <100 to be converted to 19xx.
    // To work around this we use `setFullYear` and `setHours` instead.
    const d = new Date();

    d.setFullYear(year, month, date);
    d.setHours(0, 0, 0, 0);

    return d;
  }

  private format(dtf: Intl.DateTimeFormat, date: Date) {
    // Passing the year to the constructor causes year numbers <100 to be converted to 19xx.
    // To work around this we use `setUTCFullYear` and `setUTCHours` instead.
    const d = new Date();

    d.setUTCFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    d.setUTCHours(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());

    return dtf.format(d);
  }

  private isDateInstance(obj: any) {
    return obj instanceof Date;
  }

  private isValid(date: Date) {
    return !isNaN(date.getTime());
  }

  private invalid(): Date {
    return new Date(NaN);
  }

  public getActiveOffset<D>(
    activeDate: Date,
    minDate: Date | null,
    maxDate: Date | null,
  ): number {
    const activeYear = this.getYear(activeDate);

    return this.positiveModulo(activeYear - this.getStartingYear(minDate, maxDate), this.yearsPerPage);
  }

  private getStartingYear<D>(
    minDate: Date| null,
    maxDate: Date | null,
  ): number {
    let startingYear = 0;

    if (maxDate) {
      const maxYear = this.getYear(maxDate);
  
      startingYear = maxYear - this.yearsPerPage + 1;
    } else if (minDate) {
      startingYear = this.getYear(minDate);
    }

    return startingYear;
  }
  
  public positiveModulo(a: number, b: number): number {
    return ((a % b) + b) % b;
  }

  public isSameMultiYearView<D>(
    date1: Date,
    date2: Date,
    minDate: Date | null,
    maxDate: Date | null,
  ): boolean {
    const year1 = this.getYear(date1);
    const year2 = this.getYear(date2);

    const startingYear = this.getStartingYear(minDate, maxDate);

    return (Math.floor((year1 - startingYear) / this.yearsPerPage) === Math.floor((year2 - startingYear) / this.yearsPerPage));
  }

  private range<T>(length: number, valueFunction: (index: number) => T): T[] {
    const valuesArray = Array(length);
  
    for (let i = 0; i < length; i++) {
      valuesArray[i] = valueFunction(i);
    }

    return valuesArray;
  }

}
