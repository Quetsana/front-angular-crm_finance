import { Component, inject, signal, output, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { TrustedHtmlPipe } from '../pipes/trusted-html.pipe';

interface Module {
  labelKey: string;
  icon: string;
  route: string;
  subModules?: { label: string; route: string }[];
}

const MODULES: Module[] = [
  {
    labelKey: 'nav.dashboard',
    route: '/finance/dashboard',
    icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
    </svg>`,
  },
  {
    labelKey: 'nav.transactions',
    route: '/finance/transactions',
    icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>`,
    subModules: [
      { label: 'Income', route: '/finance/transactions?type=income' },
      { label: 'Expenses', route: '/finance/transactions?type=expense' },
      { label: 'All Transactions', route: '/finance/transactions' },
    ],
  },
  {
    labelKey: 'nav.accounts',
    route: '/finance/accounts',
    icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
    </svg>`,
  },
  {
    labelKey: 'nav.aiAnalysis',
    route: '/finance/ai-analysis',
    icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
    </svg>`,
    subModules: [
      { label: 'Daily', route: '/finance/ai-analysis?type=daily' },
      { label: 'Weekly', route: '/finance/ai-analysis?type=weekly' },
      { label: 'Monthly', route: '/finance/ai-analysis?type=monthly' },
    ],
  },
];

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, TranslateModule, TrustedHtmlPipe],
  template: `
    <header class="navbar-shell">
      <!-- Mobile toggle -->
      <button class="btn btn-ghost btn-icon md:hidden mr-2" (click)="sidebarToggle.emit()">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <!-- Search bar -->
      <div class="search-wrapper" [class.focused]="searchOpen()">
        <svg class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          class="search-input"
          [(ngModel)]="searchQuery"
          (focus)="searchOpen.set(true)"
          (keydown.escape)="closeSearch()"
          placeholder="{{ 'nav.searchModules' | translate }}"
          type="text"
        />
        @if (searchQuery) {
          <button class="search-clear" (click)="searchQuery = ''; searchOpen.set(false)">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        }
        <span class="search-kbd">⌘K</span>

        <!-- Search dropdown -->
        @if (searchOpen() && (searchQuery || true)) {
          <div class="search-dropdown animate-slide-down">
            @if (!searchQuery) {
              <div class="px-3 py-2">
                <p
                  class="text-xs font-semibold uppercase tracking-wider mb-2"
                  style="color:var(--text-muted)"
                >
                  {{ 'nav.allModules' | translate }}
                </p>
              </div>
            }
            @for (mod of filteredModules(); track mod.labelKey) {
              <a class="search-result-item" [routerLink]="mod.route" (click)="closeSearch()">
                <span class="search-result-icon" [innerHTML]="mod.icon | trustedHtml"></span>
                <div>
                  <div class="text-sm font-medium" style="color:var(--text-primary)">
                    {{ mod.labelKey | translate }}
                  </div>
                  @if (mod.subModules) {
                    <div class="flex gap-2 mt-1 flex-wrap">
                      @for (sub of mod.subModules; track sub.label) {
                        <a
                          class="text-xs badge badge-brand"
                          [routerLink]="sub.route.split('?')[0]"
                          (click)="closeSearch(); $event.stopPropagation()"
                        >
                          {{ sub.label }}
                        </a>
                      }
                    </div>
                  }
                </div>
              </a>
            }
            @if (filteredModules().length === 0) {
              <div class="px-4 py-6 text-center text-sm" style="color:var(--text-muted)">
                {{ 'nav.noResults' | translate }}
              </div>
            }
          </div>
        }
      </div>

      <div class="flex-1"></div>

      <!-- Right actions -->
      <div class="nav-actions">
        <!-- Language toggle -->
        <button
          class="btn btn-ghost btn-icon btn-sm lang-btn"
          (click)="toggleLang()"
          [title]="currentLang() === 'en' ? 'Cambiar a Español' : 'Switch to English'"
        >
          <span class="text-xs font-bold">{{ currentLang().toUpperCase() }}</span>
        </button>

        <!-- Theme toggle -->
        <button
          class="btn btn-ghost btn-icon btn-sm"
          (click)="theme.toggle()"
          [title]="
            theme.isDark() ? ('common.lightMode' | translate) : ('common.darkMode' | translate)
          "
        >
          @if (theme.isDark()) {
            <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          } @else {
            <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          }
        </button>

        <!-- Notifications -->
        <button
          class="btn btn-ghost btn-icon btn-sm relative"
          (click)="notifOpen.set(!notifOpen())"
        >
          <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span class="notif-dot"></span>
        </button>

        <!-- User menu -->
        <div class="relative" #userMenuRef>
          @if (auth.currentUser(); as user) {
            <button class="user-chip" (click)="userMenuOpen.set(!userMenuOpen())">
              <div class="chip-avatar" [style.background]="user.avatarColor">
                {{ user.avatarInitials }}
              </div>
              <div class="chip-info hide-tablet">
                <div class="chip-name">{{ user.firstName }}</div>
                <div class="chip-role">{{ user.role | titlecase }}</div>
              </div>
              <svg
                class="w-3.5 h-3.5 hide-tablet transition-transform duration-200"
                [class.rotate-180]="userMenuOpen()"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            @if (userMenuOpen()) {
              <div class="user-dropdown animate-slide-down">
                <div class="dropdown-header">
                  <div class="dh-avatar" [style.background]="user.avatarColor">
                    {{ user.avatarInitials }}
                  </div>
                  <div>
                    <div class="dh-name">{{ user.firstName }} {{ user.lastName }}</div>
                    <div class="dh-email">{{ user.email }}</div>
                  </div>
                </div>
                <hr class="divider my-1" />
                <a
                  class="dropdown-item"
                  routerLink="/finance/profile"
                  (click)="userMenuOpen.set(false)"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.8"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  {{ 'nav.profile' | translate }}
                </a>
                <hr class="divider my-1" />
                <button class="dropdown-item danger w-full" (click)="auth.logout()">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.8"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  {{ 'common.logout' | translate }}
                </button>
              </div>
            }
          }
        </div>
      </div>
    </header>
  `,
  styles: [
    `
      .navbar-shell {
        position: sticky;
        top: 0;
        z-index: 20;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1.5rem;
        background: var(--bg-nav);
        border-bottom: 1px solid var(--border-color);
        box-shadow: var(--shadow-sm);
        backdrop-filter: blur(8px);
      }
      .search-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        max-width: 420px;
        width: 100%;
      }
      .search-icon {
        position: absolute;
        left: 0.75rem;
        width: 1rem;
        height: 1rem;
        color: var(--text-muted);
        pointer-events: none;
      }
      .search-input {
        width: 100%;
        padding: 0.5rem 0.75rem 0.5rem 2.25rem;
        background: var(--bg-hover);
        border: 1.5px solid var(--border-color);
        border-radius: 10px;
        font-size: 0.875rem;
        color: var(--text-primary);
        outline: none;
        transition: all 0.2s;
      }
      .search-input:focus,
      .search-wrapper.focused .search-input {
        border-color: var(--brand);
        background: var(--bg-surface);
        box-shadow: 0 0 0 3px rgba(139, 21, 56, 0.1);
      }
      .search-input::placeholder {
        color: var(--text-muted);
      }
      .search-clear {
        position: absolute;
        right: 2.5rem;
        color: var(--text-muted);
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 4px;
      }
      .search-kbd {
        position: absolute;
        right: 0.75rem;
        font-size: 0.65rem;
        padding: 0.1rem 0.35rem;
        border: 1px solid var(--border-input);
        border-radius: 4px;
        color: var(--text-muted);
        pointer-events: none;
      }
      .search-dropdown {
        position: absolute;
        top: calc(100% + 8px);
        left: 0;
        right: 0;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        box-shadow: var(--shadow-lg);
        z-index: 50;
        max-height: 380px;
        overflow-y: auto;
        padding: 0.5rem;
      }
      .search-result-item {
        display: flex;
        align-items: flex-start;
        gap: 0.875rem;
        padding: 0.75rem;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.15s;
        text-decoration: none;
      }
      .search-result-item:hover {
        background: var(--bg-hover);
      }
      .search-result-icon {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        background: rgba(139, 21, 56, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--brand);
        flex-shrink: 0;
        padding: 6px;
      }
      .search-result-icon svg {
        width: 100%;
        height: 100%;
      }
      .nav-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .lang-btn {
        font-size: 0.75rem;
        letter-spacing: 0.05em;
        border: 1px solid var(--border-color) !important;
        min-width: 36px;
      }
      .notif-dot {
        position: absolute;
        top: 6px;
        right: 6px;
        width: 7px;
        height: 7px;
        background: var(--brand);
        border-radius: 50%;
        border: 1.5px solid var(--bg-nav);
      }
      .user-chip {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        padding: 0.375rem 0.75rem 0.375rem 0.375rem;
        border-radius: 10px;
        border: 1px solid var(--border-color);
        background: transparent;
        cursor: pointer;
        transition: all 0.2s;
      }
      .user-chip:hover {
        background: var(--bg-hover);
        border-color: var(--brand);
      }
      .chip-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.75rem;
        color: white;
      }
      .chip-name {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--text-primary);
        white-space: nowrap;
      }
      .chip-role {
        font-size: 0.7rem;
        color: var(--text-muted);
      }
      .user-dropdown {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        min-width: 220px;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        box-shadow: var(--shadow-lg);
        z-index: 50;
        padding: 0.5rem;
      }
      .dropdown-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
      }
      .dh-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.875rem;
        color: white;
        flex-shrink: 0;
      }
      .dh-name {
        font-weight: 600;
        font-size: 0.875rem;
        color: var(--text-primary);
      }
      .dh-email {
        font-size: 0.75rem;
        color: var(--text-muted);
      }
      .dropdown-item {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        padding: 0.625rem 0.75rem;
        border-radius: 8px;
        font-size: 0.875rem;
        color: var(--text-secondary);
        cursor: pointer;
        transition: background 0.15s;
        text-decoration: none;
        border: none;
        background: transparent;
        width: 100%;
        text-align: left;
      }
      .dropdown-item:hover {
        background: var(--bg-hover);
        color: var(--text-primary);
      }
      .dropdown-item.danger:hover {
        background: rgba(220, 38, 38, 0.08);
        color: var(--danger);
      }
      @media (max-width: 640px) {
        .search-wrapper {
          max-width: 200px;
        }
      }
    `,
  ],
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  private readonly translate = inject(TranslateService);

  readonly sidebarToggle = output<void>();
  readonly searchOpen = signal(false);
  readonly userMenuOpen = signal(false);
  readonly notifOpen = signal(false);
  readonly currentLang = signal<string>(this.translate.currentLang || 'en');

  searchQuery = '';

  filteredModules() {
    if (!this.searchQuery.trim()) return MODULES;
    const q = this.searchQuery.toLowerCase();
    return MODULES.filter(
      (m) =>
        m.labelKey.toLowerCase().includes(q) ||
        m.subModules?.some((s) => s.label.toLowerCase().includes(q)),
    );
  }

  closeSearch(): void {
    this.searchOpen.set(false);
  }

  toggleLang(): void {
    const next = this.currentLang() === 'en' ? 'es' : 'en';
    this.translate.use(next);
    this.currentLang.set(next);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (!target.closest('.search-wrapper')) this.searchOpen.set(false);
    if (!target.closest('.user-chip') && !target.closest('.user-dropdown'))
      this.userMenuOpen.set(false);
  }
}
