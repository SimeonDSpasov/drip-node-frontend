import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Subject, throttleTime } from 'rxjs';

import { IpiImageComponent } from '@ipi-soft/ng-components/image';

export interface IpiButtonOptions {
  iconLeft?: string;
  iconRight?: string;
  throttleTimeMs?: number;
}

const defaultOptions: IpiButtonOptions = {
  throttleTimeMs: 300,
}

@Component({
  selector: 'ipi-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css'],
  imports: [
    CommonModule,
    RouterModule,
    IpiImageComponent,
  ],
})

export class IpiButtonComponent {

  @Input() link: string | null = null;
  @Input() state: any | null = null;

  @Input() options!: IpiButtonOptions;

  @Input() ariaLabel: string = 'Button';

  @Output() focusChange = new EventEmitter<FocusEvent>();
  @Output() clickChange = new EventEmitter<KeyboardEvent | PointerEvent | MouseEvent>();

  private clickSubject = new Subject<KeyboardEvent | PointerEvent | MouseEvent>();

  constructor() { }

  public ngAfterViewInit(): void {
    this.options = { ...defaultOptions, ...this.options };

    this.clickSubject
      .pipe(throttleTime(this.options.throttleTimeMs!))
      .subscribe(event => this.clickChange.emit(event));
  }

  public onClick(event: KeyboardEvent | PointerEvent | MouseEvent): void {
    this.clickSubject.next(event);
  }

  public onFocusChange(event: FocusEvent): void {
    this.focusChange.emit(event);
  }

  public handleKeydown(event: KeyboardEvent): void {
    if (event.code === 'Enter' || event.code === 'Space') {
      event.preventDefault();

      this.onClick(event);
    }
  }

}
