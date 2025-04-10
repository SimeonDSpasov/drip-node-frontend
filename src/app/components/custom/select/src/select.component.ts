import { 
  Component, OnInit, ViewChild, Input,
  Output, inject, PLATFORM_ID, ElementRef,
  ChangeDetectorRef, HostListener, EventEmitter,
  OnDestroy, AfterViewInit, SimpleChanges } from '@angular/core';
import { NgClass, isPlatformServer } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Subscription, debounceTime, fromEvent, tap } from 'rxjs';

import { IpiChipComponent } from '@ipi-soft/ng-components/chip';
import { IpiImageComponent } from '@ipi-soft/ng-components/image';
import { IpiCheckboxComponent } from '@ipi-soft/ng-components/checkbox';

import { OSService, MobileOS } from '@ipi-soft/ng-components/services';

import { IpiTooltipDirective, TooltipPosition } from '@ipi-soft/ng-components/tooltip';

export interface IpiSelectOptions {
  label: string;
  tooltip?: string;
  data: IpiSelectData[];
  multiple?: boolean;
  counterAsValue?: boolean;
  placeholder?: string;
  helperText?: string;
  helperRoute?: string;
  prefixImg?: string;
  suffixImg?: string;
  formGroup?: FormGroup;
  searchable?: boolean;
  formControlName?: string;
  errors?: ControlErrors;
}

export interface IpiSelectData {
  label: string;
  value: any;
  description?: string;
  isHover?: boolean;
}

export interface ControlErrors {
  [x: string]: string;
}

@Component({
  selector: 'ipi-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.css'],
  imports: [
    NgClass,
    RouterLink,
    FormsModule,
    IpiChipComponent,
    IpiImageComponent,
    IpiTooltipDirective,
    ReactiveFormsModule,
    IpiCheckboxComponent,
  ]
})

export class IpiSelectComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('input') input: ElementRef<HTMLInputElement> | null = null;

  @ViewChild('label') label: ElementRef<HTMLLabelElement> | null = null;
  @ViewChild('dropdown') dropdown: ElementRef<HTMLDivElement> | null = null;
  @ViewChild('inputWrapper') inputWrapper: ElementRef<HTMLInputElement> | null = null;

  @Input() options!: IpiSelectOptions;

  @Output() selectChange = new EventEmitter<IpiSelectData>();
  @Output() helperTextChange = new EventEmitter<void>();

  constructor(
    private osService: OSService,
    private elementRef: ElementRef,
    private changeDetectorRef: ChangeDetectorRef) {

    this.changeDetectorRef.detach();

    this.handleEvents();
  }

  public firstDropdown = 0;
  public isDropdown = false;
  public control!: AbstractControl;

  public tooltipPosition = TooltipPosition;

  private platformId = inject(PLATFORM_ID);

  private isDropdownReversed = false;

  private documentKeyupValue = '';
  private documentKeyupValueResetTime = 1000;
  private documentKeyUpSubscription: Subscription | null = null;

  public filteredData: IpiSelectData[] = [];

  private lastSearch = '';

  private keyListener = (event: KeyboardEvent) => this.blockArrowScroll(event);
  private wheelListener = (event: WheelEvent | TouchEvent) => this.blockScroll(event);

  public ngOnInit(): void {
    this.control = this.getControl()!;

    this.changeDetectorRef.detectChanges();

    if (isPlatformServer(this.platformId)) {
      return;
    }

    if (this.input) {
      this.input.nativeElement.addEventListener('focusin', () => this.activateDropdown());
      this.input.nativeElement.addEventListener('focusout', () => this.removeDropdown());
    }

    this.documentKeyUpSubscription = fromEvent<KeyboardEvent>(this.elementRef.nativeElement, 'keydown')
      .pipe(
        tap(event => { this.keyup(event) }),
        debounceTime(this.documentKeyupValueResetTime),
      )
      .subscribe(() => { this.documentKeyupValue = '' });
  }

  public ngAfterViewInit(): void {
    this.filteredData = [...this.options.data];

    if (this.options.formGroup && this.options.formControlName) {
      this.setVisibleValue(this.options.formGroup.controls[this.options.formControlName].value);
    }

    this.changeDetectorRef.detectChanges();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] && !changes['options'].firstChange) {
      this.changeDetectorRef.detectChanges();
    }
  }

  public ngOnDestroy(): void {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    window.removeEventListener('wheel', this.wheelListener);
    window.removeEventListener('keydown', this.keyListener);
    window.removeEventListener('touchmove', this.wheelListener);

    if (this.input) {
      this.input.nativeElement.removeEventListener('focusin', () => this.activateDropdown());
      this.input.nativeElement.removeEventListener('focusout', () => this.removeDropdown());
    }

    if (this.documentKeyUpSubscription) {
      this.documentKeyUpSubscription.unsubscribe();
    }
  }

  public onHelperText(): void {
    this.helperTextChange.emit();
  }

  public setValue(value: any): void {
    this.changeDetectorRef.detectChanges();

    if (!this.options.multiple) {
      value = this.removeProperty(value, 'isHover');
    }

    this.control.setValue(value);
    this.input!.nativeElement.value = value.label ? value.label : '';

    this.selectChange.emit(value);

    if (value.value == null) {
      return;
    }

    setTimeout(() => {
      this.removeDropdown();
    })
  }

  public setMultipleValue(data: any, event?: Event): void {
    if (event) {
      event.preventDefault();
    }

    const newValue = this.control.value;
    let indexOfValue = -1;

    for (let i = 0; i < newValue.length; i++) {
      if (newValue[i].value === data.value) {
        indexOfValue = i;
      }

      if (JSON.stringify(newValue[i].value) === JSON.stringify(data.value)) {
        indexOfValue = i;
      }
    }

    if (indexOfValue === -1) {
      newValue.push({ label: data.label, value: data.value });
    } else {
      newValue.splice(indexOfValue, 1);
    }

    this.lastSearch = '';
    this.input!.nativeElement.value = '';
    this.filteredData = this.options.data;

    this.control.setValue(newValue);
    this.selectChange.emit(newValue);
  }

  public setVisibleValue(newValue: any | any[]): void {
    if (newValue === null) {
      return;
    }

    if (this.options.counterAsValue) {
      if (this.options.searchable) {
        return;
      }

      if (this.showMultipleCount() > 0) {
        this.input!.nativeElement.value = this.showMultipleCount() + ' selected';
      }

      return;
    }

    let visibleValue = '';

    for (let data of this.filteredData) {  
      // when newValue is object and not array
      if (data.value === newValue.value) {
        visibleValue = data.label;

        break;
      }

      if (this.options.multiple && !this.options.searchable) {
        // when newValue is array
        for (let item of newValue) {
          if (data.value === item.value) {
            visibleValue += item.label + ', ';

            break;
          }
        }
      }

      if (newValue.value) {
        // Edge case for when we use { label, value } pattern as value
        if (newValue.value.value && this.getControl()?.value.value.value === newValue.value.value) {
          visibleValue = data.label;

          break;
        }
      }
    }

    this.changeDetectorRef.detectChanges();

    this.input!.nativeElement.value = visibleValue;
  }

  public showMultipleCount(): number {
    if (!this.control.value.length) {
      return 0;
    }

    return this.control.value.length;
  }

  public isValueSelected(value: IpiSelectData): boolean {
    if (value.value == null || this.control.value == null) {
      return false;
    }

    return value.value === this.control.value.value;
  }

  public isMultipleSelected(value: IpiSelectData): boolean {
    for (let i = 0; i < this.control.value.length; i++) {
      if (value.value === this.control.value[i]) {
        return true;
      }

      if (this.control.value[i].value === value.value) {
        return true;
      }

      if (JSON.stringify(this.control.value[i].value) === JSON.stringify(value.value)) {
        return true;
      }
    }

    return false;
  }

  public activateDropdown(): void {
    if (this.isDropdown) {
      return;
    }

    this.isDropdown = true;
    this.input!.nativeElement.focus();

    if (this.firstDropdown === 0) {
      this.firstDropdown += 1;

      setTimeout(() => this.generateDropdownPosition(true));

      // Reattaching is needed to properly update the hovered options by KeyboardEvents
      this.changeDetectorRef.reattach();
    }

    this.onSearch(this.lastSearch, false);
  }

  @HostListener('document:click', ['$event'])
  public deactivateControl(event: MouseEvent | KeyboardEvent): void {
    if (event instanceof KeyboardEvent) {
      this.removeDropdown();

      return;
    }
  
    if (this.dropdown && this.inputWrapper) {
      const dropdownRect = this.dropdown.nativeElement.getBoundingClientRect();
      const inputWrapperRect = this.inputWrapper.nativeElement.getBoundingClientRect();
  
      const isClickInsideDropdown = this.isWithinBounds(event, dropdownRect);
      const isClickInsideInputWrapper = this.isWithinBounds(event, inputWrapperRect);
  
      if (isClickInsideDropdown || isClickInsideInputWrapper) {
        return;
      }
    }
  
    this.removeDropdown();
  }

  private generateDropdownPosition(checkRevserse: boolean = false): void {
    if (!this.dropdown) {
      // method will keep executing until dropdown is rendered
      setTimeout(() => this.generateDropdownPosition(true));

      return;
    }

    const dropdownEl = this.dropdown.nativeElement!;
    const elementRefRect = this.elementRef.nativeElement.getBoundingClientRect();

    if (this.osService.mobileOS === MobileOS.iOS) {
      elementRefRect.y += window.visualViewport!.offsetTop;
      elementRefRect.x += window.visualViewport!.offsetLeft;
    }

    dropdownEl.style.left = elementRefRect.x + 'px';
    dropdownEl.style.width = elementRefRect.width + 'px';
    dropdownEl.style.top = elementRefRect.y + elementRefRect.height + 'px';

    if (checkRevserse) {
      if (window.innerHeight < dropdownEl.getBoundingClientRect().bottom) {
        dropdownEl.style.top = 'unset';
        dropdownEl.style.bottom = window.innerHeight - elementRefRect.y + 10 + 'px';
  
        this.isDropdownReversed = true;
      }
    }

    if (this.isDropdownReversed) {
      dropdownEl.style.top = 'unset';
      dropdownEl.style.bottom = window.innerHeight - elementRefRect.y + 10 + 'px';
    }

    this.changeDetectorRef.detectChanges();
  }

  public removeDropdown(): void {
    this.isDropdown = false;
    this.isDropdownReversed = false;
    this.firstDropdown = 0;
    this.changeDetectorRef.detectChanges();

    this.input!.nativeElement.blur();

    this.changeDetectorRef.detach();
  }

  public handleKeydown(event: any): void {
    if (event.code === 'Backspace') {
      this.onSearch('', true);
    }
  }

  public preventFocusChange(event: MouseEvent): void {
    if (this.input?.nativeElement === document.activeElement) {
      event.preventDefault();

      return;
    }

    this.input?.nativeElement.focus();
  }

  public onSearch(value: string, shouldResetHover?: boolean): void {
    this.lastSearch = value;

    const searchTerm = value.toLowerCase();

    if (!searchTerm) {
      // Reset to original data if input is empty
      this.filteredData = [...this.options.data];
    } else {
      this.filteredData = this.options.data.filter(item =>
        item.label.toLowerCase().includes(searchTerm)
      );
    }

    if (this.filteredData.length && shouldResetHover) {
      for (let i = 0; i < this.filteredData.length; i++) {
        this.filteredData[i].isHover = false;
      }

      this.filteredData[0].isHover = true;
    }
  }

  public getPlaceholder(): string {
    const options = this.options!;
    const formGroup = options.formGroup;
    const formControlName = options.formControlName;

    let placeholder = '';

    if (options.placeholder) {
      placeholder = options.placeholder;
    }

    if (formGroup && formControlName && options.errors && this.checkIfControlInvalid()) {
      for (const error in options.errors) {
        if (formGroup.controls[formControlName].hasError(error)) {
          placeholder = options.errors[error];
        }
      }
    }

    if ((this.control.value instanceof Array && this.control.value.length) || (this.control.value && !(this.control.value instanceof Array))) {
      return '';
    }

    return placeholder;
  }

  public checkIfControlInvalid(): boolean {
    return this.control.touched && this.control.invalid;
  }

  public checkIfControlDisabled(): boolean {
    return this.control.disabled;
  }

  private getControl(): AbstractControl | null {
    if (this.options && this.options.formGroup && this.options.formControlName) {
      return this.options.formGroup.controls[this.options.formControlName];
    }

    return null;
  }

  private isWithinBounds(event: MouseEvent, rect: DOMRect): boolean {
    return (
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom
    );
  }

  private handleEvents(): void {
    if (isPlatformServer(this.platformId)) {
      return;
    }
  
    window.addEventListener('wheel', this.wheelListener, { passive: false });
    window.addEventListener('touchmove', this.wheelListener, { passive: false });
    window.addEventListener('keydown', this.keyListener);
  }

  private keyup(event: KeyboardEvent): void {
    if (document.activeElement !== this.input?.nativeElement) {
      this.deactivateControl(event);

      return;
    }

    if (document.activeElement === this.input?.nativeElement) {
      if (document.activeElement !== this.input?.nativeElement) {
        return; 
      }

      switch (event.code) {
        case 'Enter':
          this.documentEnterKeyup(event);

          return;
        case 'Space':
          if (!this.options.searchable) {
            this.documentEnterKeyup(event);
          }

          return;
        case 'Backspace':
          if (!this.options.multiple && this.options.searchable) {
            this.onSearch('', false);

            this.setValue('');
          }

          return;
        case 'Escape':
          this.deactivateControl(event);

          return;
        case 'ArrowDown':
          this.documentArrowsKeyup(true);
  
          return;
        case 'ArrowUp':
          this.documentArrowsKeyup(false);

          return;
      }

      this.documentKeyup(event);
    }
  }

  private documentEnterKeyup(event: KeyboardEvent): void {
    for (let i = 0; i < this.filteredData.length; i++) {
      if (this.filteredData[i].isHover) {
        switch(this.options.multiple) {
          case true:
            this.setMultipleValue(this.filteredData[i], event);

            this.changeDetectorRef.detectChanges();

            return;
          default:
            this.setValue(this.filteredData[i]);

            this.removeDropdown();
        }
      }
    }
  }

  private documentArrowsKeyup(isDownArrow: boolean): void {
    if (!this.dropdown || !this.filteredData.length) {
      return;
     }

    const dataLength = this.filteredData.length;
    const controlValue = this.control.getRawValue();
    const isControlValue = controlValue && controlValue !== '';

    let hoverIndex: number | null = null;
    let valueIndex: number | null = null;

    for (let i = 0; i < dataLength; i++) {
      if (this.filteredData[i].isHover) { 
        hoverIndex = i;
      }

      if (isControlValue && this.filteredData[i].value === controlValue) { 
        valueIndex = i;
      }

      this.filteredData[i].isHover = false;
    }

    const currentIndex = hoverIndex ? hoverIndex : valueIndex ? valueIndex : 0;
    let newIndex = isDownArrow ? currentIndex + 1 : currentIndex - 1;

    newIndex = newIndex < 0 ? 0 : newIndex;
    newIndex = newIndex >= dataLength ? dataLength - 1 : newIndex;

    this.filteredData[newIndex].isHover = true;

    const element = this.dropdown.nativeElement.children[newIndex] as HTMLDivElement;
    element.scrollIntoView({ block: 'nearest' });
  }

  private documentKeyup(event: KeyboardEvent): void {
    if (!this.isDropdown || this.options.searchable) {
      return;
    }

    for (let i = 0; i < this.filteredData.length; i++) {
      this.filteredData[i].isHover = false;
    }

    this.documentKeyupValue = this.documentKeyupValue + event.key.toLowerCase();

    let newIndex: number | null = null;

    for (let i = 0; i < this.filteredData.length; i++) {
      const subLabel = this.filteredData[i].label.substring(0, this.documentKeyupValue.length).toLowerCase();

      if (subLabel === this.documentKeyupValue) {
        newIndex = i;

        break;
      }

      this.filteredData[i].isHover = false;
    }

    if (newIndex !== null) {
      this.filteredData[newIndex].isHover = true;

      const element = this.dropdown?.nativeElement.children[newIndex] as HTMLDivElement;
      element.scrollIntoView({ block: 'start' });
    }
  }

  private removeProperty(obj: IpiSelectData, propertyName: keyof IpiSelectData): Partial<IpiSelectData> {
    let { [propertyName]: removedProperty, ...data } = obj;
    return data;
  }

  private blockArrowScroll(event: any) {
    if (!this.dropdown) {
      return;
    }

    if (event.key ==='ArrowDown' || event.key ==='ArrowUp') {
      event.preventDefault();
    }
  }

  private blockScroll(event: WheelEvent | TouchEvent): void {
    if (!this.dropdown) {
      return;
    }
  
    if (this.isDescendant(this.dropdown.nativeElement, event.target as HTMLElement)) {
      if (this.dropdown.nativeElement.scrollHeight === this.dropdown.nativeElement.clientHeight) {
        event.preventDefault();
      }
      return;
    }
  
    event.preventDefault();
  }
  
  private isDescendant(parent: HTMLElement, child: HTMLElement | null): boolean {
    while (child !== null) {
      if (child === parent) {
        return true;
      }
      child = child.parentElement;
    }

    return false;
  }

}
