import { trigger, transition, group, query, style, animate } from '@angular/animations';

const mainDuration = 250;
const rowsEnterDuration = 350;
const rowsLeaveDuration = 150;

export const NavigationMobileAnimation = trigger(
  'NavigationMobileAnimation', [
    transition(':enter', [
      group([
        query('div', [
          style({ opacity: '0' }),
          animate(rowsEnterDuration, style({ opacity: '1' }))
        ]),
        style({ width: '0px' }),
        animate(mainDuration, style({ width: '*' })) // animate to natural width set by CSS
      ])
    ]),
    transition(':leave', [
      group([
        query('div', [
          animate(rowsLeaveDuration, style({ opacity: '0' }))
        ]),
        animate(mainDuration, style({ width: '0px' }))
      ])
    ])
  ]
);
