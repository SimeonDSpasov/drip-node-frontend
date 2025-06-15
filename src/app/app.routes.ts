import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';

import { UserRole } from './models/user.model';
import { PaymentSuccessComponent } from './components/payment-success/payment-success.component';
import { PaymentCancelComponent } from './components/payment-cancel/payment-cancel.component';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/landing/products-page.component').then(m => m.ProductsPageComponent),
        title: 'Dripnat',
        data: { pageName: 'Landing Page' },
      },
      {
        path: 'product/:id',
        loadComponent: () => import('./components/product-page/product-page.component').then(m => m.ProductPageComponent),
        title: 'Dripnat',
        data: { pageName: 'Product' },
      },
      {
        path: 'admin',
        canActivate: [ authGuard(UserRole.Admin) ],
        title: 'Admin Panel',
        data: { pageName: 'Admin Panel' },
        loadComponent: () => import('./components/admin/admin-panel/admin-panel.component').then(m => m.AdminPanelComponent),
        children: [
          {
            path: 'orders',
            loadComponent: () => import('./components/admin/orders-list/orders-list.component').then(m => m.OrdersListComponent)
          },
          {
            path: 'products',
            loadComponent: () => import('./components/admin/product-fetcher/product-fetcher.component').then(m => m.ProductFetcherComponent)
          },
          { path: '', redirectTo: 'orders', pathMatch: 'full' }
        ]
      },
      {
        path: 'login',
        loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
        title: 'Login',
        data: { pageName: 'Login' }
      },
      {
        path: 'cart',
        loadComponent: () => import('./components/cart/cart.component').then(m => m.CartComponent),
        title: 'Cart',
        data: { pageName: 'Cart' }
      },
      {
        path: 'checkout',
        loadComponent: () => import('./components/checkout/checkout.component').then(m => m.CheckoutComponent),
        title: 'Checkout',
        data: { pageName: 'Checkout' }
      },
      {
        path: 'payment/success',
        loadComponent: () => import('./components/payment-success/payment-success.component').then(m => m.PaymentSuccessComponent),
        title: 'Payment Success',
        data: { pageName: 'Payment Success' },
      },
      {
        path: 'payment/cancel',
        loadComponent: () => import('./components/payment-cancel/payment-cancel.component').then(m => m.PaymentCancelComponent),
        title: 'Payment Cancel',
        data: { pageName: 'Payment Cancel' },
      },
      {
        path: 'about-us',
        loadComponent: () => import('./components/about/about.component').then(m => m.AboutComponent),
        title: 'За нас',
        data: { pageName: 'За нас' },
      },
  { path: '**', redirectTo: '' }
];
