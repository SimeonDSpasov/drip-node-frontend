import { Injectable } from "@angular/core";

import { IpiDatepickerService } from './datepicker-service';

import { DateRange } from './datepicker.component';

@Injectable({
    providedIn: 'root'
})
export class DefaultCalendarRangeStrategy {
  constructor(private datepickerService: IpiDatepickerService) {}

  public selectionFinished(date: Date, currentRange: DateRange): DateRange {
    let { start, end } = currentRange;

    if (start == null) {
      start = date;
    } else if (end == null && date && this.datepickerService.compareDate(date, start) >= 0) {
      end = date;
    } else {
      start = date;
      end = null;
    }

    return new DateRange(start, end);
  }

  public createPreview(activeDate: Date | null, currentRange: DateRange): DateRange {
    let start: Date | null = null;
    let end: Date | null = null;

    if (currentRange.start && !currentRange.end && activeDate) {
      start = currentRange.start;
      end = activeDate;
    }

    return new DateRange(start, end);
  }

  public createDrag(dragOrigin: Date, originalRange: DateRange, newDate: Date): DateRange | null {
    let start = originalRange.start;
    let end = originalRange.end;

    if (!start || !end) {
      // Can't drag from an incomplete range.
      return null;
    }

    const service = this.datepickerService;

    const isRange = service.compareDate(start, end) !== 0;
    const diffYears = service.getYear(newDate) - service.getYear(dragOrigin);
    const diffMonths = service.getMonth(newDate) - service.getMonth(dragOrigin);
    const diffDays = service.getDate(newDate) - service.getDate(dragOrigin);

    if (isRange && service.sameDate(dragOrigin, originalRange.start)) {
      start = newDate;
      // when selecting start date of range move only start date
      if (service.compareDate(newDate, end) > 0) {
        // if start date becomes after end date, move whole range
        end = service.addCalendarYears(end, diffYears);
        end = service.addCalendarMonths(end, diffMonths);
        end = service.addCalendarDays(end, diffDays);
      }
    } else if (isRange && service.sameDate(dragOrigin, originalRange.end)) {
      // when selecting end date of range move only end date
      end = newDate;
      if (service.compareDate(newDate, start) < 0) {
        // if end date becomes before start date, move whole range
        start = service.addCalendarYears(start, diffYears);
        start = service.addCalendarMonths(start, diffMonths);
        start = service.addCalendarDays(start, diffDays);
      }
    } else {  
      // moving whole range if dragged from a middle date
      start = service.addCalendarYears(start, diffYears);
      start = service.addCalendarMonths(start, diffMonths);
      start = service.addCalendarDays(start, diffDays);
      end = service.addCalendarYears(end, diffYears);
      end = service.addCalendarMonths(end, diffMonths);
      end = service.addCalendarDays(end, diffDays);
    }

    return new DateRange(start, end);
  }
}