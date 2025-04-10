import { Component, ElementRef, SimpleChanges, ChangeDetectionStrategy, EventEmitter, Input, Output, NgZone } from '@angular/core';

import { Platform, normalizePassiveListenerOptions } from '@angular/cdk/platform';

import { DateSelectionEvent } from './../../datepicker.component';

export class CalendarCell<D = any> {

  constructor(
    public value: number,
    public displayValue: string,
    public ariaLabel: string,
    public enabled: boolean,
    public compareValue = value,
    public rawValue?: D,
  ) {}
}

let calendarBodyId = 1;

@Component({
  selector: '[calendar-body]',
  host: {
    'class': 'calendar-body',
  },
  templateUrl: 'calendar-body.component.html',
  styleUrl: 'calendar-body.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class CalendarBody {

  constructor(
    private ngZone: NgZone,
    private platform: Platform,
    private elementRef: ElementRef,
  ) {
    this.ngZone.runOutsideAngular(() => {
      const element = this.elementRef.nativeElement;

      element.addEventListener('touchmove', this.touchmoveHandler, this.activeCapturingEventOptions);

      element.addEventListener('mouseenter', this.enterHandler, this.passiveCapturingEventOptions);
      element.addEventListener('focus', this.enterHandler, this.passiveCapturingEventOptions);
      element.addEventListener('mouseleave', this.leaveHandler, this.passiveCapturingEventOptions);

      element.addEventListener('mousedown', this.mousedownHandler, this.passiveEventOptions);
      element.addEventListener('touchstart', this.mousedownHandler, this.passiveEventOptions);

      if (this.platform.isBrowser) {
        window.addEventListener('mouseup', this.mouseupHandler);
        window.addEventListener('touchend', this.touchendHandler);
      }
    });
  }

  /** The label for the table. (e.g. "Jan 2017"). */
  @Input() label!: string;

  /** The cells to display in the table. */
  @Input() rows!: CalendarCell[][];

  /** The value in the table that corresponds to today. */
  @Input() todayValue!: number;

  /** Start value of the selected date range. */
  @Input() startValue!: number;

  /** End value of the selected date range. */
  @Input() endValue!: number;

  /** The minimum number of free cells needed to fit the label in the first row. */
  @Input() labelMinRequiredCells!: number;

  /** The number of columns in the table. */
  @Input() numCols: number = 7;

  /** The cell number of the active cell in the table. */
  @Input() activeCell: number = 0;

  /** Whether a range is being selected. */
  @Input() isRange: boolean = false;

  /**
   * The aspect ratio (width / height) to use for the cells in the table. This aspect ratio will be
   * maintained even as the table resizes.
   */
  @Input() cellAspectRatio: number = 1;

  /** Start of the comparison range. */
  @Input() comparisonStart!: number | null;

  /** End of the comparison range. */
  @Input() comparisonEnd!: number | null;

  /** Start of the preview range. */
  @Input() previewStart: number | null = null;

  /** End of the preview range. */
  @Input() previewEnd: number | null = null;

  /** ARIA Accessible name of the StartDate */
  @Input() startDateAccessibleName!: string | null;

  /** ARIA Accessible name of the EndDate */
  @Input() endDateAccessibleName!: string | null;

  /** Emits when a new value is selected. */
  @Output() selectedValueChange = new EventEmitter<DateSelectionEvent<number>>();

  /** Emits when the preview has changed as a result of a user action. */
  @Output() previewChange = new EventEmitter<DateSelectionEvent<CalendarCell | null>>();

  @Output() activeDateChange = new EventEmitter<DateSelectionEvent<number>>();

  /** Emits the date at the possible start of a drag event. */
  @Output() dragStarted = new EventEmitter<DateSelectionEvent<Date>>();

  /** Emits the date at the conclusion of a drag, or null if mouse was not released on a date. */
  @Output() dragEnded = new EventEmitter<DateSelectionEvent<Date | null>>();

  /** The number of blank cells to put at the beginning for the first row. */
  public firstRowOffset!: number;

  /** Padding for the individual date cells. */
  public cellPadding!: string;

  private id = `calendar-body-${calendarBodyId++}`;
  public startDateLabelId = `${this.id}-start-date`;
  public endDateLabelId = `${this.id}-end-date`;

  /** Width of an individual cell. */
  public cellWidth!: string;

  /**
    * Used to skip the next focus event when rendering the preview range.
    * We need a flag like this, because some browsers fire focus events asynchronously.
  */
  private skipNextFocus!: boolean;

  /**
    * Used to focus the active cell after change detection has run.
  */
  private focusActiveCellAfterViewChecked = true;

  private didDragSinceMouseDown = false;

  private activeCapturingEventOptions = normalizePassiveListenerOptions({
    passive: false,
    capture: true,
  });

  private passiveCapturingEventOptions = normalizePassiveListenerOptions({
    passive: true,
    capture: true,
  });

  private passiveEventOptions = normalizePassiveListenerOptions({ passive: true });

  public ngOnChanges(changes: SimpleChanges): void {
    const columnChanges = changes['numCols'];
    const {rows, numCols} = this;

    if (changes['rows'] || columnChanges) {
      this.firstRowOffset = rows && rows.length && rows[0].length ? numCols - rows[0].length : 0;
    }

    if (changes['cellAspectRatio'] || columnChanges || !this.cellPadding) {
      this.cellPadding = `${(50 * this.cellAspectRatio) / numCols}%`;
    }

    if (columnChanges || !this.cellWidth) {
      this.cellWidth = `${100 / numCols}%`;
    }
  }

  public ngAfterViewChecked(): void {
    if (this.focusActiveCellAfterViewChecked) {
      this.focusActiveCell();
      this.focusActiveCellAfterViewChecked = false;
    }
  }

  public ngOnDestroy(): void {
    const element = this.elementRef.nativeElement;

    element.removeEventListener('touchmove', this.touchmoveHandler, this.activeCapturingEventOptions);

    element.removeEventListener('mouseenter', this.enterHandler, this.passiveCapturingEventOptions);
    element.removeEventListener('focus', this.enterHandler, this.passiveCapturingEventOptions);
    element.removeEventListener('mouseleave', this.leaveHandler, this.passiveCapturingEventOptions);

    element.removeEventListener('mousedown', this.mousedownHandler, this.passiveEventOptions);
    element.removeEventListener('touchstart', this.mousedownHandler, this.passiveEventOptions);

    if (this.platform.isBrowser) {
      window.removeEventListener('mouseup', this.mouseupHandler);
      window.removeEventListener('touchend', this.touchendHandler);
    }
  }

  public trackRow = (row: CalendarCell[]) => row;

  /** Called when a cell is clicked. */
  public cellClicked(cell: CalendarCell, event: MouseEvent): void {
    // Ignore "clicks" that are actually canceled drags (eg the user dragged
    // off and then went back to this cell to undo).
    if (this.didDragSinceMouseDown) {
      return;
    }

    if (cell.enabled) {
      this.selectedValueChange.emit({ value: cell.value, event });
    }
  }

  public emitActiveDateChange(cell: CalendarCell, event: FocusEvent): void {
    if (cell.enabled) {
      this.activeDateChange.emit({ value: cell.value, event });
    }
  }

  /** Returns whether a cell should be marked as selected. */
  public isSelected(value: number): boolean {
    return this.startValue === value || this.endValue === value;
  }

  /** Returns whether a cell is active. */
  public isActiveCell(rowIndex: number, colIndex: number): boolean {
    let cellNumber = rowIndex * this.numCols + colIndex;

    // Account for the fact that the first row may not have as many cells.
    if (rowIndex) {
      cellNumber -= this.firstRowOffset;
    }

    return cellNumber == this.activeCell;
  }

  public focusActiveCell(movePreview = true): void {
    const activeCell: HTMLElement | null = this.elementRef.nativeElement.querySelector(
      '.active',
    );

    if (activeCell) {
      if (!movePreview) {
        this.skipNextFocus = true;
      }

      activeCell.focus();
    }
  }

  /** Focuses the active cell after change detection has run and the microtask queue is empty. */
  public scheduleFocusActiveCellAfterViewChecked(): void {
    this.focusActiveCellAfterViewChecked = true;
  }

  /** Gets whether a value is the start of the main range. */
  public isRangeStart(value: number): boolean {
    return this.isStart(value, this.startValue, this.endValue);
  }

  /** Gets whether a value is the end of the main range. */
  public isRangeEnd(value: number): boolean {
    return this.isEnd(value, this.startValue, this.endValue);
  }

  /** Gets whether a value is within the currently-selected range. */
  public isCellInRange(value: number): boolean {
    return this.isInRange(value, this.startValue, this.endValue, this.isRange);
  }

  /** Gets whether a value is the start of the preview range. */
  public isPreviewStart(value: number): boolean {
    return this.isStart(value, this.previewStart, this.previewEnd);
  }

  /** Gets whether a value is the end of the preview range. */
  public isPreviewEnd(value: number): boolean {
    return this.isEnd(value, this.previewStart, this.previewEnd);
  }

  /** Gets whether a value is inside the preview range. */
  public isInPreview(value: number): boolean {
    return this.isInRange(value, this.previewStart, this.previewEnd, this.isRange);
  }

  /** Gets ids of aria descriptions for the start and end of a date range. */
  public getDescribedby(value: number): string | null {
    if (!this.isRange) {
      return null;
    }

    if (this.startValue === value && this.endValue === value) {
      return `${this.startDateLabelId} ${this.endDateLabelId}`;
    } else if (this.startValue === value) {
      return this.startDateLabelId;
    } else if (this.endValue === value) {
      return this.endDateLabelId;
    }

    return null;
  }

  /**
   * Event handler for when the user enters an element
   * inside the calendar body (e.g. by hovering in or focus).
   */
  private enterHandler = (event: Event) => {
    if (this.skipNextFocus && event.type === 'focus') {
      this.skipNextFocus = false;
      return;
    }

    // We only need to hit the zone when we're selecting a range.
    if (event.target && this.isRange) {
      const cell = this.getCellFromElement(event.target as HTMLElement);

      if (!cell?.enabled) {
        return;
      }
  
      if (cell) {
        this.ngZone.run(() => this.previewChange.emit({ value: cell.enabled ? cell : null, event }));
      }
    }
  };

  private touchmoveHandler = (event: TouchEvent) => {
    if (!this.isRange) return;

    const target = this.getActualTouchTarget(event);
    const cell = target ? this.getCellFromElement(target as HTMLElement) : null;

    if (!cell?.enabled) {
      return;
    }

    if (target !== event.target) {
      this.didDragSinceMouseDown = true;
    }

    // If the initial target of the touch is a date cell, prevent default so
    // that the move is not handled as a scroll.
    if (this.getCellElement(event.target as HTMLElement)) {
      event.preventDefault();
    }

    this.ngZone.run(() => this.previewChange.emit({value: cell?.enabled ? cell : null, event}));
  };

  /**
   * Event handler for when the user's pointer leaves an element
   * inside the calendar body (e.g. by hovering out or blurring).
   */
  private leaveHandler = (event: Event) => {
    // We only need to hit the zone when we're selecting a range.
    if (this.previewEnd !== null && this.isRange) {
      if (event.type !== 'blur') {
        this.didDragSinceMouseDown = true;
      }

      const cell = this.getCellFromElement(event.target as HTMLElement);

      if (!cell?.enabled) {
        return;
      }

      // Only reset the preview end value when leaving cells. This looks better, because
      // we have a gap between the cells and the rows and we don't want to remove the
      // range just for it to show up again when the user moves a few pixels to the side.
      if (
        event.target &&
        cell &&
        !(
          (event as MouseEvent).relatedTarget &&
          this.getCellFromElement((event as MouseEvent).relatedTarget as HTMLElement)
        )
      ) {
        this.ngZone.run(() => this.previewChange.emit({ value: null, event }));
      }
    }
  };

  /**
   * Triggered on mousedown or touchstart on a date cell.
   * Respsonsible for starting a drag sequence.
   */
  private mousedownHandler = (event: Event) => {
    if (!this.isRange) return;

    this.didDragSinceMouseDown = false;
    // Begin a drag if a cell within the current range was targeted.
    const cell = event.target && this.getCellFromElement(event.target as HTMLElement);

    if (!cell || !this.isCellInRange(cell.compareValue)) {
      return;
    }

    this.ngZone.run(() => {
      this.dragStarted.emit({
        value: cell.rawValue,
        event,
      });
    });
  };

  /** Triggered on mouseup anywhere. Respsonsible for ending a drag sequence. */
  private mouseupHandler = (event: Event) => {
    if (!this.isRange) return;

    const cellElement = this.getCellElement(event.target as HTMLElement);
    if (!cellElement) {
      // Mouseup happened outside of datepicker. Cancel drag.
      this.ngZone.run(() => {
        this.dragEnded.emit({value: null, event});
      });
      return;
    }

    // if (cellElement.closest('.calendar-body') !== this.elementRef.nativeElement) {
    //   // Mouseup happened inside a different month instance.
    //   // Allow it to handle the event.
    //   return;
    // }

    this.ngZone.run(() => {
      const cell = this.getCellFromElement(cellElement);

      this.dragEnded.emit({value: cell?.rawValue ?? null, event});
    });
  };

  /** Triggered on touchend anywhere. Respsonsible for ending a drag sequence. */
  private touchendHandler = (event: TouchEvent) => {
    const target = this.getActualTouchTarget(event);

    if (target) {
      this.mouseupHandler({ target } as unknown as Event);
    }
  };

  /** Finds the CalendarCell that corresponds to a DOM node. */
  private getCellFromElement(element: HTMLElement): CalendarCell | null {
    const cell = this.getCellElement(element);

    if (cell) {
      const row = cell.getAttribute('data-row');
      const col = cell.getAttribute('data-col');

      if (row && col) {
        return this.rows[parseInt(row)][parseInt(col)];
      }
    }

    return null;
  }

  /**
 * Gets the date table cell element that is or contains the specified element.
 * Or returns null if element is not part of a date cell.
 */
  private getCellElement(element: HTMLElement): HTMLElement | null {
    let cell: HTMLElement | undefined;
    if (this.isTableCell(element)) {
      cell = element;
    } else if (this.isTableCell(element.parentNode)) {
      cell = element.parentNode as HTMLElement;
    } else if (this.isTableCell(element.parentNode?.parentNode)) {
      cell = element.parentNode!.parentNode as HTMLElement;
    }

    return cell?.getAttribute('data-row') != null ? cell : null;
  }

  /** Checks whether a node is a table cell element. */
  private isTableCell(node: Node | undefined | null): node is HTMLTableCellElement {
    return node?.nodeName === 'TD';
  }

  /** Checks whether a value is the start of a range. */
  private isStart(value: number, start: number | null, end: number | null): boolean {
    return end !== null && start !== end && value < end && value === start;
  }

  /** Checks whether a value is the end of a range. */
  private isEnd(value: number, start: number | null, end: number | null): boolean {
    return start !== null && start !== end && value >= start && value === end;
  }

  private isInRange(
    value: number,
    start: number | null,
    end: number | null,
    rangeEnabled: boolean,
  ): boolean {
    return (
      rangeEnabled &&
      start !== null &&
      end !== null &&
      start !== end &&
      value >= start &&
      value <= end
    );
  }


  /**
   * Extracts the element that actually corresponds to a touch event's location
   * (rather than the element that initiated the sequence of touch events).
   */
  private getActualTouchTarget(event: TouchEvent): Element | null {
    const touchLocation = event.changedTouches[0];
    return document.elementFromPoint(touchLocation.clientX, touchLocation.clientY);
  }

}
