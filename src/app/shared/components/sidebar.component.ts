import { Component, inject, signal, output, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { TrustedHtmlPipe } from '../pipes/trusted-html.pipe';

interface NavItem {
  labelKey: string;
  icon: string;
  route?: string;
  children?: NavItem[];
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
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
    icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>`,
    children: [
      {
        labelKey: 'common.income',
        route: '/finance/transactions?type=income',
        icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
        </svg>`,
      },
      {
        labelKey: 'common.expense',
        route: '/finance/transactions?type=expense',
        icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
        </svg>`,
      },
      {
        labelKey: 'common.all',
        route: '/finance/transactions',
        icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
        </svg>`,
      },
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
    badge: 'AI',
  },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, TranslateModule, TrustedHtmlPipe],
  template: `
    <aside class="sidebar-shell" [class.collapsed]="collapsed()">
      <!-- Top: Logo -->
      <div class="sidebar-header">
        <div class="flex items-center gap-3 min-w-0">
          <img
            src="assets/images/logos/logo-v1.png"
            alt="Quetsana"
            class="logo-img flex-shrink-0"
          />
          @if (!collapsed()) {
            <div class="min-w-0 overflow-hidden">
              <div class="logo-title">Quetsana</div>
              <div class="logo-sub">Finance</div>
            </div>
          }
        </div>
        <button class="collapse-btn" (click)="toggleCollapsed()">
          <svg
            class="w-4 h-4 transition-transform duration-300"
            [class.rotate-180]="collapsed()"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      <hr class="divider mx-3 opacity-20" />

      <!-- Nav items -->
      <nav class="sidebar-nav">
        @for (item of navItems; track item.labelKey) {
          @if (item.children) {
            <div class="nav-group">
              <button
                class="sidebar-link w-full"
                [class.group-active]="isGroupActive(item)"
                (click)="toggleGroup(item.labelKey)"
              >
                <span class="nav-icon" [innerHTML]="item.icon | trustedHtml"></span>
                @if (!collapsed()) {
                  <span class="flex-1 text-left">{{ item.labelKey | translate }}</span>
                  <svg
                    class="w-4 h-4 transition-transform duration-200 flex-shrink-0"
                    [class.rotate-180]="openGroups().has(item.labelKey)"
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
                }
              </button>

              @if (!collapsed() && openGroups().has(item.labelKey)) {
                <div class="sub-nav animate-slide-down">
                  @for (child of item.children; track child.labelKey) {
                    <a
                      class="sidebar-link sub-link"
                      [routerLink]="getRoute(child.route)"
                      [queryParams]="getQueryParams(child.route)"
                      routerLinkActive="active"
                    >
                      <span class="sub-icon" [innerHTML]="child.icon | trustedHtml"></span>
                      <span>{{ child.labelKey | translate }}</span>
                    </a>
                  }
                </div>
              }
            </div>
          } @else {
            <a class="sidebar-link" [routerLink]="item.route" routerLinkActive="active">
              <span class="nav-icon" [innerHTML]="item.icon | trustedHtml"></span>
              @if (!collapsed()) {
                <span class="flex-1">{{ item.labelKey | translate }}</span>
                @if (item.badge) {
                  <span class="ai-badge">{{ item.badge }}</span>
                }
              }
            </a>
          }
        }
      </nav>

      <!-- Bottom: User -->
      <div class="sidebar-footer">
        <hr class="divider mx-3 opacity-20 mb-3" />
        @if (auth.currentUser(); as user) {
          <div class="user-section" [class.centered]="collapsed()">
            <div class="user-avatar" [style.background]="user.avatarColor">
              {{ user.avatarInitials }}
            </div>
            @if (!collapsed()) {
              <div class="user-info min-w-0">
                <div class="user-name">{{ user.firstName }} {{ user.lastName }}</div>
                <div class="user-role">{{ user.role | titlecase }}</div>
              </div>
            }
          </div>
          <button class="sidebar-link w-full mt-1" (click)="auth.logout()">
            <svg
              class="w-4 h-4 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.8"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            @if (!collapsed()) {
              <span>{{ 'common.logout' | translate }}</span>
            }
          </button>
        }
      </div>
    </aside>
  `,
  styles: [
    `
      .sidebar-shell {
        display: flex;
        flex-direction: column;
        width: 260px;
        min-width: 260px;
        height: 100vh;
        background: var(--bg-sidebar);
        transition:
          width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
          min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
        position: sticky;
        top: 0;
      }
      .sidebar-shell.collapsed {
        width: 70px;
        min-width: 70px;
      }
      .sidebar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.25rem 1rem;
        gap: 0.5rem;
      }
      .logo-img {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid rgba(201, 162, 39, 0.4);
      }
      .logo-title {
        font-family: var(--font-serif);
        font-size: 1rem;
        font-weight: 600;
        color: #f5e8ee;
        white-space: nowrap;
      }
      .logo-sub {
        font-size: 0.7rem;
        color: var(--accent);
        letter-spacing: 0.1em;
        text-transform: uppercase;
        font-weight: 500;
      }
      .collapse-btn {
        flex-shrink: 0;
        width: 28px;
        height: 28px;
        border-radius: 8px;
        background: rgba(201, 162, 39, 0.1);
        border: 1px solid rgba(201, 162, 39, 0.2);
        color: var(--accent);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
      }
      .collapse-btn:hover {
        background: rgba(201, 162, 39, 0.2);
      }
      .sidebar-nav {
        flex: 1;
        padding: 0.5rem 0.75rem;
        overflow-y: auto;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .nav-icon {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .nav-icon svg,
      .sub-icon svg {
        width: 100%;
        height: 100%;
      }
      .sub-icon {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }
      .sub-nav {
        padding-left: 1.75rem;
        display: flex;
        flex-direction: column;
        gap: 2px;
        margin-top: 2px;
      }
      .sub-link {
        font-size: 0.8125rem;
        padding: 0.45rem 0.75rem;
      }
      .ai-badge {
        font-size: 0.65rem;
        font-weight: 700;
        padding: 0.1rem 0.4rem;
        background: linear-gradient(135deg, var(--accent) 0%, #f0c53e 100%);
        color: #1a0a12;
        border-radius: 9999px;
        letter-spacing: 0.05em;
      }
      .group-active {
        background: rgba(201, 162, 39, 0.06) !important;
      }
      .sidebar-footer {
        padding: 0.75rem;
      }
      .user-section {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 0.5rem;
        border-radius: 10px;
        background: rgba(201, 162, 39, 0.05);
      }
      .user-section.centered {
        justify-content: center;
      }
      .user-avatar {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.75rem;
        color: white;
        flex-shrink: 0;
      }
      .user-info {
        min-width: 0;
        overflow: hidden;
      }
      .user-name {
        font-size: 0.8125rem;
        font-weight: 600;
        color: #f5e8ee;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .user-role {
        font-size: 0.7rem;
        color: var(--accent);
        text-transform: capitalize;
      }
      @media (max-width: 768px) {
        .sidebar-shell {
          position: fixed;
          left: 0;
          top: 0;
          z-index: 30;
        }
      }
    `,
  ],
})
export class SidebarComponent {
  readonly auth = inject(AuthService);
  readonly collapsed = input(false);
  readonly navItems = NAV_ITEMS;
  readonly openGroups = signal<Set<string>>(new Set(['nav.transactions']));

  toggleCollapsed(): void {}

  toggleGroup(key: string): void {
    this.openGroups.update((s) => {
      const n = new Set(s);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  }

  isGroupActive(item: { children?: { route?: string }[] }): boolean {
    return (
      item.children?.some(
        (c) => c.route && window.location.pathname.startsWith(c.route.split('?')[0]),
      ) ?? false
    );
  }

  getRoute(route?: string): string {
    if (!route) return '/';
    return route.split('?')[0];
  }

  getQueryParams(route?: string): Record<string, string> | null {
    if (!route || !route.includes('?')) return null;
    const params: Record<string, string> = {};
    route
      .split('?')[1]
      .split('&')
      .forEach((p) => {
        const [k, v] = p.split('=');
        params[k] = v;
      });
    return params;
  }
}
