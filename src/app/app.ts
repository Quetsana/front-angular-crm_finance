import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class App implements OnInit {
  private translate = inject(TranslateService);
  private themeService = inject(ThemeService);
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    this.translate.addLangs(['en', 'es']);
    this.translate.setFallbackLang('en');

    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('qf_lang') ?? 'en';
      this.translate.use(saved);
    }
  }
}
