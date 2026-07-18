import { bootstrapApplication } from '@angular/platform-browser';
import { type BootstrapContext } from '@angular/platform-browser';

import { App } from './app/app';
import { appServerConfig } from './app/app.config.server';

const bootstrap = (context: BootstrapContext) =>
  bootstrapApplication(App, appServerConfig, context);

export default bootstrap;
