import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

export const CartAnimation = trigger('cartAnimation', [
  transition(':enter', [
    style({ transform: 'translateX(100%)', opacity: 0 }),
    animate('0.4s cubic-bezier(0.16, 1, 0.3, 1)', 
      style({ transform: 'translateX(0)', opacity: 1 }))
  ]),
  transition(':leave', [
    animate('0.3s cubic-bezier(0.16, 1, 0.3, 1)', 
      style({ transform: 'translateX(100%)', opacity: 0 }))
  ])
]);

export const CartItemAnimation = trigger('cartItemAnimation', [
  transition(':enter', [
    style({ transform: 'translateY(20px)', opacity: 0 }),
    animate('0.4s cubic-bezier(0.16, 1, 0.3, 1)', 
      style({ transform: 'translateY(0)', opacity: 1 }))
  ]),
  transition(':leave', [
    animate('0.3s cubic-bezier(0.16, 1, 0.3, 1)', 
      style({ transform: 'translateY(-20px)', opacity: 0 }))
  ])
]); 