import { Component, SimpleChanges, ViewChild, ElementRef, ChangeDetectorRef, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormGroup, AbstractControl } from '@angular/forms';

import { Subscription, debounceTime, fromEvent, tap } from 'rxjs';

import { IpiSelectData } from '@ipi-soft/ng-components/select';
import { IpiTooltipDirective, TooltipPosition } from '@ipi-soft/ng-components/tooltip';
import { IpiControlErrors } from '@ipi-soft/ng-components/input';

export interface IpiListBoxOptions {
  data: IpiSelectData[];
  label?: string;
  tooltip?: string;
  formGroup?: FormGroup;
  formControlName?: string;
  errors?: IpiControlErrors;
}

enum MouseDirection {
  Up,
  Down
}

interface MouseCustomData {
  hoverItemIndex: number;
  targetItemIndex: number;
  mouseDirection: MouseDirection;
}

@Component({
  selector: 'ipi-listbox',
  templateUrl: './listbox.component.html',
  styleUrls: ['./listbox.component.css'],
  imports: [
    NgClass,
    IpiTooltipDirective,
  ]
})

export class IpiListboxComponent {

  constructor (
    private elementRef: ElementRef,
    private changeDetectorRef: ChangeDetectorRef) {
      this.changeDetectorRef.detach();
  }

  @ViewChild('listbox') listbox: ElementRef<HTMLDivElement> | null = null;

  @Input() options!: IpiListBoxOptions;

  @Output() selectChange = new EventEmitter<IpiSelectData[]>();

  public tooltipPosition = TooltipPosition;

  public controlError!: string;
  public controlInvalid = false;
  public control: AbstractControl | null = null;  
  public controlSubscription: Subscription | null = null;

  private documentKeyupValue = '';
  private documentKeyupValueResetTime = 1000;
  private documentKeyDownSubscription!: Subscription;

  private isMetaHold = false;
  private isShiftHold = false;

  private lastSelectedItemIndex = 0;
  private lastSelectedItemIndexOnShiftHold = 0;

  private selectedItems!: (IpiSelectData | null)[];

  public ngOnInit(): void {
    this.control = this.getControl();
  
    this.selectedItems = new Array(this.options.data.length).fill(null);

    this.changeDetectorRef.detectChanges();
  }

  public ngAfterViewInit(): void {
    this.documentKeyDownSubscription = fromEvent<KeyboardEvent>(this.elementRef.nativeElement, 'keydown')
      .pipe(
        tap(event => { this.keydown(event) }),
        debounceTime(this.documentKeyupValueResetTime))
      .subscribe(() => { this.documentKeyupValue = '' });
  }

  public ngOnDestroy(): void {
    this.documentKeyDownSubscription.unsubscribe();

    if (this.controlSubscription) {
      this.controlSubscription?.unsubscribe();
    }
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] && changes['options'].currentValue['data'] && this.selectedItems) {
      this.selectedItems.length = 0;

      this.changeDetectorRef.detectChanges();
    }
  }

  public mousedown(targetItem: HTMLDivElement): void {
    const items = this.listbox!.nativeElement.children[0].children;

    if (this.isShiftHold) {
      const itemValue = parseInt(targetItem.getAttribute('value')!);
      const max = Math.max(itemValue, this.lastSelectedItemIndexOnShiftHold);
      const min = Math.min(itemValue, this.lastSelectedItemIndexOnShiftHold);

      const itemsToAdd = [];
      const itemsToRemove = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i] as HTMLDivElement;

        if (i >= min && i <= max) {
          item.classList.add('selected');
          itemsToAdd.push(parseInt(item.getAttribute('value')!));
        } else {
          item.classList.remove('selected');
          itemsToRemove.push(parseInt(item.getAttribute('value')!));
        }
      }

      this.removeSelectedItems(itemsToRemove);
      this.addSelectedItems(itemsToAdd);

      return;
    }

    if (this.isMetaHold) {
      const isSelected = targetItem.classList.contains('selected');

      if (isSelected) {
        targetItem.classList.remove('selected');
        this.removeSelectedItems(parseInt(targetItem.getAttribute('value')!));
      } else {
        targetItem.classList.add('selected');
        this.addSelectedItems(parseInt(targetItem.getAttribute('value')!));
      }

      return;
    }

    const mouseCustomData: MouseCustomData = {
      hoverItemIndex: 0,
      targetItemIndex: 0,
      mouseDirection: MouseDirection.Up
    };

    const itemsToRemove = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i] as HTMLDivElement;

      item.classList.remove('selected');
      itemsToRemove.push(parseInt(item.getAttribute('value')!));

      if (targetItem === item) {
        mouseCustomData.hoverItemIndex = i;
        mouseCustomData.targetItemIndex = i;
      }

      item.onmouseover = () => {
        this.mouseover(i, items, mouseCustomData);
      };
    }

    targetItem.classList.add('selected');
    this.removeSelectedItems(itemsToRemove);
    this.addSelectedItems(parseInt(targetItem.getAttribute('value')!));
  }

  @HostListener('document:mouseup', ['$event'])
  public mouseup(): void {
    const items = this.listbox!.nativeElement.children[0].children;

    for (let i = 0; i < items.length; i++) {
      (items[i] as HTMLDivElement).onmouseover = null;
    }
  }

  @HostListener('keyup', ['$event'])
  public keyup(event: KeyboardEvent): void {
    if (event.code.toLowerCase().includes('shift')) {
      this.isShiftHold = false;

      return;
    }

    if (event.code.toLowerCase().includes('meta') || event.code.toLowerCase().includes('control')) {
      this.isMetaHold = false;
    }
  }

  private mouseover(i: number, items: HTMLCollection, mouseCustomData: MouseCustomData): void {
    if (i > mouseCustomData.targetItemIndex) {
      mouseCustomData.mouseDirection = MouseDirection.Down;
    }

    if (i < mouseCustomData.targetItemIndex) {
      mouseCustomData.mouseDirection = MouseDirection.Up;
    }

    if (mouseCustomData.mouseDirection === MouseDirection.Down) {
      if (i >= mouseCustomData.hoverItemIndex) {
        this.lastSelectedItemIndex = parseInt(items[i].getAttribute('value')!);

        items[i].classList.add('selected');
        this.addSelectedItems(parseInt(items[i].getAttribute('value')!));
      } else {
        items[i + 1].classList.remove('selected');
        this.removeSelectedItems(parseInt(items[i + 1].getAttribute('value')!));
      }
    } else {
      if (i <= mouseCustomData.hoverItemIndex) {
        this.lastSelectedItemIndex = parseInt(items[i].getAttribute('value')!);

        items[i].classList.add('selected');
        this.addSelectedItems(parseInt(items[i].getAttribute('value')!));
      } else {
        items[i - 1].classList.remove('selected');
        this.removeSelectedItems(parseInt(items[i - 1].getAttribute('value')!));
      }
    }

    mouseCustomData.hoverItemIndex = i;
  }

  private keydown(event: KeyboardEvent): void {
    if ((document.activeElement !== this.listbox?.nativeElement) && (document.activeElement !== this.listbox?.nativeElement.childNodes[0])) {
      return;
    }

    if (event.code.toLowerCase().includes('shift')) {
      this.isShiftHold = true;
      this.lastSelectedItemIndexOnShiftHold = this.lastSelectedItemIndex;
    }

    if (event.code.toLowerCase().includes('meta') || event.code.toLowerCase().includes('control')) {
      this.isMetaHold = true;
    }

    if (event.code.toLowerCase().includes('arrowdown')) {
      event.preventDefault();

      this.documentArrowsKeyup(true);

      return;
    }

    if (event.code.toLowerCase().includes('arrowup')) {
      event.preventDefault();

      this.documentArrowsKeyup(false);

      return;
    }

    this.documentKeyup(event)
  }

  private documentArrowsKeyup(isDownArrow: boolean): void {
    const dataLength = this.options.data.length;

    let newIndex = isDownArrow ? this.lastSelectedItemIndex + 1 : this.lastSelectedItemIndex - 1;

    const items = this.listbox!.nativeElement.children[0].children;

    if (this.isShiftHold) {
      if (newIndex < 0 || newIndex === dataLength) {
        return;
      }

      const isSelected = items[newIndex].classList.contains('selected');

      if (isSelected) {
        const indexForDeselect = isDownArrow ? newIndex - 1 : newIndex + 1;

        items[indexForDeselect].classList.remove('selected');
        this.removeSelectedItems(parseInt(items[indexForDeselect].getAttribute('value')!));
      } else {
        items[newIndex].classList.add('selected');
        this.addSelectedItems(parseInt(items[newIndex].getAttribute('value')!));
      }

      this.lastSelectedItemIndex = newIndex;
      items[newIndex].scrollIntoView({ block: 'nearest' });

      return;
    }

    const itemsToRemove = [];

    for (let i = 0; i < items.length; i++) {
      items[i].classList.remove('selected');
      itemsToRemove.push(parseInt(items[i].getAttribute('value')!));
    }

    this.removeSelectedItems(itemsToRemove);

    newIndex = newIndex < 0 ? 0 : newIndex;
    newIndex = newIndex >= dataLength ? dataLength - 1 : newIndex;

    items[newIndex].classList.add('selected');
    items[newIndex].scrollIntoView({ block: 'nearest' });
    this.addSelectedItems(parseInt(items[newIndex].getAttribute('value')!));
  }

  private documentKeyup(event: KeyboardEvent): void {
    if (this.isMetaHold && event.key.toLowerCase() === 'a') {
      event.preventDefault();

      const items = this.listbox!.nativeElement.children[0].children;

      const itemsToAdd = [];

      for (let i = 0; i < items.length; i++) {2
        items[i].classList.add('selected');
        itemsToAdd.push(parseInt(items[i].getAttribute('value')!));
      }

      this.addSelectedItems(itemsToAdd);

      return;
    }

    this.documentKeyupValue = this.documentKeyupValue + event.key.toLowerCase();

    let newIndex: number | null = null;

    for (let i = 0; i < this.options.data.length; i++) {
      const subLabel = this.options.data[i].label.substring(0, this.documentKeyupValue.length).toLowerCase();

      if (subLabel === this.documentKeyupValue) {
        newIndex = i;

        break;
      }
    }

    if (newIndex !== null) {
      const items = this.listbox!.nativeElement.children[0].children;

      const itemsToRemove = [];

      for (let i = 0; i < items.length; i++) {
        items[i].classList.remove('selected');
        itemsToRemove.push(parseInt(items[i].getAttribute('value')!));
      }

      this.removeSelectedItems(itemsToRemove);

      items[newIndex].classList.add('selected');
      items[newIndex].scrollIntoView({ block: 'center' });
      this.addSelectedItems(parseInt(items[newIndex].getAttribute('value')!));
    }
  }

  private addSelectedItems(index: number | number[]) {
    const isIndexNumber = typeof index === 'number';

    this.lastSelectedItemIndex = isIndexNumber ? index : index.slice(-1)[0];

    if (isIndexNumber) {
      this.selectedItems[index] = this.options.data[index];
    } else {
      for (let i of index) {
        this.selectedItems[i] = this.options.data[i];
      }
    }

    if (this.control) {
      this.control.setValue(this.selectedItems.filter(value => value !== null));
    }

    this.selectChange.emit(this.selectedItems.filter(Boolean) as IpiSelectData[]);

    this.changeDetectorRef.detectChanges();
  }

  private removeSelectedItems(index: number | number[]) {
    const isIndexNumber = typeof index === 'number';

    if (isIndexNumber) {
      this.selectedItems[index] = null;
    } else {
      for (let i of index) {
        this.selectedItems[i] = null;
      }
    }

    if (this.control) {
      this.control?.setValue(this.selectedItems.filter(value => value !== null));
    }

    this.selectChange.emit(this.selectedItems.filter(Boolean) as IpiSelectData[]);

    this.changeDetectorRef.detectChanges();
  }

  private getControl(): AbstractControl | null {
    if (this.options.formGroup && this.options.formControlName) {
      this.controlSubscription = this.options.formGroup.controls[this.options.formControlName].valueChanges.subscribe(() => {
        if (!this.control) {
          return;
        }
  
        this.checkIfControlInvalid(this.control);

        this.getControlError(this.control);
      });

      return this.options.formGroup.get(this.options.formControlName);
    }
  
    return null;
  }

  private checkIfControlInvalid(control: AbstractControl): void {
    this.controlInvalid = control.invalid;
  }

  private getControlError(control: AbstractControl): void {
    this.controlError = '';

    const options = this.options!;

    if (options.errors && this.controlInvalid) {
      for (const error in options.errors) {
        if (control.hasError(error)) {
          this.controlError = options.errors[error];

          return;
        }
      }

    }
  }

}
