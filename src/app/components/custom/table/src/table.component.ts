import { Component, ViewChildren, QueryList, ViewChild, ElementRef, Input, Output, EventEmitter, ChangeDetectorRef, HostListener, SimpleChanges } from '@angular/core';
import { NgTemplateOutlet, NgStyle, NgClass, DecimalPipe, formatDate } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { IpiChipComponent } from '@ipi-soft/ng-components/chip';
import { IpiImageComponent } from '@ipi-soft/ng-components/image';
import { IpiCheckboxComponent } from '@ipi-soft/ng-components/checkbox';
import { IpiSelectComponent, IpiSelectOptions } from '@ipi-soft/ng-components/select';

import { OSService, MobileOS } from '@ipi-soft/ng-components/services';

import { IpiTooltipDirective, TooltipPosition } from '@ipi-soft/ng-components/tooltip';

export interface IpiTableColumn {
  label?: string;
  value?: string;
  type?: IpiTableColumnType;
  width?: string;
  editable?: boolean;
  prefix?: string;
  suffix?: string;
  singleActions?: Action[];
  multipleActions?: Action[];
  dateFormat?: IpiDateFormatOptions;
  chipLabel?: { [key: string]: string };
  class?: string | { [key: string]: string };
}

export enum IpiTableColumnType {
  Text,
  Date,
  Currency,
  Chip,
  Number,
  NumberMath,
  Actions,
  Checkbox,
}

export type ActionShowType = Array<{ property: string; values: any[]; exists?: boolean; }> 

export interface Action {
  icon: string;
  label: string;
  class?: string;
  showOn?: ActionShowType;
  disabled?: boolean;
  execute?: (row: any) => void;
}

export interface IpiTableChange {
  from: number;
  to: number;
  filter?: string;
  sort?: any;
}

export interface IpiDateFormatOptions {
  format: string;
  locale: string;
  timezone?: string;
}

interface PageFormControls {
  pageSize: FormControl<{ label: string, value: number }>;
}

@Component({
  standalone: true,
  selector: 'ipi-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
  imports: [
    NgStyle,
    NgClass,
    DecimalPipe,
    NgTemplateOutlet,
    IpiChipComponent,
    IpiImageComponent,
    IpiSelectComponent,
    IpiTooltipDirective,
    IpiCheckboxComponent,
  ]
})

export class IpiTableComponent {

  constructor(
    private osService: OSService,
    private formBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef) {
      changeDetectorRef.detach();
  }

  @ViewChild('dropdownElement') DropdownElement: ElementRef<any> | null = null;

  @ViewChildren('moreActionsList') moreActionsList!: QueryList<ElementRef>;

  @Input() data!: any[];
  @Input() dataLength!: number;
  @Input() serverSide!: boolean;
  @Input() isLoading!: boolean;
  @Input() columns!: IpiTableColumn[];

  @Input() filter!: string;

  @Input() sortIndex = 0;
  @Input() sortable = true;
  @Input() sortDirection: 'asc' | 'desc' = 'asc';

  @Input() pageSize = 10;
  @Input() currentPage = 0;
  @Input() pageable = false;
  @Input() pageSizeOptions = [ 10, 25, 50, 100, 1000 ];

  @Output() tableChange = new EventEmitter<IpiTableChange>()

  public tooltipPosition = TooltipPosition;

  public TableColumnType = IpiTableColumnType;

  public totalPages!: number;
  public visibleRange!: string;

  public filteredData!: any[];

  public pageSizeSelectOptions!: IpiSelectOptions;

  public currentActiveRow: any;
  public isDropdown: boolean = false;

  public formGroup!: FormGroup<PageFormControls>;

  private _dataLength!: number;

  @HostListener('document:click', ['$event'])
  public onClick(event: any): void {
    // TO DO: When two tables exists the dropdown from first table is not closed
    if (event.target !== this.DropdownElement?.nativeElement && event.target) {
      if (this.currentActiveRow) {
        this.currentActiveRow.isDropdown = false;
      }

      this.changeDetectorRef.detectChanges();
    }
  }

  @HostListener('document:scroll', ['$event'])
  public onScroll(): void {

    for (let item of this.moreActionsList) {
      if (item.nativeElement.classList.contains('opened') && this.DropdownElement) {
        let actionPos = item.nativeElement.getBoundingClientRect();

        if (this.osService.mobileOS === MobileOS.iOS) {
          actionPos.y += window.visualViewport!.offsetTop;
        }

        this.DropdownElement.nativeElement.style.top = `${ actionPos.y + actionPos.height }px`;

        break;
      }
    }
  }

  @HostListener('window:resize')
  public onResize(): void {

    for (let item of this.moreActionsList) {
      if (item.nativeElement.classList.contains('opened') && this.DropdownElement) { 
        let actionPos = item.nativeElement.getBoundingClientRect();

        if (this.osService.mobileOS === MobileOS.iOS) {
          actionPos.x += window.visualViewport!.offsetLeft;
        }

        const dropdownWidth = this.DropdownElement.nativeElement.offsetWidth;

        const left = actionPos.x + dropdownWidth / 2 < window.innerWidth - 10 ? actionPos.x : window.innerWidth - 10 - dropdownWidth;
  
        this.DropdownElement.nativeElement.style.transform = left === actionPos.x ? 'translateX(-50%)' : '';
        this.DropdownElement.nativeElement.style.left = left  + 'px';

        break;
      }
    }
  }

  public ngAfterViewInit(): void {
    const from = this.currentPage * this.pageSize;
    const to = from + this.pageSize;

    if (this.serverSide && !this.data) {
      this.tableChange.emit({ from, to, sort: { columnValue: this.columns[this.sortIndex].value, sortDirection: this.sortDirection } });
    }

    if (!this.serverSide) {
      this.buildPaginationSelectDependecies();
    }
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['isLoading'] && changes['isLoading'].currentValue === false) {
      if (this.data) {
        this._dataLength = this.data.length;
      }
    }

    if (changes['data'] && changes['data'].currentValue) {
      if (this.serverSide) {
        this.filteredData = this.data;

        this.preprocessData();
      } else {
        this.filteredData = this.filter ? this.filterData() : this.data;

        this.preprocessData();

        setTimeout(() => {
          this.sortColumn(this.columns[this.sortIndex], false);
        })
      }

      this._dataLength = this.dataLength ? this.dataLength : this.filteredData.length;
    }

    if (changes['filter'] && !changes['filter'].firstChange) {
      // The two ways of filtering data -> local and serverSide
      if (!this.serverSide) {
        this.filteredData = this.filterData();
        this._dataLength = this.filteredData.length;

        setTimeout(() => {
          this.goToFirstPage();
        });

      } else {
        setTimeout(() => {
          this.currentPage = 0;

          this.tableChange.emit({ from: 0, to: 0 + this.pageSize, filter: this.filter, sort: { columnValue: this.columns[this.sortIndex].value, sortDirection: this.sortDirection } });
        });
      }

    }

    if (changes['pageable'] && changes['pageable'].currentValue !== undefined) {
      this.buildPaginationSelectDependecies();
    }

    const from = this.currentPage * this.pageSize;
    const to = Math.min(this._dataLength, from + this.pageSize);
  
    this.calculateTotalPages();
    this.updateVisibleRange(from, to);

    this.changeDetectorRef.detectChanges();
  }

  public getPageData(): any[] {
    if (!this.filteredData) {
      return [];
    }

    if (!this.pageable) {
      return this.filteredData;
    }

    if (!this.serverSide) {
      const start = this.currentPage * this.pageSize;
      const end = start + this.pageSize;

      return this.filteredData.slice(start, end);
    }

    return this.filteredData;
  }

  public updateVisibleRange(start: number, end: number): void {
    this.visibleRange = `Showing ${ start + 1 } to ${end} of ${this._dataLength} results`;

    this.changeDetectorRef.detectChanges();
  }

  public calculateTotalPages(): void {
    this.totalPages =  Math.ceil(this._dataLength / this.pageSize);
  }

  public goToPage(page: number): void {
    this.currentPage = page;
    this.calculatePages();
  }

  public goToPreviousPage(): void {
    this.currentPage--;
    this.calculatePages();
  }

  public goToNextPage(): void {
    this.currentPage++;
    this.calculatePages();
  }

  public goToFirstPage(): void {
    this.currentPage = 0;
    this.calculatePages();
  }

  public goToLastPage(): void {
    this.currentPage = this.totalPages - 1;
    this.calculatePages();
  }

  public cellEdit(event: KeyboardEvent, column: string, currentPageRowIndex: number): void {
    const dataIndex = currentPageRowIndex + (this.currentPage * this.pageSize);

    if (column.indexOf('.') === -1) {
      this.filteredData[dataIndex][column] = (event.target as HTMLDivElement).innerText;
    } else { // Nested properties
      let data = this.filteredData[dataIndex];
      const fullPath = column.split('.');

      for (let i = 0; i < fullPath.length; i++) {
        if (i < fullPath.length - 1) {
          data = data[fullPath[i]];
        } else {
          data[fullPath[i]] = (event.target as HTMLDivElement).innerText;
        }
      }
    }
  }

  public formatDate(dateAsString: string, formatDateOptions: IpiDateFormatOptions = { format: 'shortDate', locale: 'en-US', timezone: undefined }): string {
    return formatDate(dateAsString, formatDateOptions.format, formatDateOptions.locale, formatDateOptions.timezone);
  }

  public getClass(row: any, column: IpiTableColumn): { [key: string]: boolean } | string {
    if (!column.class) {
      return '';
    }

    if (typeof column.class === 'string') {
      return column.class;
    }

    return {
      [column.class[this.getDescendantProp(row, column)]]: true
    };
  }

  public getDescendantProp(row: any, column: IpiTableColumn): any {
    if (!column.value || column.value === null) {
      return column.label;
    }

    // Case only on preprocessing - returns any numbers that have been passed in the column.value string
    if (isFinite(Number(column.value))) {
      return parseFloat(column.value);
    }

    if (column.type === this.TableColumnType.NumberMath) {
      return row[column.value];
    }

    return column.value.split('.')
      .reduce((prev: any, curr: string) => {
        if (prev && curr in prev) {
          return prev[curr];
        } else {
          return undefined;
        }
      }, row);
  }

  public getChipLabel(row: any, column: IpiTableColumn): string {
    if (!column.chipLabel) {
      return column.label ? column.label : this.getDescendantProp(row, column);
    }

    return column.chipLabel[this.getDescendantProp(row, column)];
  }

  public getCheckboxState(row: any, column: IpiTableColumn): boolean {
    let state = this.getDescendantProp(row, column);

    if (typeof state !== 'boolean') {
      return false;
    }

    return state;
  }

  public handleActionShow(action: Action, row: any, column?: IpiTableColumn): boolean {
    if (!action.showOn || action.showOn.length === 0) {
        return true;
    }

    return action.showOn.every((condition) => {
      const rowValue = this.getDescendantProp(row, { value: condition.property });

      const ifValueExists = !!rowValue;
  
      if (condition.exists != null && condition.exists === ifValueExists) {
        return ifValueExists;
      }

      return condition.values.includes(rowValue);
    });
  }

  public sortColumn(column: any, changeSortDirection = true): void {
    if (!this.sortable) {
      return;
    }

    if (!column.value) {
      return;
    }

    if (changeSortDirection) {

      if (this.sortIndex == this.columns.indexOf(column)) {
        switch (this.sortDirection) {
          case 'asc':
            this.sortDirection = 'desc';
            break;
          case 'desc':
            this.sortDirection = 'asc';
            break;
          default:
            this.sortDirection = 'asc';
            break;
        }
      } else {
        this.sortDirection = 'asc';
        this.sortIndex = this.columns.indexOf(column);
      }

    }

    if (this.serverSide) {
      this.currentPage = 0;

      const start = this.currentPage * this.pageSize;
      const end = Math.min(this._dataLength, start + this.pageSize);

      this.tableChange.emit({ from: start, to: end, filter: this.filter, sort: { columnValue: this.columns[this.sortIndex].value, sortDirection: this.sortDirection } });
    } else {
      this.goToFirstPage();

      this.sortData(this.filteredData, column);
    }

    if (this.currentActiveRow) {
      this.currentActiveRow.isDropdown = false;
    }

    this.changeDetectorRef.detectChanges();
  }

  public async toggleActionDropdown(row: any, event: any): Promise<void> {
    // Prevent the event to be processed by the Hostlistener
    event.stopPropagation();

    let actionPos!: DOMRect;

    if (this.currentActiveRow) {
      this.currentActiveRow.isDropdown = false;
    }

    row.isDropdown = !row.isDropdown;

    this.currentActiveRow = row;

    this.changeDetectorRef.detectChanges();

    for (let i of this.moreActionsList) {
      if (i.nativeElement.classList.contains('opened')) {
        actionPos = i.nativeElement.getBoundingClientRect();
      }
    }

    if(this.DropdownElement) {
      if (this.osService.mobileOS === MobileOS.iOS) {
        actionPos.y += window.visualViewport!.offsetTop;
        actionPos.x += window.visualViewport!.offsetLeft;
      }

      const dropdownWidth = this.DropdownElement.nativeElement.offsetWidth;

      const left = actionPos.x + dropdownWidth / 2 < window.innerWidth - 10 ? actionPos.x : window.innerWidth - 10 - dropdownWidth;

      this.DropdownElement.nativeElement.style.transform = left === actionPos.x ? 'translateX(-50%)' : '';
      this.DropdownElement.nativeElement.style.left = left + 'px';
      this.DropdownElement.nativeElement.style.top = `${ actionPos.y + actionPos.height }px`;
    }
  }

  private preprocessData(): void {
    if (!this.data || this.data.length === 0) {
      return;
    }

    this.columns.forEach(column => {
      if (!column.value || column.type !== this.TableColumnType.NumberMath) {
        return;
      }

      this.data.forEach(row => {
        const result = this.calculateNumberMathCell(row, column);
        row[column.value as any] = result;
      });
    });
  }

  private calculateNumberMathCell(row: any, column: any): any {
    const expression = column.value.replace(
      /([a-zA-Z_][a-zA-Z0-9_.]*|\d*\.?\d+)/g,
      (match: any) => {
        let value = this.getDescendantProp(row, { value: match });

        return (typeof value === 'number') ? value : parseFloat(value) || 0;
      }
    );

    let fn = new Function(`return ${expression};`);
    let result = fn();

    if (Number.isFinite(result)) {
      return result;
    }

    return this.getDescendantProp(row, column);
  }

  private filterData(): any[] {
    if (!this.data || this.data.length === 0) {
      return [];
    }

    let arrayToReturn: any[] = [ ];

    for (let row of this.data) {
      for (let column of this.columns) {
        if (!column.value) { continue; }

        let access = row[column.value];

        if (column.value.indexOf('.') !== -1 && column.type !== this.TableColumnType.NumberMath) {
          access = this.getAccessIfColumnValueIsObject(row, column);
        }

        if (access === undefined) {
          break;
        }

        const rowPropAsString = JSON.stringify(access).toLowerCase();

        if (rowPropAsString.includes(this.filter.toLowerCase())) {
          arrayToReturn.push(row);

          break;
        }
      }
    }

    return arrayToReturn;
  }

  private sortData(data: any[], column: IpiTableColumn): any[] {
    if (!data || data.length === 0 || !Array.isArray(data)) {
      return [];
    }

    if (column) {
      this.sortByProperty(data, column);
    }

    return data;
  }

  private sortByProperty(arr: any, column: any): number | void {
    if (this.sortDirection === 'desc') {
      this.sortReverse(arr, column);
      return;
    }

    return arr.sort((a: any, b: any) => {
      let valueA = a[column.value];
      let valueB = b[column.value];

      let access = column.value;

      if (access.indexOf('.') !== -1 && column.type !== this.TableColumnType.NumberMath) {
        valueA = this.getAccessIfColumnValueIsObject(a, column);
        valueB = this.getAccessIfColumnValueIsObject(b, column);
      } else {
        if (typeof valueA === 'string' && valueB !== undefined) {
          valueA = valueA.toLowerCase();
          valueB = valueB.toLowerCase();
        }
      }

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return valueA - valueB;
      }
  
      if (!valueA && valueB) return -1;
      if (valueA && !valueB) return 1;

      if (!valueA && !valueB) return 0;

      if (valueA < valueB) return -1;
      if (valueA > valueB) return 1;

      return 0;
    });
  }

  private sortReverse(arr: any, column: any) {
    return arr.sort((a: any, b: any) => {
      let valueA = a[column.value];
      let valueB = b[column.value];

      let access = column.value;

      if (access.indexOf('.') !== -1 && column.type !== this.TableColumnType.NumberMath) {
        valueA = this.getAccessIfColumnValueIsObject(a, column);
        valueB = this.getAccessIfColumnValueIsObject(b, column);
      } else {
        if (typeof valueA === 'string' && valueB !== undefined) {
          valueA = valueA.toLowerCase();
          valueB = valueB.toLowerCase();
        }
      }

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return valueB - valueA;
      }

      if (!valueA && valueB) return 1;
      if (valueA && !valueB) return -1;

      if (!valueA && !valueB) return 0;

      if (valueA < valueB) return 1;
      if (valueA > valueB) return -1;

      return 0;
    });
  }

  private getAccessIfColumnValueIsObject(row: any, column: IpiTableColumn): any {
    if (!column.value || column.value === null) {
      return undefined;
    }

    const keys = column.value.split('.');

    let access = row[keys[0]];

    for (let i = 1; i < keys.length; i++) {
      if (access && keys[i] in access) {
        access = access[keys[i]];
      } else {
        return undefined;
      }
    }

    return access;
  }

  private buildPaginationSelectDependecies(): void {
    const formControls: PageFormControls = {
      pageSize: this.formBuilder.control({ label: this.pageSize.toString(), value: this.pageSize }, { nonNullable: true, validators: [ Validators.required ] })
    };

    this.formGroup = this.formBuilder.group(formControls);

    const selectData = this.pageSizeOptions.map(item => ({
      label: item.toString(),
      value: item
    }));

    this.pageSizeSelectOptions = {
      label: '',
      data: selectData,
      formGroup: this.formGroup,
      formControlName: 'pageSize'
    };

    this.subscribeToFormValueChanges();
  }

  private subscribeToFormValueChanges(): void {
    this.formGroup.controls.pageSize.valueChanges.subscribe((value) => {
      if (this.pageSize === value.value) {
        return;
      }

      const currentPageFirstRowIndex = this.currentPage * this.pageSize;
      this.pageSize = value.value;

      this.currentPage = Math.floor(currentPageFirstRowIndex / this.pageSize);

      const start = this.currentPage * this.pageSize;
      const end = Math.min(this._dataLength, start + this.pageSize);

      if (this.serverSide) {
        this.tableChange.emit({ from: start, to: end, filter: this.filter, sort: { columnValue: this.columns[this.sortIndex].value, sortDirection: this.sortDirection } });
      }

      this.calculateTotalPages();
      this.updateVisibleRange(start, end);

      setTimeout(() => {
        this.changeDetectorRef.detectChanges();
      });
    });
  }

  private calculatePages(): void {
    const start = this.currentPage * this.pageSize;
    const end = Math.min(this._dataLength, start + this.pageSize);

    if (!this.serverSide) {
      this.updateVisibleRange(start, end);
    } else {
      this.tableChange.emit({ from: start, to: end, filter: this.filter, sort: { columnValue: this.columns[this.sortIndex].value, sortDirection: this.sortDirection } });
    }

    this.changeDetectorRef.detectChanges();
  }
}
