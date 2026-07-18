import { type ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import type { ServerRoute } from '@angular/ssr';
import { provideServerRendering, RenderMode, withRoutes } from '@angular/ssr';

import { appConfig } from './app.config';

const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];

const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(withRoutes(serverRoutes))],
};

export const appServerConfig = mergeApplicationConfig(appConfig, serverConfig);
