import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';

import { UserRole } from './models/user.model';

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
        loadComponent: () => import('./components/admin/product-fetcher/product-fetcher.component').then(m => m.ProductFetcherComponent)
      },
      {
        path: 'login',
        loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
        title: 'Login',
        data: { pageName: 'Login' }
      },
  { path: '**', redirectTo: '' }
];
