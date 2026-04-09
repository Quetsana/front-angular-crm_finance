import { Component, inject, signal, output, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { NotificationService } from '../../core/services/notification.service';
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
  },
];

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, TranslateModule, TrustedHtmlPipe],
  template: `
    <div class="navbar-root">
    <header class="navbar-shell">
      <!-- Mobile/tablet toggle (hidden on desktop >= 1025px) -->
      <button class="btn btn-ghost btn-icon sidebar-toggle-btn mr-2" (click)="sidebarToggle.emit()">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      <!-- Search bar -->
      <div class="search-wrapper" [class.focused]="searchOpen()">
        <svg class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
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
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        }
        <span class="search-kbd">⌘K</span>

        <!-- Desktop dropdown (> 1024px) -->
        @if (searchOpen() && !isSmallScreen()) {
          <div class="search-dropdown animate-slide-down">
            @if (!searchQuery) {
              <div class="px-3 py-2">
                <p class="text-xs font-semibold uppercase tracking-wider mb-2" style="color:var(--text-muted)">
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
          [title]="theme.isDark() ? ('common.lightMode' | translate) : ('common.darkMode' | translate)"
        >
          @if (theme.isDark()) {
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
          } @else {
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
            </svg>
          }
        </button>

        <!-- Notifications -->
        <div class="relative notif-wrapper">
          <button
            class="btn btn-ghost btn-icon btn-sm relative notif-btn"
            [class.notif-active]="notifOpen()"
            (click)="toggleNotif()"
            title="Notifications"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            @if (notifService.unreadCount() > 0) {
              <span class="notif-count-badge animate-count-up">
                {{ notifService.unreadCount() }}
              </span>
            }
          </button>

          <!-- Notification dropdown -->
          @if (notifOpen()) {
            <div class="notif-dropdown animate-slide-down">
              <div class="notif-panel-header">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4" style="color:var(--brand)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                  </svg>
                  <span class="font-bold text-sm" style="color:var(--text-primary)">Notifications</span>
                  @if (notifService.unreadCount() > 0) {
                    <span class="notif-count-inline">{{ notifService.unreadCount() }} new</span>
                  }
                </div>
                @if (notifService.unreadCount() > 0) {
                  <button class="notif-mark-all" (click)="notifService.markAllRead()">
                    Mark all read
                  </button>
                }
              </div>

              <div class="notif-list">
                @for (n of notifService.notifications(); track n.id) {
                  <a
                    class="notif-item"
                    [class.unread]="!n.read"
                    [routerLink]="n.route"
                    (click)="notifService.markRead(n.id); notifOpen.set(false)"
                  >
                    <div class="notif-type-icon" [style.background]="notifService.typeColor(n.type)">
                      {{ notifService.typeLabel(n.type) }}
                    </div>
                    <div class="notif-body">
                      <div class="notif-title">{{ n.title }}</div>
                      <div class="notif-msg">{{ n.message }}</div>
                      <div class="notif-time">{{ notifService.timeAgo(n.createdAt) }}</div>
                    </div>
                    @if (!n.read) {
                      <span class="notif-unread-dot"></span>
                    }
                  </a>
                }
                @if (notifService.notifications().length === 0) {
                  <div class="notif-empty">
                    <svg class="w-8 h-8 opacity-30 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                    </svg>
                    <p>No notifications</p>
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <!-- User menu -->
        <div class="relative user-menu-wrapper">
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
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            @if (userMenuOpen()) {
              <div class="user-dropdown animate-slide-down">
                <div class="dropdown-header">
                  <div class="dh-avatar" [style.background]="user.avatarColor">{{ user.avatarInitials }}</div>
                  <div>
                    <div class="dh-name">{{ user.firstName }} {{ user.lastName }}</div>
                    <div class="dh-email">{{ user.email }}</div>
                  </div>
                </div>
                <hr class="divider my-1"/>
                <a class="dropdown-item" routerLink="/finance/profile" (click)="userMenuOpen.set(false)">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  {{ 'nav.profile' | translate }}
                </a>
                <hr class="divider my-1"/>
                <button class="dropdown-item danger w-full" (click)="auth.logout()">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  {{ 'common.logout' | translate }}
                </button>
              </div>
            }
          }
        </div>
      </div>
    </header>

    <!-- Mobile/tablet search modal (≤ 1024px) — outside <header> to escape backdrop-filter stacking context -->
    @if (searchOpen() && isSmallScreen()) {
      <div class="search-modal-backdrop animate-fade-in" (click)="closeSearch()">
        <div class="search-modal-panel animate-slide-down" (click)="$event.stopPropagation()">
          <div class="search-modal-header">
            <div class="search-modal-input-wrap">
              <svg class="search-modal-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                class="search-modal-input"
                [(ngModel)]="searchQuery"
                (keydown.escape)="closeSearch()"
                placeholder="{{ 'nav.searchModules' | translate }}"
                type="text"
                autofocus
              />
              @if (searchQuery) {
                <button class="search-modal-clear" (click)="searchQuery = ''">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              }
            </div>
            <button class="search-modal-close" (click)="closeSearch()">
              {{ 'common.cancel' | translate }}
            </button>
          </div>
          <div class="search-modal-body">
            @if (!searchQuery) {
              <p class="search-modal-section-label">{{ 'nav.allModules' | translate }}</p>
            }
            @for (mod of filteredModules(); track mod.labelKey) {
              <a class="search-result-item" [routerLink]="mod.route" (click)="closeSearch()">
                <span class="search-result-icon" [innerHTML]="mod.icon | trustedHtml"></span>
                <div>
                  <div class="text-sm font-medium" style="color:var(--text-primary)">
                    {{ mod.labelKey | translate }}
                  </div>
                </div>
              </a>
            }
            @if (filteredModules().length === 0) {
              <div class="px-4 py-8 text-center text-sm" style="color:var(--text-muted)">
                {{ 'nav.noResults' | translate }}
              </div>
            }
          </div>
        </div>
      </div>
    }
    </div>
  `,
  styles: [
    `
      .navbar-root { display: contents; }
      .sidebar-toggle-btn { display: none; }
      @media (max-width: 1024px) {
        .sidebar-toggle-btn { display: inline-flex; }
      }
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
      .search-input::placeholder { color: var(--text-muted); }
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
      .search-result-item:hover { background: var(--bg-hover); }
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
      .search-result-icon svg { width: 100%; height: 100%; }
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
      /* Notification button */
      .notif-btn {
        position: relative;
      }
      .notif-btn.notif-active {
        background: rgba(139, 21, 56, 0.08);
        border-color: var(--brand) !important;
        color: var(--brand);
      }
      .notif-count-badge {
        position: absolute;
        top: 3px;
        right: 3px;
        min-width: 16px;
        height: 16px;
        padding: 0 4px;
        background: var(--brand);
        color: white;
        border-radius: 9999px;
        font-size: 0.6rem;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1.5px solid var(--bg-nav);
      }
      /* Notification dropdown */
      .notif-wrapper { position: relative; }
      .notif-dropdown {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        width: 340px;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 14px;
        box-shadow: var(--shadow-xl);
        z-index: 50;
        overflow: hidden;
      }
      .notif-panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.875rem 1rem;
        border-bottom: 1px solid var(--border-color);
        background: var(--bg-hover);
      }
      .notif-count-inline {
        font-size: 0.7rem;
        font-weight: 700;
        padding: 0.1rem 0.45rem;
        background: rgba(139, 21, 56, 0.12);
        color: var(--brand);
        border-radius: 9999px;
      }
      .notif-mark-all {
        font-size: 0.75rem;
        color: var(--brand);
        font-weight: 600;
        cursor: pointer;
        background: none;
        border: none;
        padding: 0.25rem 0.5rem;
        border-radius: 6px;
        transition: background 0.15s;
      }
      .notif-mark-all:hover { background: rgba(139, 21, 56, 0.08); }
      .notif-list {
        max-height: 320px;
        overflow-y: auto;
      }
      .notif-item {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 0.875rem 1rem;
        border-bottom: 1px solid var(--border-color);
        cursor: pointer;
        transition: background 0.15s;
        text-decoration: none;
        position: relative;
      }
      .notif-item:last-child { border-bottom: none; }
      .notif-item:hover { background: var(--bg-hover); }
      .notif-item.unread { background: rgba(139, 21, 56, 0.03); }
      .notif-item.unread:hover { background: rgba(139, 21, 56, 0.06); }
      .notif-type-icon {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 0.7rem;
        font-weight: 800;
        letter-spacing: 0.02em;
      }
      .notif-body { flex: 1; min-width: 0; }
      .notif-title {
        font-size: 0.8125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 0.2rem;
      }
      .notif-msg {
        font-size: 0.75rem;
        color: var(--text-muted);
        line-height: 1.45;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .notif-time {
        font-size: 0.7rem;
        color: var(--text-muted);
        margin-top: 0.3rem;
        opacity: 0.75;
      }
      .notif-unread-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--brand);
        flex-shrink: 0;
        margin-top: 4px;
        animation: pulse-brand 2s ease-in-out infinite;
      }
      .notif-empty {
        padding: 2rem;
        text-align: center;
        font-size: 0.875rem;
        color: var(--text-muted);
      }
      /* User dropdown */
      .user-menu-wrapper { position: relative; }
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
      .chip-name { font-size: 0.8rem; font-weight: 600; color: var(--text-primary); white-space: nowrap; }
      .chip-role { font-size: 0.7rem; color: var(--text-muted); }
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
      .dh-name { font-weight: 600; font-size: 0.875rem; color: var(--text-primary); }
      .dh-email { font-size: 0.75rem; color: var(--text-muted); }
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
      .dropdown-item:hover { background: var(--bg-hover); color: var(--text-primary); }
      .dropdown-item.danger:hover { background: rgba(220, 38, 38, 0.08); color: var(--danger); }
      /* ── Search modal (mobile/tablet ≤ 1024px) ── */
      .search-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 200;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(3px);
        display: flex;
        flex-direction: column;
        align-items: stretch;
      }
      .search-modal-panel {
        background: var(--bg-card);
        width: 100%;
        max-height: 85vh;
        border-radius: 0 0 20px 20px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0,0,0,0.4);
      }
      .search-modal-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.875rem 1rem;
        border-bottom: 1px solid var(--border-color);
        background: var(--bg-nav);
      }
      .search-modal-input-wrap {
        position: relative;
        flex: 1;
        display: flex;
        align-items: center;
      }
      .search-modal-icon {
        position: absolute;
        left: 0.75rem;
        width: 1rem;
        height: 1rem;
        color: var(--text-muted);
        pointer-events: none;
      }
      .search-modal-input {
        width: 100%;
        padding: 0.625rem 2.5rem 0.625rem 2.25rem;
        background: var(--bg-hover);
        border: 1.5px solid var(--brand);
        border-radius: 10px;
        font-size: 1rem;
        color: var(--text-primary);
        outline: none;
        box-shadow: 0 0 0 3px rgba(139, 21, 56, 0.12);
      }
      .search-modal-input::placeholder { color: var(--text-muted); }
      .search-modal-clear {
        position: absolute;
        right: 0.625rem;
        color: var(--text-muted);
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 4px;
        background: none;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .search-modal-close {
        flex-shrink: 0;
        background: none;
        border: none;
        color: var(--brand);
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        padding: 0.5rem 0.25rem;
      }
      .search-modal-body {
        flex: 1;
        overflow-y: auto;
        padding: 0.5rem;
      }
      .search-modal-section-label {
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-muted);
        padding: 0.5rem 0.75rem 0.25rem;
      }
      @media (max-width: 640px) {
        .search-wrapper { max-width: 160px; }
        .notif-dropdown { width: 300px; right: -60px; }
        .search-modal-panel { max-height: 90vh; border-radius: 0 0 16px 16px; }
      }
    `,
  ],
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  readonly notifService = inject(NotificationService);
  private readonly translate = inject(TranslateService);

  readonly sidebarToggle = output<void>();
  readonly searchOpen = signal(false);
  readonly userMenuOpen = signal(false);
  readonly notifOpen = signal(false);
  readonly currentLang = signal<string>(this.translate.currentLang || 'en');
  readonly isSmallScreen = signal(typeof window !== 'undefined' && window.innerWidth <= 1024);

  searchQuery = '';

  filteredModules() {
    if (!this.searchQuery.trim()) return MODULES;
    const q = this.searchQuery.toLowerCase();
    return MODULES.filter((m) => m.labelKey.toLowerCase().includes(q));
  }

  closeSearch(): void {
    this.searchOpen.set(false);
  }

  toggleNotif(): void {
    this.notifOpen.update((v) => !v);
    if (this.notifOpen()) this.userMenuOpen.set(false);
  }

  toggleLang(): void {
    const next = this.currentLang() === 'en' ? 'es' : 'en';
    this.translate.use(next);
    this.currentLang.set(next);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (!target.closest('.search-wrapper') && !target.closest('.search-modal-panel')) this.searchOpen.set(false);
    if (!target.closest('.user-menu-wrapper')) this.userMenuOpen.set(false);
    if (!target.closest('.notif-wrapper')) this.notifOpen.set(false);
  }

  @HostListener('window:resize')
  onResize(): void {
    this.isSmallScreen.set(window.innerWidth <= 1024);
  }
}
