import { Injectable, signal, computed } from '@angular/core';

export interface AppNotification {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  route?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _notifications = signal<AppNotification[]>([
    {
      id: 'n1',
      type: 'monthly',
      title: 'Monthly Analysis Ready',
      message: 'Your April 2026 monthly AI financial analysis has been generated.',
      read: false,
      createdAt: new Date(Date.now() - 3 * 60 * 1000),
      route: '/finance/ai-analysis',
    },
    {
      id: 'n2',
      type: 'weekly',
      title: 'Weekly Analysis Ready',
      message: 'Week 15, 2026 weekly report is now available for review.',
      read: false,
      createdAt: new Date(Date.now() - 52 * 60 * 1000),
      route: '/finance/ai-analysis',
    },
    {
      id: 'n3',
      type: 'daily',
      title: 'Daily Analysis Ready',
      message: "Today's daily financial analysis report has been processed.",
      read: true,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      route: '/finance/ai-analysis',
    },
  ]);

  readonly notifications = this._notifications.asReadonly();
  readonly unreadCount = computed(() => this._notifications().filter((n) => !n.read).length);

  markRead(id: string): void {
    this._notifications.update((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  markAllRead(): void {
    this._notifications.update((ns) => ns.map((n) => ({ ...n, read: true })));
  }

  addNotification(n: Omit<AppNotification, 'id' | 'createdAt'>): void {
    this._notifications.update((ns) => [
      { ...n, id: 'n-' + Date.now().toString(36), createdAt: new Date() },
      ...ns,
    ]);
  }

  timeAgo(date: Date): string {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  typeLabel(type: AppNotification['type']): string {
    return { daily: 'D', weekly: 'W', monthly: 'M', system: '⚙' }[type];
  }

  typeColor(type: AppNotification['type']): string {
    return (
      {
        daily: 'var(--brand)',
        weekly: 'var(--accent-dark)',
        monthly: '#7d6ea8',
        system: 'var(--info)',
      }[type] ?? 'var(--brand)'
    );
  }
}
