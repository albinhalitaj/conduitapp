import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import { App } from './app/app.component';

if (environment.production) {
  enableProdMode();
}

App.bootstrap();
