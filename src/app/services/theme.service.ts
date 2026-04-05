import { Injectable, signal } from '@angular/core';

export type Theme = 'default' | 'dark' | 'warm' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private themeSignal = signal<Theme>(this.loadTheme());

  theme = this.themeSignal.asReadonly();

  setTheme(theme: Theme) {
    this.themeSignal.set(theme);
    localStorage.setItem('gallery-theme', theme);
    this.applyTheme(theme);
  }

  init() {
    this.applyTheme(this.themeSignal());
  }

  private loadTheme(): Theme {
    return (localStorage.getItem('gallery-theme') as Theme) || 'default';
  }

  private applyTheme(theme: Theme) {
    if (theme === 'default') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }
}
