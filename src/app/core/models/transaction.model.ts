export type TransactionType = 'income' | 'expense';

export type IncomeCategory =
  | 'gym_membership_basic'
  | 'gym_membership_premium'
  | 'product_sales'
  | 'services'
  | 'other_income';

export type ExpenseCategory =
  | 'suppliers'
  | 'utilities'
  | 'maintenance'
  | 'salaries'
  | 'rent'
  | 'marketing'
  | 'equipment'
  | 'other_expense';

export type TransactionCategory = IncomeCategory | ExpenseCategory;

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;           // always stored as positive; displayed with sign
  category: TransactionCategory;
  description: string;
  date: string;             // ISO date string
  reference?: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  count: number;
  byCategory: Record<string, number>;
}

export const INCOME_CATEGORIES: Array<{ value: IncomeCategory; labelKey: string; color: string }> = [
  { value: 'gym_membership_basic',   labelKey: 'Gym Basic ($20)',    color: '#4a7c59' },
  { value: 'gym_membership_premium', labelKey: 'Gym Premium ($40)',  color: '#2d7a45' },
  { value: 'product_sales',          labelKey: 'Product Sales',      color: '#c9a227' },
  { value: 'services',               labelKey: 'Services',           color: '#9b8ec4' },
  { value: 'other_income',           labelKey: 'Other Income',       color: '#3b82f6' },
];

export const EXPENSE_CATEGORIES: Array<{ value: ExpenseCategory; labelKey: string; color: string }> = [
  { value: 'suppliers',    labelKey: 'Suppliers',    color: '#dc2626' },
  { value: 'utilities',    labelKey: 'Utilities',    color: '#ef4444' },
  { value: 'maintenance',  labelKey: 'Maintenance',  color: '#f87171' },
  { value: 'salaries',     labelKey: 'Salaries',     color: '#b91c1c' },
  { value: 'rent',         labelKey: 'Rent',         color: '#991b1b' },
  { value: 'marketing',    labelKey: 'Marketing',    color: '#f59e0b' },
  { value: 'equipment',    labelKey: 'Equipment',    color: '#d97706' },
  { value: 'other_expense',labelKey: 'Other Expense',color: '#fbbf24' },
];
