import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

// Añade esto justo antes del bootstrap
const initializeApp = () => {
  const library = new FaIconLibrary();
  library.addIconPacks(fas); // Añade todos los íconos sólidos
  return library;
};

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...appConfig.providers,
    { provide: FaIconLibrary, useFactory: initializeApp }, provideAnimationsAsync()
  ]
}).catch(err => console.error(err));