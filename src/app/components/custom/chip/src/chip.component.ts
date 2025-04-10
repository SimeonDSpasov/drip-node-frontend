import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ipi-chip',
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.css'],
})

export class IpiChipComponent {

  @Input() closeIcon = false;

  @Output() closeChange = new EventEmitter<void>();

}
