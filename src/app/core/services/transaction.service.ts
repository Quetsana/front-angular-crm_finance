import { Injectable, signal, computed } from '@angular/core';
import { Transaction, TransactionSummary } from '../models/transaction.model';
import { MOCK_TRANSACTIONS } from '../constants/mock-data';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private _transactions = signal<Transaction[]>([...MOCK_TRANSACTIONS]);
  readonly transactions = this._transactions.asReadonly();

  getAll(): Transaction[] {
    return this._transactions();
  }

  getById(id: string): Transaction | undefined {
    return this._transactions().find(t => t.id === id);
  }

  getByMonthYear(month: number, year: number): Transaction[] {
    return this._transactions().filter(t => {
      const d = new Date(t.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });
  }

  getByYear(year: number): Transaction[] {
    return this._transactions().filter(t => new Date(t.date).getFullYear() === year);
  }

  create(tx: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
    const newTx: Transaction = {
      ...tx,
      id: 'tx-' + Date.now().toString(36),
      createdAt: new Date().toISOString()
    };
    this._transactions.update(list => [newTx, ...list]);
    return newTx;
  }

  update(id: string, partial: Partial<Transaction>): void {
    this._transactions.update(list =>
      list.map(t => t.id === id ? { ...t, ...partial } : t)
    );
  }

  delete(id: string): void {
    this._transactions.update(list => list.filter(t => t.id !== id));
  }

  getSummary(txns: Transaction[]): TransactionSummary {
    const totalIncome   = txns.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0);
    const totalExpenses = txns.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0);
    const byCategory: Record<string, number> = {};
    txns.forEach(t => {
      byCategory[t.category] = (byCategory[t.category] ?? 0) + (t.type === 'income' ? t.amount : -t.amount);
    });
    return { totalIncome, totalExpenses, netBalance: totalIncome - totalExpenses, count: txns.length, byCategory };
  }

  getMonthlyData(year: number): Array<{ month: number; income: number; expenses: number; profit: number }> {
    return Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const txns = this.getByMonthYear(m, year);
      const income   = txns.filter(t => t.type === 'income').reduce((s,t)  => s + t.amount, 0);
      const expenses = txns.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0);
      return { month: m, income, expenses, profit: income - expenses };
    });
  }
}
