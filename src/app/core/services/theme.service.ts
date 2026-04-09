import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY = 'qf_theme';

  private _theme = signal<Theme>(this.loadTheme());
  readonly theme = this._theme.asReadonly();
  readonly isDark = signal(this._theme() === 'dark');

  constructor() {
    effect(() => {
      const t = this._theme();
      this.isDark.set(t === 'dark');
      if (isPlatformBrowser(this.platformId)) {
        document.documentElement.classList.toggle('dark', t === 'dark');
        localStorage.setItem(this.STORAGE_KEY, t);
      }
    });
  }

  private loadTheme(): Theme {
    if (!isPlatformBrowser(this.platformId)) return 'light';
    const saved = localStorage.getItem(this.STORAGE_KEY) as Theme;
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  toggle(): void {
    this._theme.set(this._theme() === 'dark' ? 'light' : 'dark');
  }

  setTheme(t: Theme): void {
    this._theme.set(t);
  }
}
