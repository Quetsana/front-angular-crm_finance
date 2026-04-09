import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ToastService } from '../../../core/services/toast.service';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb.component';
import { TrustedHtmlPipe } from '../../../shared/pipes/trusted-html.pipe';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    BreadcrumbComponent,
    DatePipe,
    TrustedHtmlPipe,
  ],
  template: `
    <div class="page animate-fade-in">
      <app-breadcrumb
        [items]="[
          { label: 'Finance', route: '/finance/dashboard' },
          { label: 'Profile', translateKey: 'nav.profile' },
        ]"
      ></app-breadcrumb>

      <div class="page-header">
        <div>
          <h1 class="page-title">{{ 'profile.title' | translate }}</h1>
          <p class="page-sub">{{ 'profile.subtitle' | translate }}</p>
        </div>
      </div>

      @if (auth.currentUser(); as user) {
        <div class="profile-grid">
          <!-- Left: Avatar + Info card -->
          <div class="card p-6 flex flex-col items-center text-center animate-fade-in delay-100">
            <div class="avatar-circle" [style.background]="user.avatarColor">
              {{ user.avatarInitials }}
            </div>
            <h2 class="text-xl font-bold mt-3" style="color:var(--text-primary)">
              {{ user.firstName }} {{ user.lastName }}
            </h2>
            <p class="text-sm" style="color:var(--text-muted)">
              {{ user.position ?? user.role | titlecase }}
            </p>
            <span class="badge badge-brand mt-2">{{ user.role | titlecase }}</span>

            <hr class="divider w-full my-4" />

            <div class="meta-list w-full">
              <div class="meta-item">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>{{ user.email }}</span>
              </div>
              @if (user.phone) {
                <div class="meta-item">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.8"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span>{{ user.phone }}</span>
                </div>
              }
              <div class="meta-item">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>Member since {{ user.createdAt | date: 'MMM y' }}</span>
              </div>
              <div class="meta-item">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Last login: {{ user.lastLogin | date: 'MMM d, y' }}</span>
              </div>
            </div>
          </div>

          <!-- Right: Tabs + Forms -->
          <div class="flex flex-col gap-4">
            <!-- Tabs -->
            <div class="tab-bar animate-fade-in delay-100">
              @for (tab of tabs; track tab.id) {
                <button
                  class="tab-btn"
                  [class.active]="activeTab() === tab.id"
                  (click)="activeTab.set(tab.id)"
                >
                  <span [innerHTML]="tab.icon | trustedHtml"></span>
                  {{ tab.label | translate }}
                </button>
              }
            </div>

            <!-- Personal Info -->
            @if (activeTab() === 'personal') {
              <div class="card p-6 animate-scale-in">
                <h3 class="section-title">{{ 'profile.personalInfo' | translate }}</h3>
                <div class="form-grid">
                  <div>
                    <label class="form-label">{{ 'profile.firstName' | translate }} *</label>
                    <input
                      class="form-input"
                      [(ngModel)]="infoForm.firstName"
                      [placeholder]="'First name'"
                    />
                  </div>
                  <div>
                    <label class="form-label">{{ 'profile.lastName' | translate }} *</label>
                    <input
                      class="form-input"
                      [(ngModel)]="infoForm.lastName"
                      [placeholder]="'Last name'"
                    />
                  </div>
                  <div>
                    <label class="form-label">{{ 'profile.email' | translate }} *</label>
                    <input
                      class="form-input"
                      type="email"
                      [(ngModel)]="infoForm.email"
                      [placeholder]="user.email"
                    />
                  </div>
                  <div>
                    <label class="form-label">{{ 'profile.phone' | translate }}</label>
                    <input
                      class="form-input"
                      [(ngModel)]="infoForm.phone"
                      placeholder="+502 5555-0000"
                    />
                  </div>
                  <div class="col-span-2">
                    <label class="form-label">{{ 'profile.position' | translate }}</label>
                    <input
                      class="form-input"
                      [(ngModel)]="infoForm.position"
                      [placeholder]="user.position ?? 'Your position'"
                    />
                  </div>
                </div>
                <div class="flex justify-end mt-4">
                  <button class="btn btn-primary" (click)="savePersonalInfo()">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {{ 'common.save' | translate }}
                  </button>
                </div>
              </div>
            }

            <!-- Security -->
            @if (activeTab() === 'security') {
              <div class="card p-6 animate-scale-in">
                <h3 class="section-title">{{ 'profile.security' | translate }}</h3>
                <div class="flex flex-col gap-4 max-w-sm">
                  <div>
                    <label class="form-label">{{ 'profile.currentPassword' | translate }}</label>
                    <div class="relative">
                      <input
                        class="form-input pr-10"
                        [type]="showCurrent() ? 'text' : 'password'"
                        [(ngModel)]="passForm.current"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        class="abs-eye"
                        (click)="showCurrent.set(!showCurrent())"
                      >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label class="form-label">{{ 'profile.newPassword' | translate }}</label>
                    <input
                      class="form-input"
                      [type]="showNew() ? 'text' : 'password'"
                      [(ngModel)]="passForm.newPass"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label class="form-label">{{ 'profile.confirmPassword' | translate }}</label>
                    <input
                      class="form-input"
                      type="password"
                      [(ngModel)]="passForm.confirm"
                      placeholder="••••••••"
                    />
                  </div>
                  @if (passError()) {
                    <div class="text-sm text-red-500">{{ passError() }}</div>
                  }
                  <button class="btn btn-primary w-fit" (click)="changePassword()">
                    {{ 'profile.changePassword' | translate }}
                  </button>
                </div>
              </div>
            }

            <!-- Preferences -->
            @if (activeTab() === 'preferences') {
              <div class="card p-6 animate-scale-in">
                <h3 class="section-title">{{ 'profile.preferences' | translate }}</h3>
                <div class="flex flex-col gap-5">
                  <div class="pref-row">
                    <div>
                      <div class="pref-label">{{ 'profile.preferredLanguage' | translate }}</div>
                      <div class="pref-sub">Interface language</div>
                    </div>
                    <select class="form-input form-select w-36" [(ngModel)]="prefForm.language">
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                  </div>

                  <div class="pref-row">
                    <div>
                      <div class="pref-label">{{ 'profile.theme' | translate }}</div>
                      <div class="pref-sub">Choose your preferred appearance</div>
                    </div>
                    <div class="flex gap-2">
                      <button
                        class="theme-btn"
                        [class.active]="prefForm.theme === 'light'"
                        (click)="prefForm.theme = 'light'"
                      >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                        Light
                      </button>
                      <button
                        class="theme-btn"
                        [class.active]="prefForm.theme === 'dark'"
                        (click)="prefForm.theme = 'dark'"
                      >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                          />
                        </svg>
                        Dark
                      </button>
                    </div>
                  </div>

                  <div class="pref-row">
                    <div>
                      <div class="pref-label">{{ 'profile.emailNotifications' | translate }}</div>
                      <div class="pref-sub">Receive email alerts for important events</div>
                    </div>
                    <label class="toggle">
                      <input type="checkbox" [(ngModel)]="prefForm.emailNotif" />
                      <span class="toggle-slider"></span>
                    </label>
                  </div>

                  <div class="pref-row">
                    <div>
                      <div class="pref-label">{{ 'profile.pushNotifications' | translate }}</div>
                      <div class="pref-sub">Browser push notifications</div>
                    </div>
                    <label class="toggle">
                      <input type="checkbox" [(ngModel)]="prefForm.pushNotif" />
                      <span class="toggle-slider"></span>
                    </label>
                  </div>

                  <div class="flex justify-end">
                    <button class="btn btn-primary" (click)="savePreferences()">
                      {{ 'common.save' | translate }}
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .page {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
      .page-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
        margin-top: 0.5rem;
      }
      .page-title {
        font-family: var(--font-serif);
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
      }
      .page-sub {
        font-size: 0.875rem;
        color: var(--text-muted);
        margin-top: 0.25rem;
      }

      .profile-grid {
        display: grid;
        grid-template-columns: 280px 1fr;
        gap: 1.5rem;
      }
      .avatar-circle {
        width: 96px;
        height: 96px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        font-weight: 800;
        color: white;
        box-shadow: 0 4px 20px rgba(139, 21, 56, 0.3);
        border: 3px solid rgba(201, 162, 39, 0.3);
      }

      .meta-list {
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
        text-align: left;
      }
      .meta-item {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        font-size: 0.8125rem;
        color: var(--text-secondary);
      }
      .meta-item svg {
        color: var(--text-muted);
        flex-shrink: 0;
      }

      .tab-bar {
        display: flex;
        gap: 0.375rem;
        padding: 0.375rem;
        background: var(--bg-hover);
        border-radius: 10px;
        width: fit-content;
        flex-wrap: wrap;
      }
      .tab-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--text-secondary);
        border: none;
        background: transparent;
        cursor: pointer;
        transition: all 0.2s;
      }
      .tab-btn svg {
        width: 16px;
        height: 16px;
      }
      .tab-btn:hover {
        color: var(--text-primary);
        background: var(--bg-card);
      }
      .tab-btn.active {
        background: var(--bg-card);
        color: var(--brand);
        box-shadow: var(--shadow-sm);
        font-weight: 600;
      }

      .section-title {
        font-size: 1rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 1.25rem;
      }
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
      .col-span-2 {
        grid-column: span 2;
      }

      .abs-eye {
        position: absolute;
        right: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-muted);
        cursor: pointer;
      }
      .abs-eye:hover {
        color: var(--brand);
      }

      .pref-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.875rem;
        border-radius: 10px;
        background: var(--bg-hover);
      }
      .pref-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-primary);
      }
      .pref-sub {
        font-size: 0.75rem;
        color: var(--text-muted);
        margin-top: 0.125rem;
      }

      .theme-btn {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.5rem 0.875rem;
        border-radius: 8px;
        font-size: 0.8125rem;
        font-weight: 500;
        border: 1.5px solid var(--border-color);
        background: var(--bg-card);
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.2s;
      }
      .theme-btn:hover {
        border-color: var(--brand);
        color: var(--brand);
      }
      .theme-btn.active {
        border-color: var(--brand);
        background: rgba(139, 21, 56, 0.08);
        color: var(--brand);
        font-weight: 600;
      }

      .toggle {
        position: relative;
        display: inline-flex;
        width: 44px;
        height: 24px;
        cursor: pointer;
      }
      .toggle input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      .toggle-slider {
        position: absolute;
        inset: 0;
        background: var(--border-input);
        border-radius: 12px;
        transition: 0.3s;
      }
      .toggle-slider::before {
        content: '';
        position: absolute;
        width: 18px;
        height: 18px;
        left: 3px;
        bottom: 3px;
        background: white;
        border-radius: 50%;
        transition: 0.3s;
      }
      .toggle input:checked + .toggle-slider {
        background: var(--brand);
      }
      .toggle input:checked + .toggle-slider::before {
        transform: translateX(20px);
      }

      @media (max-width: 768px) {
        .profile-grid {
          grid-template-columns: 1fr;
        }
        .form-grid {
          grid-template-columns: 1fr;
        }
        .col-span-2 {
          grid-column: span 1;
        }
      }
    `,
  ],
})
export class ProfileComponent {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  private toast = inject(ToastService);

  readonly activeTab = signal<'personal' | 'security' | 'preferences'>('personal');
  readonly showCurrent = signal(false);
  readonly showNew = signal(false);
  readonly passError = signal('');

  tabs = [
    {
      id: 'personal' as const,
      label: 'profile.personalInfo',
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" style="width:16px;height:16px">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </svg>`,
    },
    {
      id: 'security' as const,
      label: 'profile.security',
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" style="width:16px;height:16px">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
      </svg>`,
    },
    {
      id: 'preferences' as const,
      label: 'profile.preferences',
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" style="width:16px;height:16px">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
      </svg>`,
    },
  ];

  get infoForm() {
    const u = this.auth.currentUser();
    return (
      this._infoForm ??
      (this._infoForm = {
        firstName: u?.firstName ?? '',
        lastName: u?.lastName ?? '',
        email: u?.email ?? '',
        phone: u?.phone ?? '',
        position: u?.position ?? '',
      })
    );
  }
  private _infoForm: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    position: string;
  } | null = null;

  passForm = { current: '', newPass: '', confirm: '' };

  get prefForm() {
    const u = this.auth.currentUser();
    return (
      this._prefForm ??
      (this._prefForm = {
        language: u?.preferences.language ?? 'en',
        theme: u?.preferences.theme ?? 'light',
        emailNotif: u?.preferences.emailNotifications ?? true,
        pushNotif: u?.preferences.pushNotifications ?? false,
      })
    );
  }
  private _prefForm: {
    language: string;
    theme: string;
    emailNotif: boolean;
    pushNotif: boolean;
  } | null = null;

  savePersonalInfo(): void {
    const f = this._infoForm;
    if (!f?.firstName || !f?.email) {
      this.toast.error('Please fill required fields');
      return;
    }
    this.auth.updateProfile({
      firstName: f.firstName,
      lastName: f.lastName,
      email: f.email,
      phone: f.phone || undefined,
      position: f.position || undefined,
      avatarInitials: (f.firstName[0] + (f.lastName[0] ?? '')).toUpperCase(),
    });
    this.toast.success('Profile updated successfully');
  }

  changePassword(): void {
    this.passError.set('');
    if (!this.passForm.current || !this.passForm.newPass) {
      this.passError.set('All fields required');
      return;
    }
    if (this.passForm.newPass.length < 8) {
      this.passError.set('Password must be at least 8 characters');
      return;
    }
    if (this.passForm.newPass !== this.passForm.confirm) {
      this.passError.set('Passwords do not match');
      return;
    }
    this.passForm = { current: '', newPass: '', confirm: '' };
    this.toast.success('Password changed successfully');
  }

  savePreferences(): void {
    const f = this._prefForm;
    if (!f) return;
    this.auth.updateProfile({
      preferences: {
        language: f.language as any,
        theme: f.theme as any,
        emailNotifications: f.emailNotif,
        pushNotifications: f.pushNotif,
        timezone: 'America/Guatemala',
      },
    });
    this.theme.setTheme(f.theme as any);
    this.toast.success('Preferences saved');
  }
}
