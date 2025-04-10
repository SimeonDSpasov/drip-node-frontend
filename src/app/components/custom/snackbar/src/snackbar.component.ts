import { NgClass } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

import { IpiImageComponent } from '@ipi-soft/ng-components/image';

export enum verticalPosition {
  Bottom,
  Top
}

export enum horizontalPosition {
  Left,
  Center,
  Right
}

export interface IpiSnackbarOptions {
  icon?: string;
  error?: boolean;
  animationDuration: number;
  backgroundColor?: string;
  errorBackgroundColor?: string;
  placeholderTextColor?: string;
  messageTextColor?: string;
  progressColor?: string;
  xIconColor?: string;
}

export interface SnackbarPosition {
  horizontalPosition?: horizontalPosition;
  verticalPosition?: verticalPosition;
}

@Component({
  selector: 'ipi-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.css'],
  imports: [
    NgClass,
    IpiImageComponent,
  ]
})

export class IpiSnackbarComponent {
  @Input() message!: String;
  @Input() options!: IpiSnackbarOptions;

  @Input() positionOptions!: SnackbarPosition;

  @Output() closed = new EventEmitter<void>();
}
