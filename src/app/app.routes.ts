import { Routes } from '@angular/router';


export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/products-page/products-page.component').then(m => m.ProductsPageComponent),
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
        loadComponent: () => import('./components/admin/product-fetcher/product-fetcher.component').then(m => m.ProductFetcherComponent)
      },
  { path: '**', redirectTo: '' }
];
