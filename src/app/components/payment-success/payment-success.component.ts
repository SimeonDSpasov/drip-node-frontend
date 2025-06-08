import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IpiButtonComponent } from '../custom/button';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css'],
  standalone: true,
  imports: [CommonModule, IpiButtonComponent]
})
export class PaymentSuccessComponent implements OnInit {
  orderId: string = '';
  email: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.orderId = params['orderId'] || '';
      this.email = params['email'] || '';
    });
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
} 