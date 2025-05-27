import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'login',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'admin',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'product/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      // For now, return an empty array since we don't know the product IDs in advance
      // This will prevent prerendering of product pages
      return [];
    }
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
