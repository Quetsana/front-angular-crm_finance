import {
  Component,
  inject,
  signal,
  computed,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Chart, registerables } from 'chart.js';
import { AnalysisService } from '../../../core/services/analysis.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { ToastService } from '../../../core/services/toast.service';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb.component';
import { Analysis, AnalysisType } from '../../../core/models/analysis.model';

Chart.register(...registerables);

@Component({
  selector: 'app-ai-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, BreadcrumbComponent, DatePipe],
  template: `
    <div class="page animate-fade-in">
      <app-breadcrumb
        [items]="[
          { label: 'Finance', route: '/finance/dashboard' },
          { label: 'AI Analysis', translateKey: 'nav.aiAnalysis' },
        ]"
      ></app-breadcrumb>

      <div class="page-header">
        <div>
          <h1 class="page-title">{{ 'aiAnalysis.title' | translate }}</h1>
          <p class="page-sub">{{ 'aiAnalysis.subtitle' | translate }}</p>
        </div>
        <button class="btn btn-gold" (click)="generate()" [disabled]="generating()">
          @if (generating()) {
            <svg class="w-4 h-4 spin" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="3"
                stroke-dasharray="60"
                stroke-dashoffset="30"
              />
            </svg>
            Generating...
          } @else {
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            {{ 'aiAnalysis.generateNew' | translate }}
          }
        </button>
      </div>

      <!-- Type filter tabs -->
      <div class="type-tabs animate-fade-in delay-100">
        @for (t of types; track t.value) {
          <button
            class="type-tab"
            [class.active]="selectedType() === t.value"
            (click)="selectedType.set(t.value)"
          >
            <span class="type-icon">{{ t.icon }}</span>
            <span>{{ t.label | translate }}</span>
            <span class="tab-count">{{ countByType(t.value) }}</span>
          </button>
        }
      </div>

      <!-- Selected analysis detail -->
      @if (selectedAnalysis(); as a) {
        <div class="analysis-detail card animate-scale-in">
          <div class="detail-header">
            <div class="flex items-center gap-3">
              <div class="ai-icon">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-bold" style="color:var(--text-primary)">
                  {{ a.periodLabel }}
                </h2>
                <p class="text-sm" style="color:var(--text-muted)">
                  {{ a.type | titlecase }} Analysis · Generated
                  {{ a.createdAt | date: 'MMM d, y, HH:mm' }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="badge badge-brand">{{ a.type | titlecase }}</span>
              <span class="badge" [class]="riskBadge(a.riskLevel)"
                >Risk: {{ a.riskLevel | titlecase }}</span
              >
            </div>
          </div>

          <div class="detail-metrics">
            <div class="detail-metric green">
              <div class="dm-label">Revenue</div>
              <div class="dm-value">\${{ a.metrics.totalRevenue.toLocaleString() }}</div>
            </div>
            <div class="detail-metric red">
              <div class="dm-label">Costs</div>
              <div class="dm-value">\${{ a.metrics.totalCosts.toLocaleString() }}</div>
            </div>
            <div class="detail-metric" [class]="a.metrics.netProfit >= 0 ? 'brand' : 'red'">
              <div class="dm-label">Net Profit</div>
              <div class="dm-value">\${{ a.metrics.netProfit.toLocaleString() }}</div>
            </div>
            <div class="detail-metric gold">
              <div class="dm-label">Margin</div>
              <div class="dm-value">{{ a.metrics.profitMargin.toFixed(1) }}%</div>
            </div>
            <div class="detail-metric purple">
              <div class="dm-label">Score</div>
              <div class="dm-value">{{ a.profitabilityScore }}/100</div>
            </div>
          </div>

          <div class="ai-message">
            <div class="ai-message-header">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              AI Analysis
            </div>
            <div class="ai-message-body">{{ formatMessage(a.llmMessage) }}</div>
          </div>

          <div class="insight-grid">
            <div>
              <h4 class="insight-title">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {{ 'aiAnalysis.insights' | translate }}
              </h4>
              <ul class="insight-list">
                @for (insight of a.insights; track insight) {
                  <li class="insight-item"><span class="insight-dot green"></span>{{ insight }}</li>
                }
              </ul>
            </div>
            <div>
              <h4 class="insight-title">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                {{ 'aiAnalysis.recommendations' | translate }}
              </h4>
              <ul class="insight-list">
                @for (rec of a.recommendations; track rec) {
                  <li class="insight-item"><span class="insight-dot gold"></span>{{ rec }}</li>
                }
              </ul>
            </div>
          </div>

          <div class="mt-4">
            <h4 class="text-sm font-semibold mb-2" style="color:var(--text-secondary)">
              Category Breakdown
            </h4>
            <div style="height:220px">
              <canvas #detailChart></canvas>
            </div>
          </div>
        </div>
      }

      <!-- History list -->
      <div>
        <h3 class="text-base font-bold mb-3" style="color:var(--text-primary)">Analysis History</h3>
        <div class="analysis-grid">
          @for (a of displayedAnalyses(); track a.id) {
            <div
              class="analysis-card"
              [class.selected]="selectedAnalysis()?.id === a.id"
              (click)="selectAnalysis(a)"
            >
              <div class="ac-header">
                <div class="ac-type-badge" [class]="a.type">{{ a.type | titlecase }}</div>
                <span
                  class="badge"
                  [class]="
                    a.trend === 'up'
                      ? 'badge-success'
                      : a.trend === 'down'
                        ? 'badge-danger'
                        : 'badge-warning'
                  "
                >
                  {{ a.trend === 'up' ? '↑' : a.trend === 'down' ? '↓' : '→' }}
                  {{ a.trendPercentage }}%
                </span>
              </div>
              <div class="ac-period">{{ a.periodLabel }}</div>
              <div class="ac-metrics">
                <div class="acm">
                  <div class="acm-label">Revenue</div>
                  <div class="acm-value green">\${{ a.metrics.totalRevenue.toLocaleString() }}</div>
                </div>
                <div class="acm">
                  <div class="acm-label">Profit</div>
                  <div class="acm-value" [class]="a.metrics.netProfit >= 0 ? 'green' : 'red'">
                    \${{ a.metrics.netProfit.toLocaleString() }}
                  </div>
                </div>
                <div class="acm">
                  <div class="acm-label">Margin</div>
                  <div class="acm-value gold">{{ a.metrics.profitMargin.toFixed(1) }}%</div>
                </div>
              </div>
              <div class="score-bar-wrap">
                <div
                  class="score-bar-fill"
                  [style.width.%]="a.profitabilityScore"
                  [style.background]="
                    a.profitabilityScore > 70
                      ? '#4a7c59'
                      : a.profitabilityScore > 40
                        ? '#c9a227'
                        : '#dc2626'
                  "
                ></div>
              </div>
              <div class="text-xs mt-1" style="color:var(--text-muted)">
                Score: {{ a.profitabilityScore }}/100 · {{ a.createdAt | date: 'MMM d, y' }}
              </div>
            </div>
          }
          @if (displayedAnalyses().length === 0) {
            <div class="col-span-full text-center py-16" style="color:var(--text-muted)">
              <div
                class="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style="background:rgba(139,21,56,.08)"
              >
                <svg
                  class="w-8 h-8"
                  style="color:var(--brand)"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <p class="font-semibold">{{ 'aiAnalysis.noAnalysis' | translate }}</p>
            </div>
          }
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
      .spin {
        animation: spin-slow 1s linear infinite;
      }
      .type-tabs {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
      .type-tab {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1.125rem;
        border-radius: 10px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        border: 1.5px solid var(--border-color);
        background: var(--bg-card);
        color: var(--text-secondary);
        transition: all 0.2s;
      }
      .type-tab:hover {
        border-color: var(--brand);
        color: var(--brand);
      }
      .type-tab.active {
        border-color: var(--brand);
        background: var(--brand);
        color: white;
      }
      .type-icon {
        display: flex;
      }
      .tab-count {
        font-size: 0.75rem;
        padding: 0.1rem 0.4rem;
        border-radius: 9999px;
        background: rgba(255, 255, 255, 0.2);
        font-weight: 700;
      }
      .type-tab:not(.active) .tab-count {
        background: rgba(139, 21, 56, 0.1);
        color: var(--brand);
      }
      .analysis-detail {
        padding: 1.5rem;
      }
      .detail-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
        margin-bottom: 1.25rem;
      }
      .ai-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        flex-shrink: 0;
        background: linear-gradient(135deg, var(--brand) 0%, var(--brand-dark) 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 4px 12px rgba(139, 21, 56, 0.3);
      }
      .detail-metrics {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 0.75rem;
        margin-bottom: 1.25rem;
      }
      .detail-metric {
        padding: 1rem;
        border-radius: 10px;
        color: white;
      }
      .detail-metric.green {
        background: linear-gradient(135deg, #2d7a45, #1e5232);
      }
      .detail-metric.red {
        background: linear-gradient(135deg, #b91c1c, #991b1b);
      }
      .detail-metric.brand {
        background: linear-gradient(135deg, #8b1538, #6b0f2c);
      }
      .detail-metric.gold {
        background: linear-gradient(135deg, #a07d18, #7d5f12);
      }
      .detail-metric.purple {
        background: linear-gradient(135deg, #7d6ea8, #4c4069);
      }
      .dm-label {
        font-size: 0.7rem;
        opacity: 0.8;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin-bottom: 0.375rem;
      }
      .dm-value {
        font-size: 1.25rem;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
      }
      .ai-message {
        padding: 1.125rem;
        border-radius: 12px;
        background: rgba(139, 21, 56, 0.04);
        border: 1px solid rgba(139, 21, 56, 0.12);
        margin-bottom: 1.25rem;
      }
      .ai-message-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.8125rem;
        font-weight: 700;
        color: var(--brand);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin-bottom: 0.75rem;
      }
      .ai-message-body {
        font-size: 0.875rem;
        line-height: 1.7;
        color: var(--text-secondary);
        white-space: pre-wrap;
      }
      .insight-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.25rem;
        margin-bottom: 1rem;
      }
      .insight-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 0.75rem;
      }
      .insight-title svg {
        color: var(--brand);
      }
      .insight-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .insight-item {
        display: flex;
        align-items: flex-start;
        gap: 0.625rem;
        font-size: 0.8125rem;
        color: var(--text-secondary);
        line-height: 1.5;
      }
      .insight-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
        margin-top: 5px;
      }
      .insight-dot.green {
        background: var(--green);
      }
      .insight-dot.gold {
        background: var(--accent);
      }
      .analysis-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1rem;
      }
      .analysis-card {
        padding: 1.125rem;
        border-radius: 12px;
        border: 2px solid var(--border-color);
        background: var(--bg-card);
        cursor: pointer;
        transition: all 0.2s;
      }
      .analysis-card:hover {
        border-color: var(--brand);
        box-shadow: var(--shadow-md);
        transform: translateY(-1px);
      }
      .analysis-card.selected {
        border-color: var(--brand);
        box-shadow: 0 0 0 3px rgba(139, 21, 56, 0.12);
      }
      .ac-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.625rem;
      }
      .ac-type-badge {
        font-size: 0.75rem;
        font-weight: 700;
        padding: 0.15rem 0.6rem;
        border-radius: 9999px;
        color: white;
      }
      .ac-type-badge.daily {
        background: var(--brand);
      }
      .ac-type-badge.weekly {
        background: var(--accent-dark);
      }
      .ac-type-badge.monthly {
        background: #7d6ea8;
      }
      .ac-period {
        font-size: 0.9375rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 0.75rem;
      }
      .ac-metrics {
        display: flex;
        gap: 1rem;
        margin-bottom: 0.75rem;
      }
      .acm {
        flex: 1;
      }
      .acm-label {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--text-muted);
        margin-bottom: 0.2rem;
      }
      .acm-value {
        font-size: 0.9375rem;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
      }
      .acm-value.green {
        color: #4a7c59;
      }
      .acm-value.red {
        color: #dc2626;
      }
      .acm-value.gold {
        color: var(--accent-dark);
      }
      .score-bar-wrap {
        height: 6px;
        background: var(--border-color);
        border-radius: 3px;
        overflow: hidden;
      }
      .score-bar-fill {
        height: 100%;
        border-radius: 3px;
        transition: width 0.8s ease;
      }
      @media (max-width: 640px) {
        .insight-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AiAnalysisComponent implements AfterViewInit, OnDestroy {
  private analysisService = inject(AnalysisService);
  private txService = inject(TransactionService);
  private toast = inject(ToastService);

  @ViewChild('detailChart') detailChartRef?: ElementRef<HTMLCanvasElement>;
  private charts: Chart[] = [];

  readonly generating = signal(false);
  readonly selectedType = signal<AnalysisType>('monthly');
  readonly selectedAnalysis = signal<Analysis | null>(this.analysisService.getAll()[0] ?? null);

  readonly types = [
    {
      value: 'monthly' as AnalysisType,
      label: 'aiAnalysis.monthly',
      icon: 'M',
    },
    {
      value: 'weekly' as AnalysisType,
      label: 'aiAnalysis.weekly',
      icon: 'W',
    },
    {
      value: 'daily' as AnalysisType,
      label: 'aiAnalysis.daily',
      icon: 'D',
    },
  ];

  readonly displayedAnalyses = computed(() => this.analysisService.getByType(this.selectedType()));

  countByType(type: AnalysisType): number {
    return this.analysisService.getByType(type).length;
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.renderDetailChart(), 100);
  }

  selectAnalysis(a: Analysis): void {
    this.selectedAnalysis.set(a);
    this.destroyCharts();
    setTimeout(() => this.renderDetailChart(), 50);
  }

  generate(): void {
    this.generating.set(true);
    setTimeout(() => {
      const now = new Date();
      const txns = this.txService.getByMonthYear(now.getMonth() + 1, now.getFullYear());
      const s = this.txService.getSummary(txns);
      const catEntries = Object.entries(s.byCategory);
      const top = catEntries.sort((a, b) => b[1] - a[1])[0];
      const metrics = {
        totalRevenue: s.totalIncome,
        totalCosts: s.totalExpenses,
        netProfit: s.netBalance,
        profitMargin: s.totalIncome ? (s.netBalance / s.totalIncome) * 100 : 0,
        topCategory: top?.[0] ?? 'N/A',
        topCategoryRevenue: top ? Math.abs(top[1]) : 0,
        transactionCount: s.count,
        avgTransactionValue: s.count ? s.totalIncome / s.count : 0,
        categoryBreakdown: {} as Record<string, { revenue: number; costs: number; count: number }>,
      };
      const analysis = this.analysisService.generateAnalysis(this.selectedType(), metrics);
      this.generating.set(false);
      this.selectedAnalysis.set(analysis);
      this.toast.success('Analysis generated', 'AI analysis is ready');
      this.destroyCharts();
      setTimeout(() => this.renderDetailChart(), 100);
    }, 1800);
  }

  private renderDetailChart(): void {
    const a = this.selectedAnalysis();
    if (!a || !this.detailChartRef) return;

    const isDark = document.documentElement.classList.contains('dark');
    const textCol = isDark ? '#d4afc0' : '#4a3040';
    const gridCol = isDark ? 'rgba(61,21,37,.5)' : 'rgba(232,217,226,.7)';

    const cats = Object.entries(a.metrics.categoryBreakdown);
    const labels = cats.map(([k]) => k.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()));
    const revenues = cats.map(([, v]) => v.revenue);
    const costs = cats.map(([, v]) => v.costs);

    const ctx = this.detailChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.charts.push(
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Revenue',
              data: revenues,
              backgroundColor: 'rgba(74,124,89,.75)',
              borderColor: '#4a7c59',
              borderWidth: 1.5,
              borderRadius: 4,
            },
            {
              label: 'Costs',
              data: costs,
              backgroundColor: 'rgba(220,38,38,.65)',
              borderColor: '#dc2626',
              borderWidth: 1.5,
              borderRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: { color: textCol, usePointStyle: true, padding: 12, font: { size: 11 } },
            },
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
            x: {
              grid: { display: false },
              ticks: { color: textCol, font: { size: 10 }, maxRotation: 35 },
            },
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

  private destroyCharts(): void {
    this.charts.forEach((c) => c.destroy());
    this.charts = [];
  }
  ngOnDestroy(): void {
    this.destroyCharts();
  }

  formatMessage(msg: string): string {
    return msg.replace(/\*\*(.*?)\*\*/g, '$1');
  }

  riskBadge(risk: string): string {
    return (
      { low: 'badge-success', medium: 'badge-warning', high: 'badge-danger' }[risk] ?? 'badge-info'
    );
  }
}
