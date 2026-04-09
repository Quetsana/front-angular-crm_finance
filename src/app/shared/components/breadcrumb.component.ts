import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { BreadcrumbItem } from '../../core/models';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  template: `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <svg class="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
      </svg>
      @for (item of items(); track item.label; let last = $last) {
        @if (!last) {
          <a class="breadcrumb-item"
            [routerLink]="item.route">
            {{ item.translateKey ? (item.translateKey | translate) : item.label }}
          </a>
          <span class="breadcrumb-sep">/</span>
        } @else {
          <span class="breadcrumb-item active">
            {{ item.translateKey ? (item.translateKey | translate) : item.label }}
          </span>
        }
      }
    </nav>
  `
})
export class BreadcrumbComponent {
  readonly items = input<BreadcrumbItem[]>([]);
}
