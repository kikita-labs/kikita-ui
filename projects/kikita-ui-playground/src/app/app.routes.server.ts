import { RenderMode, ServerRoute } from '@angular/ssr';

/** Server rendering routes for the internal Kikita UI v2 Playground. */
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
