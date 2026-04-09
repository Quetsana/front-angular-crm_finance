import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { TransactionService } from '../../../core/services/transaction.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb.component';
import { SkeletonComponent } from '../../../shared/components/skeleton.component';
import { Transaction, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../../../core/models/transaction.model';

type ViewMode = 'table' | 'cards' | 'list';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, BreadcrumbComponent, SkeletonComponent, CurrencyPipe, DatePipe],
  template: `
    <div class="page animate-fade-in">
      <app-breadcrumb [items]="[
        {label:'Finance',route:'/finance/dashboard'},
        {label:'Transactions',translateKey:'nav.transactions'}
      ]"></app-breadcrumb>

      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ 'transactions.title' | translate }}</h1>
          <p class="page-sub">{{ 'transactions.subtitle' | translate }}</p>
        </div>
        <div class="flex gap-2 flex-wrap">
          <button class="btn btn-ghost btn-sm" (click)="offcanvasOpen.set(true)">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
            </svg>
            {{ 'common.filters' | translate }}
            @if (activeFilterCount() > 0) {
              <span class="badge badge-brand ml-1">{{ activeFilterCount() }}</span>
            }
          </button>
          <button class="btn btn-primary btn-sm" (click)="openCreateModal()">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            {{ 'transactions.addTransaction' | translate }}
          </button>
        </div>
      </div>

      <!-- Mini summary cards -->
      <div class="cards-grid-4 animate-fade-in delay-100">
        <div class="mini-card green">
          <div class="mini-label">{{ 'transactions.totalIncome' | translate }}</div>
          <div class="mini-value">{{ summary().totalIncome | currency:'USD':'symbol':'1.0-0' }}</div>
        </div>
        <div class="mini-card red">
          <div class="mini-label">{{ 'transactions.totalExpenses' | translate }}</div>
          <div class="mini-value">{{ summary().totalExpenses | currency:'USD':'symbol':'1.0-0' }}</div>
        </div>
        <div class="mini-card" [class]="summary().netBalance >= 0 ? 'brand' : 'red-dark'">
          <div class="mini-label">{{ 'transactions.netBalance' | translate }}</div>
          <div class="mini-value">{{ summary().netBalance | currency:'USD':'symbol':'1.0-0' }}</div>
        </div>
        <div class="mini-card purple">
          <div class="mini-label">{{ 'transactions.transactionCount' | translate }}</div>
          <div class="mini-value">{{ summary().count }}</div>
        </div>
      </div>

      <!-- Table card -->
      <div class="card animate-fade-in delay-200">
        <!-- Toolbar -->
        <div class="table-toolbar">
          <!-- Type quick filter -->
          <div class="type-quick-filter">
            <button class="tqf-btn" [class.active]="filterType() === ''" (click)="setTypeFilter('')">
              All
            </button>
            <button class="tqf-btn income" [class.active]="filterType() === 'income'" (click)="setTypeFilter('income')">
              ↑ Income
            </button>
            <button class="tqf-btn expense" [class.active]="filterType() === 'expense'" (click)="setTypeFilter('expense')">
              ↓ Expense
            </button>
          </div>

          <!-- Search -->
          <div class="relative flex-1 max-w-72">
            <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style="color:var(--text-muted)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input class="form-input pl-9 w-full" type="text"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event); page.set(1)"
              placeholder="Search transactions...">
          </div>

          <!-- Right: records count + page size + view toggle -->
          <div class="flex gap-2 items-center ml-auto">
            <span class="text-xs hide-mobile" style="color:var(--text-muted)">
              {{ filteredTxns().length }} records
            </span>
            <select class="form-input form-select w-auto text-sm" [ngModel]="pageSize()" (ngModelChange)="pageSize.set(+$event); page.set(1)">
              <option [value]="10">10</option>
              <option [value]="25">25</option>
              <option [value]="50">50</option>
            </select>
            <!-- View mode toggle -->
            <div class="view-toggle">
              <button class="vtb" [class.active]="viewMode() === 'table'" (click)="viewMode.set('table')" title="Table view">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 6h18M3 14h18M3 18h18"/>
                </svg>
              </button>
              <button class="vtb" [class.active]="viewMode() === 'cards'" (click)="viewMode.set('cards')" title="Cards view">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                </svg>
              </button>
              <button class="vtb" [class.active]="viewMode() === 'list'" (click)="viewMode.set('list')" title="List view">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Loading skeleton -->
        @if (loading()) {
          <div class="p-4">
            @for (i of [1,2,3,4,5]; track i) {
              <app-skeleton type="table-row" [rows]="[i]"></app-skeleton>
            }
          </div>
        } @else {

          <!-- ─── TABLE VIEW ─── -->
          @if (viewMode() === 'table') {
            <div class="table-container" style="border:none;border-radius:0">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th class="hide-mobile">Reference</th>
                    <th class="hide-mobile">Date</th>
                    <th class="text-right">Amount</th>
                    <th class="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (tx of paginatedTxns(); track tx.id) {
                    <tr class="animate-fade-in">
                      <td>
                        <span class="badge" [class]="tx.type === 'income' ? 'badge-success' : 'badge-danger'">
                          {{ tx.type === 'income' ? '↑' : '↓' }} {{ tx.type | titlecase }}
                        </span>
                      </td>
                      <td style="max-width:200px">
                        <div class="text-sm font-medium truncate" style="color:var(--text-primary)">{{ tx.description }}</div>
                        @if (tx.notes) {
                          <div class="text-xs truncate" style="color:var(--text-muted)">{{ tx.notes }}</div>
                        }
                      </td>
                      <td>
                        <span class="badge badge-purple text-xs">{{ getCategoryLabel(tx.category) }}</span>
                      </td>
                      <td class="text-xs font-mono hide-mobile" style="color:var(--text-muted)">{{ tx.reference ?? '—' }}</td>
                      <td class="text-sm hide-mobile" style="color:var(--text-secondary)">{{ tx.date | date:'MMM d, y' }}</td>
                      <td class="text-right font-semibold tabular-nums text-sm"
                        [style.color]="tx.type === 'income' ? '#4a7c59' : '#dc2626'">
                        {{ tx.type === 'income' ? '+' : '-' }}{{ tx.amount | currency:'USD':'symbol':'1.2-2' }}
                      </td>
                      <td>
                        <div class="flex justify-center gap-1">
                          <button class="btn btn-ghost btn-icon btn-sm" (click)="openEditModal(tx)" title="Edit">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                          </button>
                          <button class="btn btn-ghost btn-icon btn-sm" style="color:var(--danger)"
                            (click)="confirmDelete(tx)" title="Delete">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                  @if (filteredTxns().length === 0) {
                    <tr><td colspan="7" class="text-center py-12" style="color:var(--text-muted)">
                      <div class="flex flex-col items-center gap-2">
                        <svg class="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                        {{ 'transactions.noTransactions' | translate }}
                      </div>
                    </td></tr>
                  }
                </tbody>
              </table>
            </div>
          }

          <!-- ─── CARDS VIEW ─── -->
          @if (viewMode() === 'cards') {
            @if (filteredTxns().length === 0) {
              <div class="empty-state">
                <svg class="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                {{ 'transactions.noTransactions' | translate }}
              </div>
            } @else {
              <div class="tx-cards-grid p-4">
                @for (tx of paginatedTxns(); track tx.id) {
                  <div class="tx-card animate-fade-in">
                    <div class="tx-card-top">
                      <span class="badge" [class]="tx.type === 'income' ? 'badge-success' : 'badge-danger'">
                        {{ tx.type === 'income' ? '↑' : '↓' }} {{ tx.type | titlecase }}
                      </span>
                      <span class="tx-card-amount" [style.color]="tx.type === 'income' ? '#4a7c59' : '#dc2626'">
                        {{ tx.type === 'income' ? '+' : '-' }}{{ tx.amount | currency:'USD':'symbol':'1.2-2' }}
                      </span>
                    </div>
                    <div class="tx-card-desc">{{ tx.description }}</div>
                    @if (tx.notes) {
                      <div class="tx-card-notes">{{ tx.notes }}</div>
                    }
                    <div class="tx-card-meta">
                      <span class="badge badge-purple" style="font-size:.7rem">{{ getCategoryLabel(tx.category) }}</span>
                      <span class="text-xs" style="color:var(--text-muted)">{{ tx.date | date:'MMM d, y' }}</span>
                    </div>
                    <div class="tx-card-footer">
                      <span class="text-xs font-mono" style="color:var(--text-muted)">{{ tx.reference ?? '—' }}</span>
                      <div class="flex gap-1">
                        <button class="btn btn-ghost btn-icon btn-sm" (click)="openEditModal(tx)" title="Edit">
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                        <button class="btn btn-ghost btn-icon btn-sm" style="color:var(--danger)" (click)="confirmDelete(tx)" title="Delete">
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          }

          <!-- ─── LIST VIEW ─── -->
          @if (viewMode() === 'list') {
            @if (filteredTxns().length === 0) {
              <div class="empty-state">
                <svg class="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                {{ 'transactions.noTransactions' | translate }}
              </div>
            } @else {
              <div class="tx-list-view">
                @for (tx of paginatedTxns(); track tx.id) {
                  <div class="tx-list-row animate-fade-in">
                    <div class="tlr-indicator" [style.background]="tx.type === 'income' ? '#4a7c59' : '#dc2626'"></div>
                    <div class="tlr-main">
                      <span class="tlr-desc">{{ tx.description }}</span>
                      <span class="badge badge-purple" style="font-size:.65rem">{{ getCategoryLabel(tx.category) }}</span>
                    </div>
                    <div class="tlr-date hide-mobile">{{ tx.date | date:'MMM d' }}</div>
                    <div class="tlr-amount" [style.color]="tx.type === 'income' ? '#4a7c59' : '#dc2626'">
                      {{ tx.type === 'income' ? '+' : '-' }}{{ tx.amount | currency:'USD':'symbol':'1.2-2' }}
                    </div>
                    <div class="flex gap-1">
                      <button class="btn btn-ghost btn-icon btn-sm" (click)="openEditModal(tx)">
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <button class="btn btn-ghost btn-icon btn-sm" style="color:var(--danger)" (click)="confirmDelete(tx)">
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          }

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="flex items-center justify-between px-4 py-3 border-t" style="border-color:var(--border-color)">
              <span class="text-sm" style="color:var(--text-muted)">
                Page {{ page() }} of {{ totalPages() }}
              </span>
              <div class="flex gap-1">
                <button class="btn btn-ghost btn-sm btn-icon" [disabled]="page() <= 1" (click)="page.update(p=>p-1)">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                </button>
                @for (p of pageNumbers(); track p) {
                  <button class="btn btn-sm btn-icon"
                    [class]="p === page() ? 'btn-primary' : 'btn-ghost'"
                    (click)="page.set(p)">{{ p }}</button>
                }
                <button class="btn btn-ghost btn-sm btn-icon" [disabled]="page() >= totalPages()" (click)="page.update(p=>p+1)">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>
          }
        }
      </div>
    </div>

    <!-- ── Filters Offcanvas ── -->
    @if (offcanvasOpen()) {
      <div class="offcanvas-backdrop" (click)="offcanvasOpen.set(false)"></div>
      <div class="offcanvas-panel animate-fade-right p-5">
        <div class="flex items-center justify-between mb-5">
          <h3 class="font-bold text-lg" style="color:var(--text-primary)">{{ 'transactions.filterTitle' | translate }}</h3>
          <button class="btn btn-ghost btn-icon" (click)="offcanvasOpen.set(false)">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="flex flex-col gap-4">
          <div>
            <label class="form-label">Type</label>
            <select class="form-input form-select"
              [ngModel]="filterType()" (ngModelChange)="filterType.set($event); page.set(1)">
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div>
            <label class="form-label">Category</label>
            <select class="form-input form-select"
              [ngModel]="filterCategory()" (ngModelChange)="filterCategory.set($event); page.set(1)">
              <option value="">All Categories</option>
              @for (c of allCategories; track c.value) {
                <option [value]="c.value">{{ c.labelKey }}</option>
              }
            </select>
          </div>
          <div>
            <label class="form-label">Date From</label>
            <input class="form-input" type="date"
              [ngModel]="filterDateFrom()" (ngModelChange)="filterDateFrom.set($event); page.set(1)">
          </div>
          <div>
            <label class="form-label">Date To</label>
            <input class="form-input" type="date"
              [ngModel]="filterDateTo()" (ngModelChange)="filterDateTo.set($event); page.set(1)">
          </div>
          <div>
            <label class="form-label">Min Amount ($)</label>
            <input class="form-input" type="number"
              [ngModel]="filterMinAmt()" (ngModelChange)="filterMinAmt.set($event); page.set(1)" placeholder="0">
          </div>
          <div>
            <label class="form-label">Max Amount ($)</label>
            <input class="form-input" type="number"
              [ngModel]="filterMaxAmt()" (ngModelChange)="filterMaxAmt.set($event); page.set(1)" placeholder="9999">
          </div>
        </div>

        <div class="flex gap-2 mt-6">
          <button class="btn btn-ghost flex-1" (click)="clearFilters()">{{ 'common.clear' | translate }}</button>
          <button class="btn btn-primary flex-1" (click)="offcanvasOpen.set(false)">{{ 'common.apply' | translate }}</button>
        </div>
      </div>
    }

    <!-- ── Create/Edit Modal ── -->
    @if (modalOpen()) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal-panel" style="max-width:540px" (click)="$event.stopPropagation()">
          <div class="p-6 border-b" style="border-color:var(--border-color)">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-bold" style="color:var(--text-primary)">
                {{ editingTx() ? ('transactions.editTransaction' | translate) : ('transactions.addTransaction' | translate) }}
              </h2>
              <button class="btn btn-ghost btn-icon" (click)="closeModal()">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
          <div class="p-6">
            <div class="flex gap-2 mb-5">
              <button class="flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all"
                [class]="form.type==='income' ? 'btn-primary' : 'btn-ghost'"
                (click)="form.type='income'; form.category=''">↑ Income</button>
              <button class="flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all"
                [class]="form.type==='expense' ? 'btn-danger' : 'btn-ghost'"
                (click)="form.type='expense'; form.category=''">↓ Expense</button>
            </div>

            @if (form.type === 'expense') {
              <div class="mb-4 px-3 py-2 rounded-lg text-xs" style="background:rgba(220,38,38,.08);color:#dc2626;border:1px solid rgba(220,38,38,.2)">
                {{ 'transactions.expenseNote' | translate }}
              </div>
            }

            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2">
                <label class="form-label">{{ 'transactions.description' | translate }} *</label>
                <input class="form-input" [(ngModel)]="form.description" placeholder="Description...">
              </div>
              <div>
                <label class="form-label">{{ 'transactions.amount' | translate }} *</label>
                <input class="form-input" type="number" min="0.01" step="0.01" [(ngModel)]="form.amount" placeholder="0.00">
              </div>
              <div>
                <label class="form-label">{{ 'transactions.date' | translate }} *</label>
                <input class="form-input" type="date" [(ngModel)]="form.date">
              </div>
              <div>
                <label class="form-label">{{ 'transactions.category' | translate }} *</label>
                <select class="form-input form-select" [(ngModel)]="form.category">
                  <option value="">Select category...</option>
                  @for (c of currentCategories(); track c.value) {
                    <option [value]="c.value">{{ c.labelKey }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="form-label">{{ 'transactions.reference' | translate }}</label>
                <input class="form-input" [(ngModel)]="form.reference" placeholder="REF-001">
              </div>
              <div class="col-span-2">
                <label class="form-label">{{ 'transactions.notes' | translate }}</label>
                <textarea class="form-input" rows="2" [(ngModel)]="form.notes" placeholder="Optional notes..."></textarea>
              </div>
            </div>

            @if (formError()) {
              <div class="mt-3 text-sm text-red-500 flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {{ formError() }}
              </div>
            }
          </div>
          <div class="p-6 pt-0 flex gap-3 justify-end">
            <button class="btn btn-ghost" (click)="closeModal()">{{ 'common.cancel' | translate }}</button>
            <button class="btn btn-primary" (click)="saveTransaction()">{{ 'common.save' | translate }}</button>
          </div>
        </div>
      </div>
    }

    <!-- Delete confirm -->
    @if (deleteTarget()) {
      <div class="modal-backdrop" (click)="deleteTarget.set(null)">
        <div class="modal-panel" style="max-width:380px" (click)="$event.stopPropagation()">
          <div class="p-6 text-center">
            <div class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style="background:rgba(220,38,38,.1)">
              <svg class="w-6 h-6" style="color:#dc2626" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </div>
            <h3 class="font-bold text-lg mb-2" style="color:var(--text-primary)">Delete Transaction</h3>
            <p class="text-sm mb-5" style="color:var(--text-muted)">{{ 'transactions.deleteConfirm' | translate }}</p>
            <div class="flex gap-3">
              <button class="btn btn-ghost flex-1" (click)="deleteTarget.set(null)">{{ 'common.cancel' | translate }}</button>
              <button class="btn btn-danger flex-1" (click)="doDelete()">{{ 'common.delete' | translate }}</button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-top: .5rem; }
    .page-title { font-family: var(--font-serif); font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
    .page-sub { font-size: .875rem; color: var(--text-muted); margin-top: .25rem; }
    .cards-grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px,1fr)); gap: 1rem; }
    .mini-card { padding: 1.125rem 1.25rem; border-radius: 12px; color: white; transition: transform .2s ease, box-shadow .2s ease; }
    .mini-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
    .mini-card.green  { background: linear-gradient(135deg,#2d7a45,#1e5232); }
    .mini-card.red    { background: linear-gradient(135deg,#b91c1c,#991b1b); }
    .mini-card.brand  { background: linear-gradient(135deg,#8b1538,#6b0f2c); }
    .mini-card.red-dark { background: linear-gradient(135deg,#7f1d1d,#450a0a); }
    .mini-card.purple { background: linear-gradient(135deg,#7d6ea8,#4c4069); }
    .mini-label { font-size: .75rem; font-weight: 500; opacity: .85; text-transform: uppercase; letter-spacing: .04em; margin-bottom: .5rem; }
    .mini-value { font-size: 1.375rem; font-weight: 800; font-variant-numeric: tabular-nums; }
    textarea.form-input { resize: vertical; }
    /* Toolbar */
    .table-toolbar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border-bottom: 1px solid var(--border-color);
      flex-wrap: wrap;
    }
    /* Type quick filter */
    .type-quick-filter {
      display: flex;
      border: 1.5px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
    }
    .tqf-btn {
      padding: .375rem .875rem;
      font-size: .8125rem;
      font-weight: 600;
      background: transparent;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all .15s;
      white-space: nowrap;
    }
    .tqf-btn + .tqf-btn { border-left: 1.5px solid var(--border-color); }
    .tqf-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
    .tqf-btn.active { background: var(--brand); color: white; }
    .tqf-btn.income.active { background: #2d7a45; }
    .tqf-btn.expense.active { background: #b91c1c; }
    /* View toggle */
    .view-toggle {
      display: flex;
      border: 1.5px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
    }
    .vtb {
      padding: .375rem .625rem;
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      transition: all .15s;
      display: flex;
      align-items: center;
    }
    .vtb + .vtb { border-left: 1.5px solid var(--border-color); }
    .vtb:hover { background: var(--bg-hover); color: var(--text-primary); }
    .vtb.active { background: rgba(139,21,56,.1); color: var(--brand); }
    /* Empty state */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 3rem 1rem;
      color: var(--text-muted);
      font-size: .875rem;
    }
    /* Cards view */
    .tx-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 0.875rem;
    }
    .tx-card {
      background: var(--bg-surface);
      border: 1.5px solid var(--border-color);
      border-radius: 12px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: .625rem;
      transition: all .2s ease;
    }
    .tx-card:hover {
      border-color: var(--brand);
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }
    .tx-card-top { display: flex; align-items: center; justify-content: space-between; }
    .tx-card-amount { font-size: 1.125rem; font-weight: 800; font-variant-numeric: tabular-nums; }
    .tx-card-desc { font-size: .875rem; font-weight: 600; color: var(--text-primary); }
    .tx-card-notes { font-size: .75rem; color: var(--text-muted); }
    .tx-card-meta { display: flex; align-items: center; justify-content: space-between; gap: .5rem; }
    .tx-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: .5rem;
      border-top: 1px solid var(--border-color);
      margin-top: .125rem;
    }
    /* List view */
    .tx-list-view { display: flex; flex-direction: column; }
    .tx-list-row {
      display: flex;
      align-items: center;
      gap: .75rem;
      padding: .625rem 1rem;
      border-bottom: 1px solid var(--border-color);
      transition: background .15s;
    }
    .tx-list-row:last-child { border-bottom: none; }
    .tx-list-row:hover { background: var(--bg-hover); }
    .tlr-indicator { width: 4px; height: 28px; border-radius: 2px; flex-shrink: 0; }
    .tlr-main { display: flex; align-items: center; gap: .5rem; flex: 1; min-width: 0; overflow: hidden; }
    .tlr-desc { font-size: .875rem; font-weight: 500; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
    .tlr-date { font-size: .75rem; color: var(--text-muted); white-space: nowrap; }
    .tlr-amount { font-size: .9rem; font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; min-width: 90px; text-align: right; }
    @media (max-width: 640px) {
      .table-toolbar { gap: .5rem; }
      .type-quick-filter { order: -1; width: 100%; }
      .tqf-btn { flex: 1; text-align: center; }
      .tx-cards-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class TransactionsComponent implements OnInit {
  private txService = inject(TransactionService);
  private toast     = inject(ToastService);
  private auth      = inject(AuthService);
  private route     = inject(ActivatedRoute);

  readonly loading       = signal(true);
  readonly modalOpen     = signal(false);
  readonly offcanvasOpen = signal(false);
  readonly deleteTarget  = signal<Transaction | null>(null);
  readonly editingTx     = signal<Transaction | null>(null);
  readonly formError     = signal('');
  readonly page          = signal(1);
  readonly pageSize      = signal(10);
  readonly viewMode      = signal<ViewMode>('table');

  // Reactive filter signals
  readonly searchQuery   = signal('');
  readonly filterType    = signal('');
  readonly filterCategory = signal('');
  readonly filterDateFrom = signal('');
  readonly filterDateTo   = signal('');
  readonly filterMinAmt   = signal('');
  readonly filterMaxAmt   = signal('');

  form = {
    type: 'income' as 'income' | 'expense',
    description: '',
    amount: 0,
    category: '',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    notes: ''
  };

  readonly allCategories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

  readonly currentCategories = computed(() =>
    this.form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  );

  private _txns = signal(this.txService.getAll());

  readonly filteredTxns = computed(() => {
    let txns = this._txns();
    const q = this.searchQuery().toLowerCase().trim();
    if (q) txns = txns.filter(t =>
      t.description.toLowerCase().includes(q) ||
      t.reference?.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
    const ft = this.filterType();
    if (ft) txns = txns.filter(t => t.type === ft);
    const fc = this.filterCategory();
    if (fc) txns = txns.filter(t => t.category === fc);
    const fd = this.filterDateFrom();
    if (fd) txns = txns.filter(t => t.date >= fd);
    const fdt = this.filterDateTo();
    if (fdt) txns = txns.filter(t => t.date <= fdt);
    const fmin = this.filterMinAmt();
    if (fmin) txns = txns.filter(t => t.amount >= +fmin);
    const fmax = this.filterMaxAmt();
    if (fmax) txns = txns.filter(t => t.amount <= +fmax);
    return txns;
  });

  readonly summary = computed(() => this.txService.getSummary(this.filteredTxns()));

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredTxns().length / this.pageSize())));
  readonly pageNumbers = computed(() => {
    const p = this.page(), total = this.totalPages();
    const range: number[] = [];
    for (let i = Math.max(1, p - 2); i <= Math.min(total, p + 2); i++) range.push(i);
    return range;
  });
  readonly paginatedTxns = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.filteredTxns().slice(start, start + this.pageSize());
  });

  readonly activeFilterCount = computed(() =>
    [this.filterType(), this.filterCategory(), this.filterDateFrom(), this.filterDateTo(), this.filterMinAmt(), this.filterMaxAmt()]
      .filter(Boolean).length
  );

  ngOnInit(): void {
    this.route.queryParams.subscribe(p => {
      if (p['type']) this.filterType.set(p['type']);
    });
    setTimeout(() => this.loading.set(false), 400);
  }

  setTypeFilter(type: string): void {
    this.filterType.set(type);
    this.page.set(1);
  }

  clearFilters(): void {
    this.filterType.set('');
    this.filterCategory.set('');
    this.filterDateFrom.set('');
    this.filterDateTo.set('');
    this.filterMinAmt.set('');
    this.filterMaxAmt.set('');
    this.searchQuery.set('');
    this.page.set(1);
  }

  openCreateModal(): void {
    this.editingTx.set(null);
    this.form = {
      type: 'income',
      description: '',
      amount: 0,
      category: '',
      date: new Date().toISOString().split('T')[0],
      reference: '',
      notes: ''
    };
    this.formError.set('');
    this.modalOpen.set(true);
  }

  openEditModal(tx: Transaction): void {
    this.editingTx.set(tx);
    this.form = {
      type: tx.type,
      description: tx.description,
      amount: tx.amount,
      category: tx.category,
      date: tx.date,
      reference: tx.reference ?? '',
      notes: tx.notes ?? ''
    };
    this.formError.set('');
    this.modalOpen.set(true);
  }

  closeModal(): void { this.modalOpen.set(false); }

  saveTransaction(): void {
    if (!this.form.description || !this.form.amount || !this.form.category || !this.form.date) {
      this.formError.set('Please fill all required fields');
      return;
    }
    const user = this.auth.currentUser();
    if (this.editingTx()) {
      this.txService.update(this.editingTx()!.id, {
        type: this.form.type,
        description: this.form.description,
        amount: +this.form.amount,
        category: this.form.category as any,
        date: this.form.date,
        reference: this.form.reference || undefined,
        notes: this.form.notes || undefined
      });
      this.toast.success('Transaction updated', 'Changes saved successfully');
    } else {
      this.txService.create({
        type: this.form.type,
        description: this.form.description,
        amount: +this.form.amount,
        category: this.form.category as any,
        date: this.form.date,
        reference: this.form.reference || undefined,
        notes: this.form.notes || undefined,
        createdBy: user?.id ?? 'unknown'
      });
      this.toast.success('Transaction created', 'New transaction added');
    }
    this._txns.set(this.txService.getAll());
    this.closeModal();
  }

  confirmDelete(tx: Transaction): void { this.deleteTarget.set(tx); }
  doDelete(): void {
    const tx = this.deleteTarget();
    if (!tx) return;
    this.txService.delete(tx.id);
    this._txns.set(this.txService.getAll());
    this.deleteTarget.set(null);
    this.toast.success('Transaction deleted', 'The transaction has been removed');
  }

  getCategoryLabel(cat: string): string {
    return [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]
      .find(c => c.value === cat)?.labelKey ?? cat.replace(/_/g,' ');
  }
}
