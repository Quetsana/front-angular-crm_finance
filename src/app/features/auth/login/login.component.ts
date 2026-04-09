import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  template: `
    <div class="login-shell">
      <!-- Animated background -->
      <div class="bg-canvas" aria-hidden="true">
        <div class="bg-circle bg-c1"></div>
        <div class="bg-circle bg-c2"></div>
        <div class="bg-circle bg-c3"></div>

        <!-- Floating finance icons -->
        <div class="float-icon fi-1 animate-float">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
        </div>
        <div class="float-icon fi-2 animate-float delay-200">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div class="float-icon fi-3 animate-float delay-400">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>
          </svg>
        </div>
        <div class="float-icon fi-4 animate-float delay-300">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
          </svg>
        </div>
        <div class="float-icon fi-5 animate-float delay-500">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
          </svg>
        </div>
        <div class="float-icon fi-6 animate-float delay-100">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
        </div>
      </div>

      <!-- Login card -->
      <div class="login-card animate-scale-in">
        <!-- Logo -->
        <div class="login-logo">
          <img src="assets/images/logos/logo-v1.png" alt="Quetsana" class="logo">
          <h1 class="brand-name">Quetsana</h1>
          <span class="brand-tag">Finance</span>
        </div>

        <div class="login-divider">
          <div class="divider-line"></div>
          <span class="divider-text">{{ 'auth.loginTitle' | translate }}</span>
          <div class="divider-line"></div>
        </div>

        <p class="login-subtitle">{{ 'auth.loginSubtitle' | translate }}</p>

        <!-- Form -->
        <form class="login-form" (ngSubmit)="onSubmit()" #loginForm="ngForm">

          <!-- Email -->
          <div class="field-group animate-fade-in delay-100">
            <label class="form-label">{{ 'auth.email' | translate }}</label>
            <div class="input-wrap">
              <svg class="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <input class="form-input pl-10"
                type="email"
                name="email"
                [(ngModel)]="email"
                required
                [placeholder]="'auth.emailPlaceholder' | translate"
                [class.error]="showError()">
            </div>
          </div>

          <!-- Password -->
          <div class="field-group animate-fade-in delay-200">
            <label class="form-label">{{ 'auth.password' | translate }}</label>
            <div class="input-wrap">
              <svg class="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              <input class="form-input pl-10 pr-10"
                [type]="showPass() ? 'text' : 'password'"
                name="password"
                [(ngModel)]="password"
                required
                [placeholder]="'auth.passwordPlaceholder' | translate"
                [class.error]="showError()">
              <button type="button" class="pass-toggle" (click)="showPass.set(!showPass())">
                @if (showPass()) {
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  </svg>
                } @else {
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                }
              </button>
            </div>
          </div>

          <!-- Remember + Forgot -->
          <div class="flex items-center justify-between animate-fade-in delay-300">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" class="remember-check" [(ngModel)]="remember" name="remember">
              <span class="text-sm" style="color:var(--text-secondary)">{{ 'auth.rememberMe' | translate }}</span>
            </label>
            <button type="button" class="forgot-link">
              {{ 'auth.forgotPassword' | translate }}
            </button>
          </div>

          <!-- Error -->
          @if (showError()) {
            <div class="error-banner animate-fade-in">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              {{ 'auth.loginError' | translate }}
            </div>
          }

          <!-- Submit -->
          <button type="submit" class="btn btn-primary btn-lg w-full submit-btn animate-fade-in delay-400"
            [disabled]="loading()">
            @if (loading()) {
              <svg class="w-4 h-4 spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="60" stroke-dashoffset="30"/>
              </svg>
              {{ 'auth.signingIn' | translate }}
            } @else {
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
              </svg>
              {{ 'auth.signIn' | translate }}
            }
          </button>
        </form>

        <!-- Demo hint -->
        <div class="demo-hint animate-fade-in delay-500">
          <div class="demo-icon">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p class="demo-title">Demo Access</p>
            <p class="demo-cred">byron&#64;quetsana.com · any password</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-shell {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0d0307 0%, #1a0810 40%, #240b16 70%, #1a0610 100%);
      position: relative;
      overflow: hidden;
      padding: 1.5rem;
    }

    /* Background animations */
    .bg-canvas { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
    .bg-circle {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: .12;
    }
    .bg-c1 {
      width: 500px; height: 500px;
      background: #8b1538;
      top: -150px; right: -100px;
      animation: float 8s ease-in-out infinite;
    }
    .bg-c2 {
      width: 350px; height: 350px;
      background: #c9a227;
      bottom: -80px; left: -80px;
      animation: float 10s ease-in-out infinite reverse;
    }
    .bg-c3 {
      width: 250px; height: 250px;
      background: #9b8ec4;
      top: 40%; left: 30%;
      animation: float 12s ease-in-out infinite;
    }

    /* Floating icons */
    .float-icon {
      position: absolute;
      width: 48px; height: 48px;
      border-radius: 12px;
      background: rgba(201,162,39,.08);
      border: 1px solid rgba(201,162,39,.15);
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(201,162,39,.5);
      backdrop-filter: blur(4px);
    }
    .float-icon svg { width: 24px; height: 24px; }

    .fi-1 { top: 12%; left: 8%; }
    .fi-2 { top: 20%; right: 10%; width: 56px; height: 56px; }
    .fi-3 { bottom: 25%; left: 5%; }
    .fi-4 { bottom: 15%; right: 8%; width: 44px; height: 44px; }
    .fi-5 { top: 55%; left: 12%; width: 40px; height: 40px; }
    .fi-6 { top: 65%; right: 15%; }

    /* Card */
    .login-card {
      background: rgba(26, 8, 16, .85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(201,162,39,.2);
      border-radius: 24px;
      padding: 2.5rem;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 24px 80px rgba(0,0,0,.5), 0 0 0 1px rgba(139,21,56,.2);
      position: relative;
      z-index: 1;
    }

    .login-logo {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .logo {
      width: 80px; height: 80px;
      border-radius: 50%;
      border: 2.5px solid rgba(201,162,39,.5);
      box-shadow: 0 0 30px rgba(201,162,39,.2);
      margin-bottom: .75rem;
      animation: pulse-gold 3s ease-in-out infinite;
    }
    .brand-name {
      font-family: var(--font-serif);
      font-size: 1.75rem;
      font-weight: 700;
      color: #f5e8ee;
      letter-spacing: .02em;
      line-height: 1;
    }
    .brand-tag {
      font-size: .75rem;
      font-weight: 600;
      letter-spacing: .2em;
      text-transform: uppercase;
      color: var(--accent);
      margin-top: .25rem;
    }

    .login-divider {
      display: flex;
      align-items: center;
      gap: .75rem;
      margin-bottom: .5rem;
    }
    .divider-line { flex: 1; height: 1px; background: rgba(201,162,39,.2); }
    .divider-text {
      font-size: .8125rem;
      font-weight: 600;
      color: #d4afc0;
      white-space: nowrap;
    }

    .login-subtitle {
      text-align: center;
      font-size: .8125rem;
      color: #8a6070;
      margin-bottom: 1.75rem;
    }

    .login-form { display: flex; flex-direction: column; gap: 1rem; }

    .field-group { display: flex; flex-direction: column; gap: .375rem; }

    .form-label { color: #d4afc0 !important; }

    .input-wrap { position: relative; }
    .input-icon {
      position: absolute;
      left: .75rem;
      top: 50%;
      transform: translateY(-50%);
      width: 1rem;
      height: 1rem;
      color: #8a6070;
      pointer-events: none;
    }
    .form-input {
      background: rgba(255,255,255,.05) !important;
      border-color: rgba(201,162,39,.25) !important;
      color: #f5e8ee !important;
    }
    .form-input:focus {
      border-color: var(--accent) !important;
      box-shadow: 0 0 0 3px rgba(201,162,39,.12) !important;
      background: rgba(255,255,255,.08) !important;
    }
    .form-input::placeholder { color: #5a3048 !important; }
    .form-input.error { border-color: #ef4444 !important; }

    .pass-toggle {
      position: absolute;
      right: .75rem;
      top: 50%;
      transform: translateY(-50%);
      color: #8a6070;
      cursor: pointer;
      padding: .25rem;
    }
    .pass-toggle:hover { color: var(--accent); }

    .remember-check { accent-color: var(--accent); }

    .forgot-link {
      font-size: .8125rem;
      color: var(--accent);
      background: transparent;
      border: none;
      cursor: pointer;
      transition: color .15s;
      padding: 0;
    }
    .forgot-link:hover { color: #f0c53e; }

    .error-banner {
      display: flex;
      align-items: center;
      gap: .5rem;
      padding: .75rem 1rem;
      background: rgba(220,38,38,.1);
      border: 1px solid rgba(220,38,38,.3);
      border-radius: 8px;
      color: #f87171;
      font-size: .8125rem;
    }

    .submit-btn {
      justify-content: center;
      font-size: .9375rem;
      padding: .75rem;
      margin-top: .25rem;
    }
    .submit-btn:disabled { opacity: .7; cursor: not-allowed; }

    .spin { animation: spin-slow 1s linear infinite; }

    .demo-hint {
      display: flex;
      align-items: center;
      gap: .75rem;
      margin-top: 1.5rem;
      padding: .875rem 1rem;
      background: rgba(201,162,39,.06);
      border: 1px dashed rgba(201,162,39,.25);
      border-radius: 10px;
    }
    .demo-icon {
      width: 32px; height: 32px;
      border-radius: 8px;
      background: rgba(201,162,39,.1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--accent);
      flex-shrink: 0;
    }
    .demo-title { font-size: .8125rem; font-weight: 600; color: var(--accent); }
    .demo-cred  { font-size: .75rem; color: #8a6070; font-family: monospace; margin-top: .125rem; }
  `]
})
export class LoginComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);
  private toast  = inject(ToastService);

  email    = '';
  password = '';
  remember = false;
  readonly showPass  = signal(false);
  readonly loading   = signal(false);
  readonly showError = signal(false);

  onSubmit(): void {
    this.showError.set(false);
    if (!this.email || !this.password) { this.showError.set(true); return; }

    this.loading.set(true);
    setTimeout(() => {
      const ok = this.auth.login(this.email, this.password, this.remember);
      this.loading.set(false);
      if (ok) {
        this.toast.success('Welcome back!', `Hello, ${this.auth.currentUser()?.firstName}!`);
        this.router.navigate(['/finance/dashboard']);
      } else {
        this.showError.set(true);
      }
    }, 800);
  }
}
