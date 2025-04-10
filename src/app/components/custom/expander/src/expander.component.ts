import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { animate, state, style, transition, trigger } from '@angular/animations';

const OpenCloseAnimation = trigger('openCloseAnimation', [
  state('true', style({
      height: '{{ height }}',
      paddingBottom: '20px',
    }),
    { params: { height: '*' }},
  ),
  state('false', style({
      height: '0px',
      paddingBottom: '0px',
    }),
  ),
  transition('false <=> true', animate('0.25s cubic-bezier(0.4, 0, 0.1, 1)')),
]);

@Component({
  selector: 'ipi-expander',
  templateUrl: './expander.component.html',
  styleUrls: ['./expander.component.css'],
  animations: [OpenCloseAnimation],
  imports: [
    NgClass,
  ],
})

export class IpiExpanderComponent {

  @Input() isOpen = false;
  @Input() maxHeight: number | null = null;

}
