# **IPI Datepicker - Developer README**

The **IPI Datepicker** provides an intuitive interface for selecting dates or date ranges. This guide is designed for developers extending, debugging, or integrating the datepicker into applications. It covers the internal architecture, key features, and customization options.

---

## **Overview**

The IPI Datepicker comprises several modular components and services, working together to offer a seamless user experience. Key features include:
- Single-date and range-date selection.
- Customizable validation and formatting.
- Support for advanced user interactions (drag-and-drop range selection, ARIA accessibility).
- Configurable calendar views (`month`, `year`, `multi-year`).

The main components are:
- **Datepicker**: Connects the input field with the calendar.
- **Calendar**: Contains Header for navigation. Handles the switching between views
- **Calendar Views**: Renders the month, year, and multi-year views.
- **Datepicker Service**: Handles date validation, transformation, and formatting.
- **Selection Strategies**: Customizable logic for selecting date ranges.

---

## **Core Components and Their Roles**

# **1. Datepicker Component**
The `IpiDatepickerComponent` connects a text input to a calendar. It manages:
- **Calendar Display**: Shows the calendar popup when activated.
- **Form Integration**: Syncs selected dates with Angular forms.
- **Validation**: Ensures selected dates meet constraints (e.g., `minDate`, `maxDate`, `required`).

---

## Component Overview

The `IpiDatepickerComponent` is a flexible datepicker component for Angular applications. It supports both single and range date selection, integrates with reactive forms, and provides features such as custom validation, drag-and-drop date selection, and responsive positioning.

---

## Properties and Methods

### **Inputs**
| Name         | Type                      | Description                                                                 |
|--------------|---------------------------|-----------------------------------------------------------------------------|
| `options`    | `IpiDatepickerOptions`    | Configuration options for the datepicker, including form controls and limits. |

---

### **Public Variables**
| Name                  | Type                       | Description                                                             |
|-----------------------|----------------------------|-------------------------------------------------------------------------|
| `activeDate`          | `Date \| null`            | The currently active date.                                              |
| `minDate`             | `Date \| null`            | The minimum selectable date.                                            |
| `maxDate`             | `Date \| null`            | The maximum selectable date.                                            |
| `selectedDate`        | `DateRange \| Date \| null`| The currently selected date or range of dates.                          |
| `shouldShowCalendar`  | `boolean`                 | Indicates whether the calendar is visible.                              |
| `closeButtonFocused`  | `boolean`                 | Tracks whether the close button is focused.                             |
| `formErrorMessage`    | `string \| null`          | Displays an error message if the form control is invalid.               |

---

### **Private Variables**
| Name                     | Type                       | Description                                                             |
|--------------------------|----------------------------|-------------------------------------------------------------------------|
| `_activeDate`            | `Date \| null`            | Internally tracked active date.                                         |
| `_selected`              | `DateRange \| Date \| null`| Internally tracked selected date or date range.                         |
| `_minDate`               | `Date \| null`            | Internally tracked minimum date.                                        |
| `_maxDate`               | `Date \| null`            | Internally tracked maximum date.                                        |
| `formControlSubscriptions` | `Subscription[]`         | List of subscriptions to form control value changes.                    |
| `errors`                 | `ControlErrors`           | Custom validation error messages.                                       |

---

### **Lifecycle Hooks**
| Name                 | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| `ngOnInit()`         | Initializes the component, setting up default values and validators.       |
| `ngAfterViewInit()`  | Sets up subscriptions to form control value changes.                       |
| `ngOnDestroy()`      | Cleans up event listeners and subscriptions.                               |

---

### **Public Methods**
| Name                                | Description                                                                 |
|-------------------------------------|-----------------------------------------------------------------------------|
| `activateControl()`                 | Activates the datepicker control and displays the calendar.                 |
| `onClick(event)`                    | Handles document click events to determine if the calendar should close.    |
| `getDisplayValue()`                 | Returns a formatted string representation of the selected date(s).          |
| `getformErrorMessage()`             | Returns the error message if the form control is invalid.                   |
| `onCloseClick()`                    | Handles the close button click event to close the calendar.                 |
| `onCloseKeyDown(event)`             | Handles keydown events on the close button for keyboard accessibility.      |
| `handleDragAndDropEnd(event)`       | Updates the selected date range after a drag-and-drop interaction.          |
| `handleUserSelection(event)`        | Processes user date selection and updates the form control value.           |

---

### **Private Methods**
| Name                                  | Description                                                                 |
|---------------------------------------|-----------------------------------------------------------------------------|
| `closeCalendar()`                     | Closes the calendar and marks the form controls as touched.                 |
| `generateCalendarPosition(calendar)`  | Dynamically calculates and sets the calendar's position on the screen.      |
| `setFormSubscriptions()`              | Subscribes to value changes of form controls to synchronize with the component's state. |
| `checkPosition(event, rect)`          | Checks if a pointer event occurred within the bounds of a DOM element.      |
| `initDefaultErrors()`                 | Initializes default validation error messages for the datepicker.           |
| `getErrorIfControlInvalid()`          | Checks if the form control is invalid and returns the appropriate error message. |
| `setMinValidator()`                   | Adds a minimum date validator to the form control.                          |
| `setMaxValidator()`                   | Adds a maximum date validator to the form control.                          |

---

### **Input: `IpiDatepickerOptions`**
| Property             | Type                          | Description                                                                 |
|----------------------|-------------------------------|-----------------------------------------------------------------------------|
| `label`              | `string`                     | The label for the datepicker.                                              |
| `formGroup`          | `FormGroup`                  | The reactive form group containing the datepicker controls.                |
| `formControlName`    | `string \| DateRangeFormControls` | The name(s) of the form controls to bind to the datepicker.               |
| `min`                | `Date`                       | The minimum selectable date.                                               |
| `max`                | `Date`                       | The maximum selectable date.                                               |
| `errors`             | `ControlErrors`              | Custom validation error messages.                                          |

---

### **Date Range Handling**
The component supports selecting a single date or a range of dates. It synchronizes with form controls and emits events to notify the parent component about changes.

#### **Range Selection Events**
- **`handleDragAndDropEnd(event)`**: Updates the selected range after a drag event.
- **`handleUserSelection(event)`**: Updates the selected date or range based on user interaction.

---

### **Keyboard Accessibility**
- **Close Button**:
  - `ArrowKeys`: Navigate within the close button.
  - `Enter` or `Space`: Closes the calendar and returns focus to the input.
- **Date Selection**: Keyboard navigation through the calendar is supported by child components like `IpiCalendarComponent`.

---

### **Validation**
The component supports both default and custom validation messages:
- **Default Validators**:
  - **`required`**: Checks if the field is required.
  - **`datepickerMin`**: Ensures the date is not before the minimum date.
  - **`datepickerMax`**: Ensures the date is not after the maximum date.
- **Custom Errors**: Defined through the `errors` property in `IpiDatepickerOptions`.

---

### **Usage Notes**
- **Dependencies**: The component depends on `IpiDatepickerService` for date utilities and `OverlayService` for calendar positioning.
- **Styling**: Customize the appearance via `datepicker.component.css`.
- **Dynamic Positioning**: The calendar dynamically repositions itself to remain within the viewport.

---

# **2. Calendar Component**

---

## Component Overview

The `IpiCalendarComponent` is a versatile and customizable calendar component that supports multiple views: month, year, and multi-year. It allows users to select dates or ranges of dates, navigate through different calendar views, and handle date selection events. It integrates with the `IpiDatepickerService` for date utility functions and supports accessibility features.

---

## Properties and Methods

### **Inputs**
| Name                     | Type                       | Description                                                                 |
|--------------------------|----------------------------|-----------------------------------------------------------------------------|
| `activeDate`             | `Date \| null`            | The currently active date displayed in the calendar.                        |
| `minDate`                | `Date \| null`            | The minimum selectable date.                                                |
| `maxDate`                | `Date \| null`            | The maximum selectable date.                                                |
| `selected`               | `DateRange \| Date \| null`| The currently selected date or range of dates.                              |
| `comparisonStart`        | `Date \| null`            | Start of the comparison range for visual differentiation.                   |
| `comparisonEnd`          | `Date \| null`            | End of the comparison range.                                                |
| `startDateAccessibleName`| `string \| null`          | ARIA accessible name for the start date input.                              |
| `endDateAccessibleName`  | `string \| null`          | ARIA accessible name for the end date input.                                |

---

### **Outputs**
| Name                | Type                           | Description                                                               |
|---------------------|--------------------------------|---------------------------------------------------------------------------|
| `monthSelected`     | `EventEmitter<Date>`          | Emitted when a month is selected.                                         |
| `yearSelected`      | `EventEmitter<Date>`          | Emitted when a year is selected.                                          |
| `activeDateChange`  | `EventEmitter<DateSelectionEvent<number>>` | Emitted when the active date changes.                    |
| `userDragDrop`      | `EventEmitter<DateSelectionEvent<DateRange>>` | Emitted when a date range is selected via drag-and-drop.     |
| `selectedChange`    | `EventEmitter<Date \| null>`  | Emitted when the selected date changes.                                   |
| `userSelection`     | `EventEmitter<DateSelectionEvent<Date \| null>>` | Emitted when the user selects a date or date range.          |
| `calendarClose`     | `EventEmitter<any>`           | Emitted when the calendar is closed.                                      |

---

### **Public Variables**
| Name               | Type                    | Description                                                                 |
|--------------------|-------------------------|-----------------------------------------------------------------------------|
| `isButtonHidden`   | `boolean`              | Tracks whether navigation buttons are hidden.                              |
| `activeDateView`   | `activeDateView`       | Tracks the currently active view (`'month'`, `'year'`, or `'multi-year'`). |
| `activeDrag`       | `DateSelectionEvent<Date> \| null` | Tracks an active drag event during range selection.                     |

---

### **Private Variables**
| Name           | Type                        | Description                                                             |
|----------------|-----------------------------|-------------------------------------------------------------------------|
| `_activeDate`  | `Date`                      | Internally tracked active date.                                         |
| `_minDate`     | `Date \| null`              | Internally tracked minimum date.                                        |
| `_maxDate`     | `Date \| null`              | Internally tracked maximum date.                                        |
| `_selected`    | `DateRange \| Date \| null` | Internally tracked selected date or date range.                         |

---

### **Public Methods**
| Name                                | Description                                                                 |
|-------------------------------------|-----------------------------------------------------------------------------|
| `calendarDateViewChange()`          | Toggles between `'month'` and `'multi-year'` views.                        |
| `onCalendarDateViewKeydown(event)`  | Handles keyboard events for toggling between calendar views.               |
| `goToPreviousView()`                | Navigates to the previous month, year, or multi-year page based on the active view. |
| `goToNextView()`                    | Navigates to the next month, year, or multi-year page based on the active view. |
| `onArrowKeydown(event, direction)`  | Handles keyboard navigation for moving to the next or previous view.       |
| `previousEnabled()`                 | Checks if navigation to the previous view is enabled.                      |
| `nextEnabled()`                     | Checks if navigation to the next view is enabled.                          |
| `dragStarted(event)`                | Tracks the start of a drag-and-drop interaction for range selection.       |
| `dragEnded(event)`                  | Handles the end of a drag-and-drop interaction and emits the selected range.|
| `viewButtonText()`                  | Returns the label text for the current view's button.                      |
| `goToDateInView(date, view)`        | Navigates to a specific date and sets the active view.                     |
| `monthSelectedInYearView(date)`     | Emits `monthSelected` when a month is selected in the year view.           |
| `yearSelectedInMultiYearView(date)` | Emits `yearSelected` when a year is selected in the multi-year view.       |
| `dateSelected(event)`               | Handles user date selection and emits relevant events.                     |
| `toggleButtonVisibility(event)`     | Toggles the visibility of navigation buttons based on focus events.        |

---

### **Private Methods**
| Name                                  | Description                                                                 |
|---------------------------------------|-----------------------------------------------------------------------------|
| `getCurrentMonthAndYear(date)`        | Returns the current month and year as a formatted string.                   |
| `getCurrentYear(date)`                | Returns the year as a formatted string.                                     |
| `formatYearRange(start, end)`         | Formats the year range for the multi-year view.                             |
| `formatMinAndMaxYearLabels()`         | Calculates and returns the min and max year labels for the multi-year view. |
| `isSameView(date1, date2)`            | Checks if two dates belong to the same calendar view.                       |

---

### **Date Selection and Views**
The component supports multiple views for navigating and selecting dates:
1. **Month View**: Displays days in the currently active month.
2. **Year View**: Displays months in the currently active year.
3. **Multi-Year View**: Displays a grid of years for quick navigation.

---

### **Keyboard Navigation**
The following keyboard interactions are supported:
- **Arrow Keys**: Navigate between dates, months, or years in the current view.
- **Enter/Space**: Confirm selection or toggle between views.
- **Tab**: Navigate between interactive elements like buttons and inputs.

---

### **Range Selection**
- **Drag-and-Drop**: Users can select a range of dates by dragging across the calendar.
- **Events**:
  - `dragStarted`: Emitted at the start of a drag interaction.
  - `dragEnded`: Emitted at the end of a drag interaction.

---

### **ARIA and Accessibility**
- ARIA attributes (`startDateAccessibleName`, `endDateAccessibleName`) ensure compatibility with screen readers.
- Navigation buttons and calendar views are accessible via keyboard.

---

### **Styling**
The appearance of the calendar can be customized via the `calendar.component.css` file.

---

# **3. Calendar Views**

## **Month View (`IpiCalendarMonthView`)**
Displays days of the current month. Handles:
- Navigation to adjacent months.
- Date selection and highlighting.

## Component Overview

The `IpiCalendarMonthView` is a reusable calendar component designed to display and interact with a monthly calendar view. It allows users to select dates, navigate between months, and handle date ranges. The component integrates with the `IpiDatepickerService` for date utilities and adheres to the Angular `ChangeDetectionStrategy.OnPush` to optimize performance.

---

## Properties and Methods

### **Inputs**
| Name          | Type                     | Description                                                                 |
|---------------|--------------------------|-----------------------------------------------------------------------------|
| `activeDate`  | `Date`                   | The currently active date displayed in the calendar.                       |
| `selected`    | `DateRange` \| `Date`    | The currently selected date or range of dates.                             |
| `minDate`     | `Date`                   | The minimum date allowed for selection.                                    |
| `maxDate`     | `Date`                   | The maximum date allowed for selection.                                    |
| `activeDrag`  | `DateSelectionEvent<Date>` | The currently active drag selection event.                                 |

---

### **Outputs**
| Name             | Type                                     | Description                                                   |
|------------------|------------------------------------------|---------------------------------------------------------------|
| `dragStarted`    | `EventEmitter<DateSelectionEvent<Date>>` | Emitted when the user starts dragging a date range.           |
| `dragEnded`      | `EventEmitter<DateSelectionEvent<DateRange \| null>>` | Emitted when the user ends dragging a date range.   |
| `activeDateChange` | `EventEmitter<Date>`                   | Emitted when the `activeDate` changes.                        |
| `userSelection`  | `EventEmitter<DateSelectionEvent<Date>>` | Emitted when the user selects a new date or date range.        |
| `selectedChange` | `EventEmitter<Date>`                    | Emitted when the selected date changes.                       |

---

### **Public Variables**
| Name             | Type                         | Description                                                       |
|------------------|------------------------------|-------------------------------------------------------------------|
| `monthLabel`     | `string`                     | Label of the current month, displayed in the calendar header.     |
| `weeks`          | `CalendarCell[][]`           | A 2D array representing weeks and days in the current month.      |
| `firstWeekOffset` | `number`                    | The offset for the first week (blank cells before the 1st).       |
| `rangeStart`     | `number \| null`             | Start value of the currently selected date range.                 |
| `rangeEnd`       | `number \| null`             | End value of the currently selected date range.                   |
| `previewStart`   | `number \| null`             | Start of the date range preview during selection.                 |
| `previewEnd`     | `number \| null`             | End of the date range preview during selection.                   |
| `todayDate`      | `number \| null`             | The day of the month representing "today". Null if not visible.   |
| `isRange`        | `boolean`                    | Indicates whether a range of dates is being selected.             |
| `weekdays`       | `{ long: string; narrow: string; id: number }[]` | Days of the week labels.                     |

---

### **Lifecycle Hooks**
| Name                 | Description                                                                                     |
|----------------------|-------------------------------------------------------------------------------------------------|
| `ngOnChanges`        | Reacts to changes in input properties like `activeDrag` or date range comparisons.             |
| `ngAfterContentInit` | Initializes calendar state (e.g., `monthLabel`, `weeks`, etc.) after content is projected.      |

---

### **Public Methods**
| Name                         | Description                                                                                   |
|------------------------------|-----------------------------------------------------------------------------------------------|
| `getActiveCell()`            | Returns the index of the currently active date cell.                                          |
| `updateActiveDate(event)`    | Updates the active date based on a user selection.                                            |
| `dateSelected(event)`        | Handles user date selection and emits relevant events.                                        |
| `handleCalendarBodyKeydown(event)` | Handles keyboard navigation for the calendar (e.g., arrow keys for date navigation).           |
| `handleCalendarBodyKeyup(event)`   | Handles the selection of a date when the `Space` or `Enter` key is pressed.                 |
| `focusActiveCellAfterViewChecked()` | Focuses on the currently active cell after the view is updated.                          |

---

### **Private Methods**
| Name                   | Description                                                                                         |
|------------------------|-----------------------------------------------------------------------------------------------------|
| `clearPreview()`       | Clears the preview range during date selection.                                                    |
| `getDateInCurrentMonth(date)` | Gets the day of the month if the date is in the current calendar month.                            |
| `init()`               | Initializes the calendar view, including the month label and weekday names.                         |
| `setRanges(value)`     | Sets the start and end values for the selected range or single date.                                 |
| `getCellCompareValue(date)` | Converts a date into a numeric value for comparison.                                             |
| `initWeekdays()`       | Initializes the labels for days of the week based on the locale settings.                            |
| `createWeekCells()`    | Creates the grid structure for the weeks and days in the current month.                              |
| `hasSameMonthAndYear(first, second)` | Checks whether two dates belong to the same month and year.                              |
| `shouldEnableDate(date)` | Validates if a given date is enabled based on `minDate` and `maxDate`.                             |
| `getDateFromDayOfMonth(dayOfMonth)` | Constructs a `Date` object for a given day of the month in the active month/year.         |

---

### Usage Notes
- **Dependency**: The component relies on `IpiDatepickerService` for date manipulation and utility functions.
- **Styling**: Customize the appearance using the `month-view-calendar.component.css` stylesheet.
- **Events**: Use the output events (`dragStarted`, `userSelection`, etc.) to handle user interactions.

---

## **Year View (`IpiCalendarYearView`)**
Displays months of a year. Allows:
- Navigation to adjacent years.
- Month selection.

## Component Overview

The `IpiCalendarYearView` component renders a year view for calendar functionality. It displays months of the year as selectable elements and integrates with date utilities provided by the `IpiDatepickerService`. It allows users to select a month or navigate between years with various features such as keyboard navigation and date validation.

---

## Properties and Methods

### **Inputs**
| Name       | Type                       | Description                                                       |
|------------|----------------------------|-------------------------------------------------------------------|
| `activeDate` | `Date`                   | The currently active date displayed in the calendar.             |
| `selected` | `DateRange \| Date \| null` | The currently selected date or date range.                       |
| `minDate`  | `Date \| null`             | The minimum date allowed for selection.                          |
| `maxDate`  | `Date \| null`             | The maximum date allowed for selection.                          |

---

### **Outputs**
| Name               | Type                           | Description                                                     |
|--------------------|--------------------------------|-----------------------------------------------------------------|
| `selectedChange`   | `EventEmitter<Date>`          | Emitted when the selected month changes.                       |
| `monthSelected`    | `EventEmitter<Date>`          | Emitted when a month is selected, independent of selection.    |
| `activeDateChange` | `EventEmitter<Date>`          | Emitted when the active date changes (e.g., via navigation).   |

---

### **Public Variables**
| Name             | Type                     | Description                                                   |
|------------------|--------------------------|---------------------------------------------------------------|
| `months`         | `CalendarCell[][]`       | A grid representing months of the year for selection.         |
| `selectedMonth`  | `number \| null`         | Index of the currently selected month in the current year.    |
| `yearLabel`      | `string`                 | The label for the current year (e.g., "2024").                |
| `todayMonth`     | `number \| null`         | Index of the month representing today, if in the current year.|

---

### **Private Variables**
| Name                | Type                       | Description                                                       |
|---------------------|----------------------------|-------------------------------------------------------------------|
| `_activeDate`       | `Date`                    | The internally tracked active date.                              |
| `_minDate`          | `Date \| null`            | The internally tracked minimum date.                            |
| `_maxDate`          | `Date \| null`            | The internally tracked maximum date.                            |
| `_selected`         | `DateRange \| Date \| null`| The internally tracked selected date or date range.              |
| `selectionKeyPressed` | `boolean`               | Tracks whether the `Enter` or `Space` key has been pressed.      |

---

### **Lifecycle Hooks**
| Name                 | Description                                                     |
|----------------------|-----------------------------------------------------------------|
| `ngAfterContentInit` | Initializes the calendar state when the component is ready.     |

---

### **Public Methods**
| Name                                | Description                                                                 |
|-------------------------------------|-----------------------------------------------------------------------------|
| `init()`                            | Initializes the year view, including months and their labels.              |
| `onMonthSelected(event: any)`       | Handles selection of a month and emits relevant events.                    |
| `updateActiveDate(event: any)`      | Updates the active date based on user interaction and emits `activeDateChange`. |
| `handleCalendarBodyKeydown(event)`  | Handles keyboard navigation within the calendar.                           |
| `handleCalendarBodyKeyup(event)`    | Handles keyup events (e.g., selecting a month using `Enter` or `Space`).   |
| `focusActiveCell()`                 | Focuses on the currently active cell.                                      |
| `focusActiveCellAfterViewChecked()` | Schedules focus for the active cell after view updates.                    |

---

### **Private Methods**
| Name                                  | Description                                                                 |
|---------------------------------------|-----------------------------------------------------------------------------|
| `getMonthInCurrentYear(date: Date)`   | Returns the month index if the given date is in the current year.           |
| `getDateFromMonth(month: number)`     | Constructs a `Date` object for the given month in the active year.          |
| `createCellForMonth(month, name)`     | Creates a `CalendarCell` for a specific month with a label.                 |
| `shouldEnableMonth(month: number)`    | Determines if a month is enabled based on `minDate` and `maxDate`.          |
| `isYearAndMonthAfterMaxDate(year, month)` | Checks if a month/year combination is after the maximum date.              |
| `isYearAndMonthBeforeMinDate(year, month)` | Checks if a month/year combination is before the minimum date.             |
| `setSelectedMonth(value: DateRange \| Date \| null)` | Sets the selected month based on the provided date or date range.          |

---

### **Keyboard Navigation**
The following keys are supported for navigation:
- **ArrowLeft**: Move to the previous month.
- **ArrowRight**: Move to the next month.
- **ArrowUp**: Move up by four months.
- **ArrowDown**: Move down by four months.
- **Home**: Move to the first month of the year.
- **End**: Move to the last month of the year.
- **PageUp**: Move to the same month in the previous year (or decade if `Alt` is pressed).
- **PageDown**: Move to the same month in the next year (or decade if `Alt` is pressed).

---

### **Usage Notes**
- **Dependency**: This component relies on `IpiDatepickerService` for date calculations and utilities.
- **Styling**: Customize the appearance using `year-view.component.css`.
- **Integration**: Emits events (`selectedChange`, `monthSelected`, `activeDateChange`) for external handling of user interactions.

## **Multi-Year View (`IpiCalendarMultiYearView`)**
Displays multiple years in a grid. Enables:
- Decade navigation.
- Year selection.

---

## Component Overview

The `IpiCalendarMultiYearView` component is designed to display a multi-year view for calendar functionality. It shows a grid of years and enables navigation, selection, and interaction over multiple years. The component utilizes the `IpiDatepickerService` for date utilities and adheres to the `ChangeDetectionStrategy.OnPush` for optimized performance.

---

## Properties and Methods

### **Inputs**
| Name       | Type                       | Description                                                       |
|------------|----------------------------|-------------------------------------------------------------------|
| `activeDate` | `Date`                   | The currently active date. Only the year of this date is used.    |
| `selected` | `DateRange \| Date \| null` | The currently selected date or date range.                       |
| `minDate`  | `Date \| null`             | The minimum selectable date.                                      |
| `maxDate`  | `Date \| null`             | The maximum selectable date.                                      |

---

### **Outputs**
| Name               | Type                           | Description                                                     |
|--------------------|--------------------------------|-----------------------------------------------------------------|
| `selectedChange`   | `EventEmitter<Date>`          | Emitted when the selected year changes.                        |
| `yearSelected`     | `EventEmitter<Date>`          | Emitted when a year is selected, independent of the selected date. |
| `activeDateChange` | `EventEmitter<Date>`          | Emitted when the active date changes (e.g., via navigation).   |

---

### **Public Variables**
| Name           | Type                  | Description                                                   |
|----------------|-----------------------|---------------------------------------------------------------|
| `_years`       | `CalendarCell[][]`    | A grid of years displayed in the multi-year view.             |
| `_todayYear`   | `number`              | The year representing "today".                                |
| `selectedYear` | `number \| null`      | The year of the selected date. Null if no date is selected.   |

---

### **Private Variables**
| Name                | Type                       | Description                                                       |
|---------------------|----------------------------|-------------------------------------------------------------------|
| `_activeDate`       | `Date`                    | The internally tracked active date.                              |
| `_minDate`          | `Date \| null`            | The internally tracked minimum date.                            |
| `_maxDate`          | `Date \| null`            | The internally tracked maximum date.                            |
| `selectionKeyPressed` | `boolean`               | Tracks whether the `Enter` or `Space` key has been pressed.      |

---

### **Lifecycle Hooks**
| Name                 | Description                                                     |
|----------------------|-----------------------------------------------------------------|
| `ngAfterContentInit` | Initializes the multi-year view after content projection.       |

---

### **Public Methods**
| Name                                | Description                                                                 |
|-------------------------------------|-----------------------------------------------------------------------------|
| `init()`                            | Initializes the multi-year view by calculating the grid of years.          |
| `onYearSelected(event)`             | Handles year selection and emits the corresponding events.                 |
| `updateActiveDate(event)`           | Updates the active date and emits `activeDateChange`.                      |
| `handleCalendarBodyKeydown(event)`  | Handles keyboard navigation within the multi-year view.                    |
| `handleCalendarBodyKeyup(event)`    | Handles keyup events to finalize selection using `Enter` or `Space`.       |
| `getActiveCell()`                   | Returns the index of the active cell in the grid.                          |
| `focusActiveCell()`                 | Focuses on the currently active cell.                                      |
| `focusActiveCellAfterViewChecked()` | Focuses the active cell after view changes and microtask execution.        |

---

### **Private Methods**
| Name                                  | Description                                                                 |
|---------------------------------------|-----------------------------------------------------------------------------|
| `getDateFromYear(year)`               | Constructs a `Date` object for the given year, retaining the active month's day. |
| `createCellForYear(year)`             | Creates a `CalendarCell` for a specific year with a label.                  |
| `shouldEnableYear(year)`              | Determines if a year is selectable based on `minDate` and `maxDate`.        |
| `setSelectedYear(value)`              | Highlights the currently selected year based on the input value.            |
| `isSameMultiYearView(date1, date2, minDate, maxDate)` | Checks if two dates fall within the same multi-year page.              |
| `getStartingYear(minDate, maxDate)`   | Determines the starting year for the currently visible multi-year view.     |

---

### **Keyboard Navigation**
The following keys are supported for navigation:
- **ArrowLeft**: Move to the previous year.
- **ArrowRight**: Move to the next year.
- **ArrowUp**: Move up by the number of years in a row.
- **ArrowDown**: Move down by the number of years in a row.
- **Home**: Move to the first year of the visible page.
- **End**: Move to the last year of the visible page.
- **PageUp**: Move to the previous page of years (or 10 pages if `Alt` is pressed).
- **PageDown**: Move to the next page of years (or 10 pages if `Alt` is pressed).
- **Enter/Space**: Select the currently active year.

---

### **Usage Notes**
- **Dependency**: Relies on `IpiDatepickerService` for date utilities and configuration.
- **Styling**: The appearance can be customized via `multi-year-view.component.css`.
- **Integration**: Emits events (`selectedChange`, `yearSelected`, `activeDateChange`) to notify parent components of user interactions.

---

This README provides a comprehensive guide to using and integrating the `IpiCalendarMultiYearView` component within Angular applications.
---

### **3. Calendar Service**
The `IpiDatepickerService` centralizes logic for:
- **Date Parsing and Formatting**: Adapts to locale and user-defined formats.
- **Validation**: Checks dates against constraints and filters.
- **Range Handling**: Ensures logical range selections (e.g., start date ≤ end date).

---

# **4. Calendar Body**
The `CalendarBody` is a low-level component that:
- Renders the calendar grid (days, months, or years).
- Handles keyboard navigation and accessibility.
- Supports drag-and-drop range selection.

## Component Overview

The `CalendarBody` component is a core part of the datepicker UI, responsible for rendering a grid of cells (e.g., days, months, or years) in a calendar format. It manages user interactions such as selection, hovering, and range previews. The component supports accessibility.

---

## Properties and Methods

### **Inputs**
| Name                       | Type                   | Description                                                                 |
|----------------------------|------------------------|-----------------------------------------------------------------------------|
| `label`                    | `string`              | The label for the table (e.g., "January 2024").                             |
| `rows`                     | `CalendarCell[][]`    | The grid of cells to display in the calendar body.                          |
| `todayValue`               | `number`              | The value in the table that corresponds to today.                           |
| `startValue`               | `number`              | The start value of the selected range.                                      |
| `endValue`                 | `number`              | The end value of the selected range.                                        |
| `labelMinRequiredCells`    | `number`              | The minimum number of free cells required to fit the label in the first row.|
| `numCols`                  | `number`              | The number of columns in the table. Defaults to `7`.                        |
| `activeCell`               | `number`              | The index of the active cell in the grid.                                   |
| `isRange`                  | `boolean`             | Indicates whether a date range is being selected.                           |
| `cellAspectRatio`          | `number`              | The aspect ratio (width/height) for the table cells. Defaults to `1`.       |
| `comparisonStart`          | `number \| null`      | The start of the comparison range.                                          |
| `comparisonEnd`            | `number \| null`      | The end of the comparison range.                                            |
| `previewStart`             | `number \| null`      | The start of the preview range during selection.                            |
| `previewEnd`               | `number \| null`      | The end of the preview range during selection.                              |
| `startDateAccessibleName`  | `string \| null`      | Accessible name for the start date of the range.                            |
| `endDateAccessibleName`    | `string \| null`      | Accessible name for the end date of the range.                              |

#### NOTES: startValue === endValue if we are in single date Datepicker.
---

### **Outputs**
| Name                 | Type                           | Description                                                     |
|----------------------|--------------------------------|-----------------------------------------------------------------|
| `selectedValueChange` | `EventEmitter<DateSelectionEvent<number>>` | Emitted when a new value is selected.                          |
| `previewChange`       | `EventEmitter<DateSelectionEvent<CalendarCell \| null>>` | Emitted when the preview range changes.       |
| `activeDateChange`    | `EventEmitter<DateSelectionEvent<number>>` | Emitted when the active date changes.                          |
| `dragStarted`         | `EventEmitter<DateSelectionEvent<Date>>` | Emitted when a drag event starts.                              |
| `dragEnded`           | `EventEmitter<DateSelectionEvent<Date \| null>>` | Emitted when a drag event ends.                              |

---

### **Public Variables**
| Name               | Type     | Description                                                        |
|--------------------|----------|--------------------------------------------------------------------|
| `firstRowOffset`   | `number` | Number of blank cells in the first row to align with the calendar. |
| `cellPadding`      | `string` | Padding for individual cells to maintain aspect ratio.             |
| `cellWidth`        | `string` | Width of an individual cell as a percentage.                       |
| `startDateLabelId` | `string` | ARIA ID for the start date label.                                  |
| `endDateLabelId`   | `string` | ARIA ID for the end date label.                                    |

---

### **Lifecycle Hooks**
| Name                 | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| `ngOnChanges`        | Handles changes to input properties, updating offsets, padding, or width.  |
| `ngAfterViewChecked` | Focuses the active cell if necessary after the view is updated.            |
| `ngOnDestroy`        | Removes all event listeners when the component is destroyed.               |

---

### **Public Methods**
| Name                                | Description                                                                 |
|-------------------------------------|-----------------------------------------------------------------------------|
| `cellClicked(cell, event)`          | Handles cell clicks and emits the selected value if the cell is enabled.    |
| `emitActiveDateChange(cell, event)` | Emits `activeDateChange` when a cell gains focus and is enabled.            |
| `isSelected(value)`                 | Determines if a cell is selected.                                           |
| `isActiveCell(rowIndex, colIndex)`  | Checks if a cell is the active cell.                                        |
| `focusActiveCell(movePreview)`      | Focuses on the currently active cell.                                       |
| `scheduleFocusActiveCellAfterViewChecked()` | Schedules focusing the active cell after view updates.            |
| `isRangeStart(value)`               | Determines if a cell is the start of the main range.                        |
| `isRangeEnd(value)`                 | Determines if a cell is the end of the main range.                          |
| `isCellInRange(value)`              | Checks if a cell is within the selected range.                              |
| `isPreviewStart(value)`             | Determines if a cell is the start of the preview range.                     |
| `isPreviewEnd(value)`               | Determines if a cell is the end of the preview range.                       |
| `isInPreview(value)`                | Checks if a cell is within the preview range.                               |
| `getDescribedby(value)`             | Returns ARIA description IDs for a cell in a range.                         |

---

### **Private Methods**
| Name                                  | Description                                                                 |
|---------------------------------------|-----------------------------------------------------------------------------|
| `enterHandler(event)`                 | Handles when the user enters a cell (hover or focus) during range selection.|
| `leaveHandler(event)`                 | Handles when the user leaves a cell during range selection.                 |
| `mousedownHandler(event)`             | Starts a drag sequence on mouse/touch down.                                 |
| `mouseupHandler(event)`               | Ends a drag sequence on mouse/touch up.                                     |
| `touchmoveHandler(event)`             | Handles touch move events for drag previews.                                |
| `getCellFromElement(element)`         | Returns the `CalendarCell` corresponding to a DOM element.                  |
| `getCellElement(element)`             | Retrieves the DOM cell element containing a given element.                  |
| `isTableCell(node)`                   | Checks if a DOM node is a table cell.                                       |
| `isStart(value, start, end)`          | Checks if a value is the start of a range.                                  |
| `isEnd(value, start, end)`            | Checks if a value is the end of a range.                                    |
| `isInRange(value, start, end, rangeEnabled)` | Checks if a value is within a range.                                |
| `getActualTouchTarget(event)`         | Finds the element at the touch location for touch events.                   |

---

### **Usage Notes**
- **Accessibility**: Provides ARIA attributes for start and end dates in ranges, ensuring compatibility with screen readers.
- **Customizability**: Cell aspect ratios, padding, and column counts can be customized via inputs.
- **Drag Support**: Allows for range selection via drag-and-drop with touch or mouse.

---

# **Connecting the Datepicker**
```html
<div [formGroup]="formGroup">
  <ipi-datepicker
    [options]="{
      label: 'Choose a date',
      formControlName: 'dateControl',
      formGroup: formGroup
    }">
  </ipi-datepicker>
</div>
```

### **Date Range Selection**
```html
<div [formGroup]="formGroup">
  <ipi-datepicker
    [options]="{
      label: 'Select Date Range',
      formControlName: { start: 'startDate', end: 'endDate' },
      formGroup: formGroup
    }">
  </ipi-datepicker>
</div>
```

---

## **Customization**

### **1. Custom Validation**
To restrict date selection based on custom logic, use the validation options:
```typescript
options = {
  min: new Date(2023, 0, 1),
  max: new Date(2024, 11, 31),
  errors: {
    customError: 'Custom validation error message',
  },
};
```

### **2. Customizing CSS Variables**  
   The datepicker allows developers to override the default styles using CSS variables. These variables control various aspects of the component's appearance, such as colors, borders, and spacing. A full list of customizable CSS variables is provided in the documentation, enabling precise theming and styling adjustments.

---

## **Keyboard Interaction**

| Key Combination      | Action                       |
|-----------------------|------------------------------|
| **Arrow Keys**        | Navigate days/months/years   |
| **Enter**             | Select the current item      |
| **Escape**            | Close the calendar           |
| **Home/End**          | Navigate to first/last item  |



## **Input Communication**

```markdown
### Example with a Single Date

Here’s an example of binding a single date:

**Template (HTML):**
```html
<form [formGroup]="datePickerForm">
  <ipi-datepicker [options]="singleDateOptions"></ipi-datepicker>
</form>
```

**Component (TypeScript):**
```typescript
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-single-date-picker',
  templateUrl: './single-date-picker.component.html',
})
export class SingleDatePickerComponent {
  public datePickerForm = this.formBuilder.group({
    singleDate: ['', [Validators.required]], // Bind to the form control 'singleDate'
  });

  public singleDateOptions = {
    label: 'Pick a single date',
    formGroup: this.datePickerForm, // Reference to the FormGroup
    formControlName: 'singleDate',  // Control name for this input
    min: new Date(2000, 1, 1),      // Minimum selectable date
    max: new Date(2025, 1, 1),      // Maximum selectable date
    errors: {
      required: 'This field is required',
    },
  };

  constructor(private formBuilder: FormBuilder) {}
}
```

When a date is selected in the datepicker, the `singleDate` form control's value is automatically updated. Similarly, if the `singleDate` value is changed programmatically, the datepicker reflects the new date.

---

### Example with a Date Range

The datepicker also supports date range selection by binding to two form controls: one for the start date and another for the end date.

**Template (HTML):**
```html
<form [formGroup]="datePickerForm">
  <ipi-datepicker [options]="rangeDateOptions"></ipi-datepicker>
</form>
```

**Component (TypeScript):**
```typescript
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-range-date-picker',
  templateUrl: './range-date-picker.component.html',
})
export class RangeDatePickerComponent {
  public datePickerForm = this.formBuilder.group({
    fromRange: ['', [Validators.required]], // Bind to the 'fromRange' control
    toRange: ['', [Validators.required]],   // Bind to the 'toRange' control
  });

  public rangeDateOptions = {
    label: 'Pick a date range',
    formGroup: this.datePickerForm,          // Reference to the FormGroup
    formControlName: new RangeFormControls(  // Special class for range controls
      'fromRange',
      'toRange'
    ),
    min: new Date(2000, 1, 1),               // Minimum date
    max: new Date(2025, 1, 1),               // Maximum date
    errors: {
      required: 'Both dates are required',
    },
  };

  constructor(private formBuilder: FormBuilder) {}
}
```

In this example, the `fromRange` and `toRange` form controls are automatically updated when the user selects a date range. Similarly, programmatic updates to these controls are reflected in the datepicker.

---

### Key Features of Two-Way Binding

- **Real-Time Sync:** The datepicker and form controls stay in sync at all times.
- **Validation:** Validation messages are displayed dynamically based on the `errors` object provided in the options.
- **Custom Date Logic:** You can define custom minimum and maximum dates or add your own validation rules.

This integration ensures a smooth and reactive user experience, reducing boilerplate code and enhancing maintainability.
```