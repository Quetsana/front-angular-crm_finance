import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Default redirect → finance
  {
    path: '',
    redirectTo: 'finance',
    pathMatch: 'full'
  },

  // Auth routes (public)
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  // Finance routes (protected)
  {
    path: 'finance',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/finance/layout/finance-layout.component').then(m => m.FinanceLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/finance/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('./features/finance/transactions/transactions.component').then(m => m.TransactionsComponent)
      },
      {
        path: 'accounts',
        loadComponent: () =>
          import('./features/finance/accounts/accounts.component').then(m => m.AccountsComponent)
      },
      {
        path: 'ai-analysis',
        loadComponent: () =>
          import('./features/finance/ai-analysis/ai-analysis.component').then(m => m.AiAnalysisComponent)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/finance/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  },

  // Catch-all
  { path: '**', redirectTo: 'finance/dashboard' }
];
