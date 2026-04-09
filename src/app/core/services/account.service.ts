import { Injectable, signal } from '@angular/core';
import { User } from '../models/user.model';
import { MOCK_USERS } from '../constants/mock-data';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private _accounts = signal<User[]>([...MOCK_USERS]);
  readonly accounts = this._accounts.asReadonly();

  getAll(): User[] { return this._accounts(); }

  getById(id: string): User | undefined {
    return this._accounts().find(u => u.id === id);
  }

  create(user: Omit<User, 'id' | 'createdAt' | 'lastLogin'>): User {
    const colors = ['#8b1538','#9b8ec4','#c9a227','#4a7c59','#3b82f6','#ef4444'];
    const newUser: User = {
      ...user,
      id: 'usr-' + Date.now().toString(36),
      avatarColor: colors[Math.floor(Math.random() * colors.length)],
      createdAt: new Date().toISOString(),
      lastLogin: '—'
    };
    this._accounts.update(list => [...list, newUser]);
    return newUser;
  }

  update(id: string, partial: Partial<User>): void {
    this._accounts.update(list =>
      list.map(u => u.id === id ? { ...u, ...partial } : u)
    );
  }

  delete(id: string): void {
    this._accounts.update(list => list.filter(u => u.id !== id));
  }
}
