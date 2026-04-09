export * from './user.model';
export * from './transaction.model';
export * from './account.model';
export * from './analysis.model';

export interface BreadcrumbItem {
  label: string;
  route?: string;
  translateKey?: string;
}

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface PagedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface FilterState {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  category?: string;
  type?: string;
  role?: string;
  minAmount?: number;
  maxAmount?: number;
  month?: number;
  year?: number;
}
