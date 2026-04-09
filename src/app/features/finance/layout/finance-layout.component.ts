import { Component, signal, computed, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/components/sidebar.component';
import { NavbarComponent } from '../../../shared/components/navbar.component';
import { ToastComponent } from '../../../shared/components/toast.component';

@Component({
  selector: 'app-finance-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SidebarComponent, NavbarComponent, ToastComponent],
  template: `
    <div class="layout-root">
      <!-- Mobile overlay -->
      @if (mobileSidebarOpen()) {
        <div class="mobile-overlay animate-fade-in" (click)="mobileSidebarOpen.set(false)"></div>
      }

      <!-- Sidebar: never collapsed on mobile (always full-width drawer) -->
      <app-sidebar
        [collapsed]="effectiveCollapsed()"
        (collapsedChange)="sidebarCollapsed.update(v => !v)"
        (linkClicked)="onNavLinkClicked()"
        class="layout-sidebar"
        [class.mobile-open]="mobileSidebarOpen()"
      ></app-sidebar>

      <!-- Main content -->
      <div class="layout-main">
        <app-navbar (sidebarToggle)="toggleMobileSidebar()"></app-navbar>
        <main class="layout-content">
          <router-outlet></router-outlet>
        </main>
      </div>

      <app-toast></app-toast>
    </div>
  `,
  styles: [`
    .layout-root {
      display: flex;
      min-height: 100vh;
      background: var(--bg-base);
      overflow-x: hidden;
    }
    .layout-sidebar {
      flex-shrink: 0;
      z-index: 30;
    }
    .layout-main {
      flex: 1;
      min-width: 0;
      max-width: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .layout-content {
      flex: 1;
      padding: 1.5rem;
      overflow-x: hidden;
      overflow-y: auto;
      min-height: 0;
    }
    .mobile-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      backdrop-filter: blur(2px);
      z-index: 29;
    }
    /* ── Tablet/mobile: sidebar becomes a full-height drawer ── */
    @media (max-width: 1024px) {
      .layout-sidebar {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        transform: translateX(-100%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: none;
        /* Sidebar removed from flow — layout-main fills full width */
      }
      .layout-sidebar.mobile-open {
        transform: translateX(0);
        box-shadow: 6px 0 32px rgba(0, 0, 0, 0.45);
      }
      .layout-content {
        padding: 1rem;
      }
    }
    @media (max-width: 640px) {
      .layout-content { padding: 0.75rem; }
    }
  `]
})
export class FinanceLayoutComponent {
  readonly sidebarCollapsed  = signal(false);
  readonly mobileSidebarOpen = signal(false);
  readonly isMobile          = signal(typeof window !== 'undefined' && window.innerWidth <= 1024);

  /** On mobile/tablet the sidebar is always full-width — never icon-only */
  readonly effectiveCollapsed = computed(() =>
    this.sidebarCollapsed() && !this.isMobile()
  );

  toggleMobileSidebar(): void {
    this.mobileSidebarOpen.update(v => !v);
  }

  onNavLinkClicked(): void {
    if (this.isMobile()) {
      this.mobileSidebarOpen.set(false);
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    const mobile = window.innerWidth <= 1024;
    this.isMobile.set(mobile);
    if (!mobile) this.mobileSidebarOpen.set(false);
  }
}
