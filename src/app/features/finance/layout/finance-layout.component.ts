import { Component, signal, HostListener } from '@angular/core';
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
    <div class="layout-root" [class.mobile-sidebar-open]="mobileSidebarOpen()">
      <!-- Mobile overlay -->
      @if (mobileSidebarOpen()) {
        <div class="mobile-overlay" (click)="mobileSidebarOpen.set(false)"></div>
      }

      <!-- Sidebar -->
      <app-sidebar
        [collapsed]="sidebarCollapsed()"
        class="layout-sidebar"
        [class.mobile-open]="mobileSidebarOpen()">
      </app-sidebar>

      <!-- Main content -->
      <div class="layout-main">
        <app-navbar (sidebarToggle)="mobileSidebarOpen.set(!mobileSidebarOpen())"></app-navbar>
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
    }
    .layout-sidebar {
      flex-shrink: 0;
      z-index: 30;
    }
    .layout-main {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }
    .layout-content {
      flex: 1;
      padding: 1.5rem;
      overflow-y: auto;
    }
    .mobile-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.5);
      z-index: 29;
    }
    @media (max-width: 768px) {
      .layout-sidebar {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        transform: translateX(-100%);
        transition: transform .3s cubic-bezier(.4,0,.2,1);
      }
      .layout-sidebar.mobile-open {
        transform: translateX(0);
      }
      .layout-content {
        padding: 1rem;
      }
    }
    @media (max-width: 640px) {
      .layout-content { padding: .75rem; }
    }
  `]
})
export class FinanceLayoutComponent {
  readonly sidebarCollapsed  = signal(false);
  readonly mobileSidebarOpen = signal(false);

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 768) this.mobileSidebarOpen.set(false);
  }
}
