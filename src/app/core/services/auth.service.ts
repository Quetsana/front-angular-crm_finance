import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { MOCK_USERS } from '../constants/mock-data';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly SESSION_KEY = 'qf_session';

  private _currentUser = signal<User | null>(this.loadSession());
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  constructor(private router: Router) {}

  private loadSession(): User | null {
    try {
      const raw = sessionStorage.getItem(this.SESSION_KEY)
               ?? localStorage.getItem(this.SESSION_KEY);
      if (!raw) return null;
      const { userId } = JSON.parse(raw);
      return MOCK_USERS.find(u => u.id === userId) ?? null;
    } catch { return null; }
  }

  login(email: string, password: string, remember = false): boolean {
    // Mock: any MOCK_USER email + any non-empty password
    const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || !password) return false;

    this._currentUser.set(user);
    const payload = JSON.stringify({ userId: user.id });
    if (remember) localStorage.setItem(this.SESSION_KEY, payload);
    else           sessionStorage.setItem(this.SESSION_KEY, payload);
    return true;
  }

  logout(): void {
    this._currentUser.set(null);
    localStorage.removeItem(this.SESSION_KEY);
    sessionStorage.removeItem(this.SESSION_KEY);
    this.router.navigate(['/auth/login']);
  }

  updateProfile(partial: Partial<User>): void {
    const current = this._currentUser();
    if (!current) return;
    const updated = { ...current, ...partial };
    this._currentUser.set(updated);
    // Persist session
    const stored = sessionStorage.getItem(this.SESSION_KEY) ?? localStorage.getItem(this.SESSION_KEY);
    if (stored) {
      const key = localStorage.getItem(this.SESSION_KEY) ? this.SESSION_KEY : this.SESSION_KEY;
      localStorage.getItem(this.SESSION_KEY)
        ? localStorage.setItem(key, JSON.stringify({ userId: updated.id }))
        : sessionStorage.setItem(key, JSON.stringify({ userId: updated.id }));
    }
  }

  hasPermission(module: keyof User['permissions'], action: string): boolean {
    const user = this._currentUser();
    if (!user) return false;
    const perms = user.permissions[module] as Record<string, boolean>;
    return perms?.[action] ?? false;
  }
}
