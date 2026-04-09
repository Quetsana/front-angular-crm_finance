import {
  Component,
  inject,
  signal,
  computed,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  effect,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { TransactionService } from '../../../core/services/transaction.service';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb.component';
import { SkeletonComponent } from '../../../shared/components/skeleton.component';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../../../core/models/transaction.model';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    RouterLink,
    BreadcrumbComponent,
    SkeletonComponent,
    CurrencyPipe,
  ],
  template: `
    <div class="page animate-fade-in">
      <!-- Breadcrumb -->
      <app-breadcrumb
        [items]="[{ label: 'Finance', route: '/finance/dashboard', translateKey: 'nav.dashboard' }]"
      ></app-breadcrumb>

      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ 'dashboard.title' | translate }}</h1>
          <p class="page-sub">{{ 'dashboard.subtitle' | translate }}</p>
        </div>
        <div class="flex items-center gap-3 flex-wrap">
          <!-- Year filter -->
          <select
            class="form-input form-select w-auto"
            [(ngModel)]="selectedYear"
            (change)="onFilterChange()"
          >
            @for (y of years; track y) {
              <option [value]="y">{{ y }}</option>
            }
          </select>
          <!-- Month filter -->
          <select
            class="form-input form-select w-auto"
            [(ngModel)]="selectedMonth"
            (change)="onFilterChange()"
          >
            <option [value]="0">All Months</option>
            @for (m of months; track m.value) {
              <option [value]="m.value">{{ m.label }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Metric cards -->
      @if (loading()) {
        <div class="cards-grid">
          @for (i of [1, 2, 3, 4]; track i) {
            <app-skeleton type="card"></app-skeleton>
          }
        </div>
      } @else {
        <div class="cards-grid">
          <!-- Total Balance -->
          <div class="metric-card bg-gradient-brand animate-fade-in delay-100">
            <div class="metric-label">{{ 'dashboard.totalBalance' | translate }}</div>
            <div class="metric-value">
              {{ summary().netBalance | currency: 'USD' : 'symbol' : '1.0-0' }}
            </div>
            <div class="metric-trend positive">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
              <span>+{{ growthRate() }}%</span>
              <span class="metric-trend-label">{{ 'dashboard.vsLastMonth' | translate }}</span>
            </div>
            <div class="metric-bg-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1"
                  d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                />
              </svg>
            </div>
          </div>

          <!-- Monthly Income -->
          <div class="metric-card bg-gradient-green animate-fade-in delay-200">
            <div class="metric-label">{{ 'dashboard.monthlyIncome' | translate }}</div>
            <div class="metric-value">
              {{ summary().totalIncome | currency: 'USD' : 'symbol' : '1.0-0' }}
            </div>
            <div class="metric-count">{{ summary().count }} transactions</div>
            <div class="metric-bg-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1"
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </div>
          </div>

          <!-- Monthly Expenses -->
          <div class="metric-card bg-gradient-red animate-fade-in delay-300">
            <div class="metric-label">{{ 'dashboard.monthlyExpenses' | translate }}</div>
            <div class="metric-value">
              {{ summary().totalExpenses | currency: 'USD' : 'symbol' : '1.0-0' }}
            </div>
            <div class="metric-count">
              Net:
              {{
                summary().totalIncome - summary().totalExpenses
                  | currency: 'USD' : 'symbol' : '1.0-0'
              }}
            </div>
            <div class="metric-bg-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1"
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </div>

          <!-- Net Profit -->
          <div class="metric-card bg-gradient-gold animate-fade-in delay-400">
            <div class="metric-label">{{ 'dashboard.netProfit' | translate }}</div>
            <div class="metric-value">{{ margin() }}%</div>
            <div class="metric-count">Profit margin</div>
            <div class="metric-bg-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>
      }

      <!-- Charts row 1 -->
      <div class="charts-grid-2">
        <!-- Income vs Expenses - Line Chart -->
        <div class="card chart-card animate-fade-in delay-200">
          <div class="chart-header">
            <div>
              <h3 class="chart-title">{{ 'dashboard.incomeVsExpenses' | translate }}</h3>
              <p class="chart-sub">{{ selectedYear }} — monthly overview</p>
            </div>
            <div class="flex gap-2">
              <span class="badge badge-success">Income</span>
              <span class="badge badge-danger">Expenses</span>
            </div>
          </div>
          <div class="chart-wrapper chart-h-lg">
            <canvas #lineChart></canvas>
          </div>
        </div>

        <!-- Category Breakdown - Doughnut -->
        <div class="card chart-card animate-fade-in delay-300">
          <div class="chart-header">
            <div>
              <h3 class="chart-title">{{ 'dashboard.categoryBreakdown' | translate }}</h3>
              <p class="chart-sub">Revenue by category</p>
            </div>
          </div>
          <div class="chart-wrapper chart-h-lg">
            <canvas #doughnutChart></canvas>
          </div>
        </div>
      </div>

      <!-- Charts row 2 -->
      <div class="charts-grid-2">
        <!-- Profit Trend - Bar Chart -->
        <div class="card chart-card animate-fade-in delay-300">
          <div class="chart-header">
            <h3 class="chart-title">{{ 'dashboard.profitTrend' | translate }}</h3>
            <span
              class="badge"
              [class]="summary().netBalance >= 0 ? 'badge-success' : 'badge-danger'"
            >
              {{ summary().netBalance >= 0 ? '▲ Positive' : '▼ Negative' }}
            </span>
          </div>
          <div class="chart-wrapper chart-h-md">
            <canvas #barChart></canvas>
          </div>
        </div>

        <!-- Top categories -->
        <div class="card chart-card animate-fade-in delay-400">
          <div class="chart-header">
            <h3 class="chart-title">{{ 'dashboard.topCategories' | translate }}</h3>
          </div>
          <div class="category-list">
            @for (cat of topIncomeCategories(); track cat.name) {
              <div class="cat-row">
                <div class="cat-dot" [style.background]="cat.color"></div>
                <div class="cat-info">
                  <span class="cat-name">{{ cat.name }}</span>
                  <span class="cat-pct">{{ cat.pct }}%</span>
                </div>
                <div class="cat-bar-wrap">
                  <div
                    class="cat-bar"
                    [style.width.%]="cat.pct"
                    [style.background]="cat.color"
                  ></div>
                </div>
                <span class="cat-amount">{{
                  cat.amount | currency: 'USD' : 'symbol' : '1.0-0'
                }}</span>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Recent transactions table -->
      <div class="card animate-fade-in delay-400">
        <div class="chart-header">
          <div>
            <h3 class="chart-title">{{ 'dashboard.recentTransactions' | translate }}</h3>
            <p class="chart-sub">Latest 8 transactions</p>
          </div>
          <a routerLink="/finance/transactions" class="btn btn-ghost btn-sm">
            {{ 'common.viewAll' | translate }}
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>
        <div class="table-container" style="border:none">
          <table class="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Description</th>
                <th>Category</th>
                <th>Date</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              @for (tx of recentTransactions(); track tx.id) {
                <tr>
                  <td>
                    <span
                      class="badge"
                      [class]="tx.type === 'income' ? 'badge-success' : 'badge-danger'"
                    >
                      {{ tx.type === 'income' ? '↑' : '↓' }} {{ tx.type | titlecase }}
                    </span>
                  </td>
                  <td class="text-sm" style="color:var(--text-secondary);max-width:200px">
                    <div class="truncate">{{ tx.description }}</div>
                  </td>
                  <td>
                    <span class="badge badge-purple text-xs">{{ tx.category | titlecase }}</span>
                  </td>
                  <td class="text-sm" style="color:var(--text-muted)">
                    {{ tx.date | date: 'MMM d, y' }}
                  </td>
                  <td
                    class="text-right font-semibold tabular-nums"
                    [style.color]="tx.type === 'income' ? '#4a7c59' : '#dc2626'"
                  >
                    {{ tx.type === 'income' ? '+' : '-'
                    }}{{ tx.amount | currency: 'USD' : 'symbol' : '1.2-2' }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
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

      .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
      }
      .metric-card {
        padding: 1.5rem;
        border-radius: 16px;
        color: white;
        position: relative;
        overflow: hidden;
      }
      .bg-gradient-brand {
        background: linear-gradient(135deg, #8b1538 0%, #6b0f2c 100%);
      }
      .bg-gradient-green {
        background: linear-gradient(135deg, #2d7a45 0%, #1e5232 100%);
      }
      .bg-gradient-red {
        background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
      }
      .bg-gradient-gold {
        background: linear-gradient(135deg, #a07d18 0%, #7d5f12 100%);
      }
      .metric-label {
        font-size: 0.8125rem;
        font-weight: 500;
        opacity: 0.85;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 0.5rem;
      }
      .metric-value {
        font-size: 1.75rem;
        font-weight: 800;
        font-family: var(--font-serif);
        letter-spacing: -0.02em;
      }
      .metric-trend {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.8125rem;
        font-weight: 500;
        margin-top: 0.5rem;
        opacity: 0.9;
      }
      .metric-trend-label {
        opacity: 0.7;
      }
      .metric-count {
        font-size: 0.8125rem;
        opacity: 0.8;
        margin-top: 0.5rem;
      }
      .metric-bg-icon {
        position: absolute;
        right: -10px;
        bottom: -10px;
        width: 80px;
        height: 80px;
        opacity: 0.08;
        color: white;
      }
      .metric-bg-icon svg {
        width: 100%;
        height: 100%;
      }

      .charts-grid-2 {
        display: grid;
        grid-template-columns: 3fr 2fr;
        gap: 1rem;
      }
      .chart-card {
        padding: 1.25rem;
      }
      .chart-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
      }
      .chart-title {
        font-weight: 700;
        font-size: 0.9375rem;
        color: var(--text-primary);
      }
      .chart-sub {
        font-size: 0.75rem;
        color: var(--text-muted);
        margin-top: 0.125rem;
      }

      .category-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .cat-row {
        display: flex;
        align-items: center;
        gap: 0.625rem;
      }
      .cat-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .cat-info {
        display: flex;
        justify-content: space-between;
        min-width: 120px;
        flex-shrink: 0;
      }
      .cat-name {
        font-size: 0.8125rem;
        color: var(--text-secondary);
      }
      .cat-pct {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-muted);
      }
      .cat-bar-wrap {
        flex: 1;
        height: 6px;
        background: var(--border-color);
        border-radius: 3px;
        overflow: hidden;
      }
      .cat-bar {
        height: 100%;
        border-radius: 3px;
        transition: width 0.6s ease;
      }
      .cat-amount {
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--text-primary);
        min-width: 70px;
        text-align: right;
        font-variant-numeric: tabular-nums;
      }

      /* Responsive chart heights */
      .chart-h-lg { height: 280px; }
      .chart-h-md { height: 240px; }

      @media (max-width: 1024px) {
        .charts-grid-2 { grid-template-columns: 1fr; }
        .chart-h-lg { height: 240px; }
        .chart-h-md { height: 200px; }
      }
      @media (max-width: 640px) {
        .metric-value { font-size: 1.4rem; }
        .chart-h-lg { height: 200px; }
        .chart-h-md { height: 180px; }
        .chart-card { padding: 0.875rem; }
        .cat-info { min-width: 90px; }
        .cat-amount { min-width: 55px; font-size: 0.75rem; }
      }
    `,
  ],
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  private txService = inject(TransactionService);

  @ViewChild('lineChart') lineChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('doughnutChart') doughnutChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;

  private charts: Chart[] = [];

  readonly loading = signal(true);
  selectedYear = 2026;
  selectedMonth = 0;

  readonly years = [2025, 2026];
  readonly months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  private filteredTxns = signal(this.txService.getByYear(2026));

  readonly summary = computed(() => this.txService.getSummary(this.filteredTxns()));

  readonly margin = computed(() => {
    const s = this.summary();
    if (!s.totalIncome) return '0.0';
    return ((s.netBalance / s.totalIncome) * 100).toFixed(1);
  });

  readonly growthRate = computed(() => {
    const now = this.filteredTxns();
    const prev = this.txService.getByMonthYear(
      this.selectedMonth ? Math.max(1, this.selectedMonth - 1) : 12,
      this.selectedMonth ? this.selectedYear : this.selectedYear - 1,
    );
    const pIncome = prev.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const cIncome = now.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    if (!pIncome) return '+∞';
    return (((cIncome - pIncome) / pIncome) * 100).toFixed(1);
  });

  readonly recentTransactions = computed(() => this.txService.getAll().slice(0, 8));

  readonly topIncomeCategories = computed(() => {
    const txns = this.filteredTxns().filter((t) => t.type === 'income');
    const total = txns.reduce((s, t) => s + t.amount, 0);
    const bycat: Record<string, number> = {};
    txns.forEach((t) => {
      bycat[t.category] = (bycat[t.category] ?? 0) + t.amount;
    });
    return Object.entries(bycat)
      .map(([cat, amount]) => ({
        name: cat.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        amount,
        pct: total ? Math.round((amount / total) * 100) : 0,
        color: INCOME_CATEGORIES.find((c) => c.value === cat)?.color ?? '#9b8ec4',
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  });

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.loading.set(false);
      setTimeout(() => this.initCharts(), 50);
    }, 600);
  }

  onFilterChange(): void {
    if (this.selectedMonth === 0) {
      this.filteredTxns.set(this.txService.getByYear(this.selectedYear));
    } else {
      this.filteredTxns.set(this.txService.getByMonthYear(this.selectedMonth, this.selectedYear));
    }
    this.destroyCharts();
    setTimeout(() => this.initCharts(), 50);
  }

  private getChartColors() {
    return {
      income: 'rgba(74,124,89',
      expense: 'rgba(220,38,38',
      gold: 'rgba(201,162,39',
      purple: 'rgba(155,142,196',
      brand: 'rgba(139,21,56',
    };
  }

  private initCharts(): void {
    const isDark = document.documentElement.classList.contains('dark');
    const textCol = isDark ? '#d4afc0' : '#4a3040';
    const gridCol = isDark ? 'rgba(61,21,37,.5)' : 'rgba(232,217,226,.7)';

    const monthly = this.txService.getMonthlyData(this.selectedYear);
    const labels = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const incomes = monthly.map((m) => m.income);
    const expenses = monthly.map((m) => m.expenses);
    const profits = monthly.map((m) => m.profit);

    // Line chart
    if (this.lineChartRef) {
      const ctx = this.lineChartRef.nativeElement.getContext('2d')!;
      this.charts.push(
        new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'Income',
                data: incomes,
                borderColor: '#4a7c59',
                backgroundColor: 'rgba(74,124,89,.12)',
                borderWidth: 2.5,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#4a7c59',
                pointRadius: 4,
                pointHoverRadius: 6,
              },
              {
                label: 'Expenses',
                data: expenses,
                borderColor: '#dc2626',
                backgroundColor: 'rgba(220,38,38,.08)',
                borderWidth: 2.5,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#dc2626',
                pointRadius: 4,
                pointHoverRadius: 6,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: isDark ? '#1e0d16' : '#fff',
                titleColor: textCol,
                bodyColor: textCol,
                borderColor: isDark ? '#3d1525' : '#e8d9e2',
                borderWidth: 1,
                callbacks: { label: (ctx) => ` $${(ctx.parsed.y ?? 0).toLocaleString()}` },
              },
            },
            scales: {
              x: { grid: { color: gridCol }, ticks: { color: textCol, font: { size: 11 } } },
              y: {
                grid: { color: gridCol },
                ticks: {
                  color: textCol,
                  font: { size: 11 },
                  callback: (v) => `$${(+v).toLocaleString()}`,
                },
              },
            },
          },
        }),
      );
    }

    // Doughnut chart
    if (this.doughnutChartRef) {
      const ctx = this.doughnutChartRef.nativeElement.getContext('2d')!;
      const cats = this.topIncomeCategories();
      this.charts.push(
        new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: cats.map((c) => c.name),
            datasets: [
              {
                data: cats.map((c) => c.amount),
                backgroundColor: cats.map((c) => c.color),
                borderColor: isDark ? '#1e0d16' : '#fff',
                borderWidth: 3,
                hoverOffset: 8,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
              legend: {
                position: 'bottom',
                labels: { color: textCol, padding: 12, font: { size: 11 }, usePointStyle: true },
              },
              tooltip: {
                backgroundColor: isDark ? '#1e0d16' : '#fff',
                titleColor: textCol,
                bodyColor: textCol,
                borderColor: isDark ? '#3d1525' : '#e8d9e2',
                borderWidth: 1,
                callbacks: { label: (ctx) => ` $${ctx.parsed.toLocaleString()}` },
              },
            },
          },
        }),
      );
    }

    // Bar chart (profit)
    if (this.barChartRef) {
      const ctx = this.barChartRef.nativeElement.getContext('2d')!;
      this.charts.push(
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels,
            datasets: [
              {
                label: 'Net Profit',
                data: profits,
                backgroundColor: profits.map((v) =>
                  v >= 0 ? 'rgba(74,124,89,.75)' : 'rgba(220,38,38,.75)',
                ),
                borderColor: profits.map((v) => (v >= 0 ? '#4a7c59' : '#dc2626')),
                borderWidth: 1.5,
                borderRadius: 6,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: isDark ? '#1e0d16' : '#fff',
                titleColor: textCol,
                bodyColor: textCol,
                borderColor: isDark ? '#3d1525' : '#e8d9e2',
                borderWidth: 1,
                callbacks: { label: (ctx) => ` $${(ctx.parsed.y ?? 0).toLocaleString()}` },
              },
            },
            scales: {
              x: { grid: { display: false }, ticks: { color: textCol, font: { size: 11 } } },
              y: {
                grid: { color: gridCol },
                ticks: {
                  color: textCol,
                  font: { size: 11 },
                  callback: (v) => `$${(+v).toLocaleString()}`,
                },
              },
            },
          },
        }),
      );
    }
  }

  private destroyCharts(): void {
    this.charts.forEach((c) => c.destroy());
    this.charts = [];
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }
}
