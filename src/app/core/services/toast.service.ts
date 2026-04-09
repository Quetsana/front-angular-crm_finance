import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  private add(toast: Omit<Toast, 'id'>): void {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    const t: Toast = { id, duration: 4000, ...toast };
    this.toasts.update(list => [...list, t]);
    setTimeout(() => this.remove(id), t.duration);
  }

  remove(id: string): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  success(title: string, message?: string): void {
    this.add({ type: 'success', title, message });
  }
  error(title: string, message?: string): void {
    this.add({ type: 'error', title, message, duration: 6000 });
  }
  warning(title: string, message?: string): void {
    this.add({ type: 'warning', title, message });
  }
  info(title: string, message?: string): void {
    this.add({ type: 'info', title, message });
  }
}
