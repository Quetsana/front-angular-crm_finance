import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AccountService } from '../../../core/services/account.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb.component';
import { SkeletonComponent } from '../../../shared/components/skeleton.component';
import { User, UserRole, DEFAULT_PERMISSIONS } from '../../../core/models/user.model';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, BreadcrumbComponent, SkeletonComponent, DatePipe],
  template: `
    <div class="page animate-fade-in">
      <app-breadcrumb [items]="[
        {label:'Finance',route:'/finance/dashboard'},
        {label:'Accounts',translateKey:'nav.accounts'}
      ]"></app-breadcrumb>

      <div class="page-header">
        <div>
          <h1 class="page-title">{{ 'accounts.title' | translate }}</h1>
          <p class="page-sub">{{ 'accounts.subtitle' | translate }}</p>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-ghost btn-sm" (click)="offcanvasOpen.set(true)">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
            </svg>
            {{ 'common.filters' | translate }}
          </button>
          <button class="btn btn-primary btn-sm" (click)="openCreate()">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            {{ 'accounts.addUser' | translate }}
          </button>
        </div>
      </div>

      <!-- Metric cards -->
      <div class="cards-grid-4 animate-fade-in delay-100">
        <div class="mini-card brand"><div class="mini-label">{{ 'accounts.totalAccounts' | translate }}</div><div class="mini-value">{{ filteredAccounts().length }}</div></div>
        <div class="mini-card green"><div class="mini-label">{{ 'accounts.activeAccounts' | translate }}</div><div class="mini-value">{{ activeCount() }}</div></div>
        <div class="mini-card red"><div class="mini-label">{{ 'accounts.inactiveAccounts' | translate }}</div><div class="mini-value">{{ filteredAccounts().length - activeCount() }}</div></div>
        <div class="mini-card gold"><div class="mini-label">{{ 'accounts.adminAccounts' | translate }}</div><div class="mini-value">{{ adminCount() }}</div></div>
      </div>

      <!-- Table -->
      <div class="card animate-fade-in delay-200">
        <div class="p-4 flex items-center justify-between gap-3 flex-wrap border-b" style="border-color:var(--border-color)">
          <div class="relative">
            <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style="color:var(--text-muted)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input class="form-input pl-9 w-64" type="text" [(ngModel)]="search"
              placeholder="{{ 'accounts.searchPlaceholder' | translate }}">
          </div>
        </div>

        @if (loading()) {
          <div class="p-4"><app-skeleton type="list" [rows]="[1,2,3,4,5]"></app-skeleton></div>
        } @else {
          <div class="table-container" style="border:none;border-radius:0">
            <table class="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Permissions</th>
                  <th>Last Login</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (user of paginatedAccounts(); track user.id) {
                  <tr class="animate-fade-in">
                    <td>
                      <div class="flex items-center gap-3">
                        <div class="user-avatar-sm" [style.background]="user.avatarColor">{{ user.avatarInitials }}</div>
                        <div>
                          <div class="font-medium text-sm" style="color:var(--text-primary)">
                            {{ user.firstName }} {{ user.lastName }}
                          </div>
                          <div class="text-xs" style="color:var(--text-muted)">{{ user.email }}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="badge" [class]="getRoleBadge(user.role)">{{ user.role | titlecase }}</span>
                    </td>
                    <td>
                      <span class="badge" [class]="user.status === 'active' ? 'badge-success' : 'badge-danger'">
                        <span class="status-dot" [class]="user.status === 'active' ? 'active' : 'inactive'"></span>
                        {{ user.status | titlecase }}
                      </span>
                    </td>
                    <td>
                      <div class="flex gap-1 flex-wrap">
                        @if (user.permissions.dashboard.view) {
                          <span class="badge badge-info text-xs">Dashboard</span>
                        }
                        @if (user.permissions.transactions.view) {
                          <span class="badge badge-gold text-xs">Txns</span>
                        }
                        @if (user.permissions.accounts.view) {
                          <span class="badge badge-purple text-xs">Accounts</span>
                        }
                        @if (user.permissions.aiAnalysis.view) {
                          <span class="badge badge-brand text-xs">AI</span>
                        }
                      </div>
                    </td>
                    <td class="text-sm" style="color:var(--text-muted)">
                      {{ user.lastLogin === '—' ? '—' : (user.lastLogin | date:'MMM d, y') }}
                    </td>
                    <td>
                      <div class="flex justify-center gap-1">
                        <button class="btn btn-ghost btn-icon btn-sm" (click)="openEdit(user)">
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button class="btn btn-ghost btn-icon btn-sm" (click)="openPermissions(user)">
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                        </button>
                        @if (user.id !== currentUser()?.id) {
                          <button class="btn btn-ghost btn-icon btn-sm" style="color:var(--danger)"
                            (click)="deleteTarget.set(user)">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
                @if (filteredAccounts().length === 0) {
                  <tr><td colspan="6" class="text-center py-12" style="color:var(--text-muted)">
                    {{ 'accounts.noAccounts' | translate }}
                  </td></tr>
                }
              </tbody>
            </table>
          </div>

          @if (totalPages() > 1) {
            <div class="flex items-center justify-between px-4 py-3 border-t" style="border-color:var(--border-color)">
              <span class="text-sm" style="color:var(--text-muted)">Page {{ page() }} of {{ totalPages() }}</span>
              <div class="flex gap-1">
                <button class="btn btn-ghost btn-sm btn-icon" [disabled]="page()<=1" (click)="page.update(p=>p-1)">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                </button>
                <button class="btn btn-ghost btn-sm btn-icon" [disabled]="page()>=totalPages()" (click)="page.update(p=>p+1)">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>
          }
        }
      </div>
    </div>

    <!-- Filters offcanvas -->
    @if (offcanvasOpen()) {
      <div class="offcanvas-backdrop" (click)="offcanvasOpen.set(false)"></div>
      <div class="offcanvas-panel animate-fade-right p-5">
        <div class="flex items-center justify-between mb-5">
          <h3 class="font-bold text-lg" style="color:var(--text-primary)">{{ 'accounts.filterTitle' | translate }}</h3>
          <button class="btn btn-ghost btn-icon" (click)="offcanvasOpen.set(false)">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="flex flex-col gap-4">
          <div><label class="form-label">Role</label>
            <select class="form-input form-select" [(ngModel)]="filterRole">
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="accountant">Accountant</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div><label class="form-label">Status</label>
            <select class="form-input form-select" [(ngModel)]="filterStatus">
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div class="flex gap-2 mt-6">
          <button class="btn btn-ghost flex-1" (click)="filterRole='';filterStatus=''">{{ 'common.clear' | translate }}</button>
          <button class="btn btn-primary flex-1" (click)="offcanvasOpen.set(false)">{{ 'common.apply' | translate }}</button>
        </div>
      </div>
    }

    <!-- Create/Edit Modal -->
    @if (modalOpen()) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal-panel" style="max-width:500px" (click)="$event.stopPropagation()">
          <div class="p-6 border-b" style="border-color:var(--border-color)">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-bold" style="color:var(--text-primary)">
                {{ editingUser() ? ('accounts.editUser' | translate) : ('accounts.addUser' | translate) }}
              </h2>
              <button class="btn btn-ghost btn-icon" (click)="closeModal()">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
          <div class="p-6 grid grid-cols-2 gap-4">
            <div><label class="form-label">{{ 'accounts.firstName' | translate }} *</label>
              <input class="form-input" [(ngModel)]="form.firstName" placeholder="First name"></div>
            <div><label class="form-label">{{ 'accounts.lastName' | translate }} *</label>
              <input class="form-input" [(ngModel)]="form.lastName" placeholder="Last name"></div>
            <div class="col-span-2"><label class="form-label">{{ 'accounts.email' | translate }} *</label>
              <input class="form-input" type="email" [(ngModel)]="form.email" placeholder="email@quetsana.com"></div>
            <div><label class="form-label">Phone</label>
              <input class="form-input" [(ngModel)]="form.phone" placeholder="+502 5555-0000"></div>
            <div><label class="form-label">Position</label>
              <input class="form-input" [(ngModel)]="form.position" placeholder="Position"></div>
            <div><label class="form-label">{{ 'accounts.role' | translate }} *</label>
              <select class="form-input form-select" [(ngModel)]="form.role" (change)="onRoleChange()">
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="accountant">Accountant</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div><label class="form-label">Status</label>
              <select class="form-input form-select" [(ngModel)]="form.status">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div class="px-6 pb-6 flex gap-3 justify-end">
            <button class="btn btn-ghost" (click)="closeModal()">{{ 'common.cancel' | translate }}</button>
            <button class="btn btn-primary" (click)="saveUser()">{{ 'common.save' | translate }}</button>
          </div>
        </div>
      </div>
    }

    <!-- Permissions Modal -->
    @if (permUser()) {
      <div class="modal-backdrop" (click)="permUser.set(null)">
        <div class="modal-panel" style="max-width:560px" (click)="$event.stopPropagation()">
          <div class="p-6 border-b" style="border-color:var(--border-color)">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-bold" style="color:var(--text-primary)">{{ 'accounts.permissionsTitle' | translate }}</h2>
                <p class="text-sm mt-1" style="color:var(--text-muted)">{{ permUser()!.firstName }} {{ permUser()!.lastName }}</p>
              </div>
              <button class="btn btn-ghost btn-icon" (click)="permUser.set(null)">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
          <div class="p-6">
            <div class="perm-table">
              <div class="perm-header">
                <div></div>
                <div class="text-center text-xs font-bold uppercase tracking-wider" style="color:var(--text-muted)">View</div>
                <div class="text-center text-xs font-bold uppercase tracking-wider" style="color:var(--text-muted)">Create</div>
                <div class="text-center text-xs font-bold uppercase tracking-wider" style="color:var(--text-muted)">Edit</div>
                <div class="text-center text-xs font-bold uppercase tracking-wider" style="color:var(--text-muted)">Delete</div>
              </div>
              @for (row of permRows; track row.module) {
                <div class="perm-row">
                  <div class="perm-module">{{ row.label }}</div>
                  @for (action of row.actions; track action.key) {
                    <div class="text-center">
                      @if (action.key !== 'n/a') {
                        <input type="checkbox" class="perm-check"
                          [checked]="getPermValue(permUser()!.permissions, row.module, action.key)"
                          (change)="setPermValue(permUser()!.permissions, row.module, action.key, $any($event.target).checked)">
                      } @else {
                        <span class="text-xs" style="color:var(--text-muted)">—</span>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          </div>
          <div class="px-6 pb-6 flex gap-3 justify-end">
            <button class="btn btn-ghost" (click)="permUser.set(null)">{{ 'common.cancel' | translate }}</button>
            <button class="btn btn-primary" (click)="savePermissions()">{{ 'common.save' | translate }}</button>
          </div>
        </div>
      </div>
    }

    <!-- Delete confirm -->
    @if (deleteTarget()) {
      <div class="modal-backdrop" (click)="deleteTarget.set(null)">
        <div class="modal-panel" style="max-width:380px" (click)="$event.stopPropagation()">
          <div class="p-6 text-center">
            <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </div>
            <h3 class="font-bold text-lg mb-2" style="color:var(--text-primary)">Delete Account</h3>
            <p class="text-sm mb-5" style="color:var(--text-muted)">{{ 'accounts.deleteConfirm' | translate }}</p>
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
    .mini-card { padding: 1.125rem 1.25rem; border-radius: 12px; color: white; }
    .mini-card.brand  { background: linear-gradient(135deg,#8b1538,#6b0f2c); }
    .mini-card.green  { background: linear-gradient(135deg,#2d7a45,#1e5232); }
    .mini-card.red    { background: linear-gradient(135deg,#b91c1c,#991b1b); }
    .mini-card.gold   { background: linear-gradient(135deg,#a07d18,#7d5f12); }
    .mini-label { font-size: .75rem; font-weight: 500; opacity: .85; text-transform: uppercase; letter-spacing: .04em; margin-bottom: .5rem; }
    .mini-value { font-size: 1.375rem; font-weight: 800; }
    .user-avatar-sm { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: .75rem; color: white; flex-shrink: 0; }
    .status-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-right: 4px; }
    .status-dot.active { background: #4a7c59; }
    .status-dot.inactive { background: #dc2626; }
    .perm-table { display: grid; grid-template-rows: auto; gap: .5rem; }
    .perm-header,.perm-row { display: grid; grid-template-columns: 1fr repeat(4,60px); gap: .5rem; align-items: center; }
    .perm-row { padding: .625rem .75rem; border-radius: 8px; background: var(--bg-hover); }
    .perm-module { font-size: .875rem; font-weight: 600; color: var(--text-primary); }
    .perm-check { accent-color: var(--brand); width: 16px; height: 16px; cursor: pointer; }
  `]
})
export class AccountsComponent implements OnInit {
  private accService = inject(AccountService);
  private toast      = inject(ToastService);
  private auth       = inject(AuthService);

  readonly loading       = signal(true);
  readonly modalOpen     = signal(false);
  readonly offcanvasOpen = signal(false);
  readonly editingUser   = signal<User | null>(null);
  readonly deleteTarget  = signal<User | null>(null);
  readonly permUser      = signal<User | null>(null);
  readonly page          = signal(1);
  readonly pageSize      = 8;
  search       = '';
  filterRole   = '';
  filterStatus = '';

  readonly currentUser = this.auth.currentUser;

  form = {
    firstName: '', lastName: '', email: '', phone: '',
    position: '', role: 'viewer' as UserRole, status: 'active' as 'active' | 'inactive'
  };

  private _accounts = signal(this.accService.getAll());

  readonly filteredAccounts = computed(() => {
    let list = this._accounts();
    if (this.search) {
      const q = this.search.toLowerCase();
      list = list.filter(u =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }
    if (this.filterRole)   list = list.filter(u => u.role === this.filterRole);
    if (this.filterStatus) list = list.filter(u => u.status === this.filterStatus);
    return list;
  });

  readonly activeCount = computed(() => this.filteredAccounts().filter(u => u.status === 'active').length);
  readonly adminCount  = computed(() => this.filteredAccounts().filter(u => u.role === 'admin').length);
  readonly totalPages  = computed(() => Math.max(1, Math.ceil(this.filteredAccounts().length / this.pageSize)));
  readonly paginatedAccounts = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filteredAccounts().slice(start, start + this.pageSize);
  });

  permRows = [
    { module: 'dashboard',    label: 'Dashboard',    actions: [{key:'view'},{key:'n/a'},{key:'n/a'},{key:'n/a'}] },
    { module: 'transactions', label: 'Transactions', actions: [{key:'view'},{key:'create'},{key:'edit'},{key:'delete'}] },
    { module: 'accounts',     label: 'Accounts',     actions: [{key:'view'},{key:'create'},{key:'edit'},{key:'delete'}] },
    { module: 'aiAnalysis',   label: 'AI Analysis',  actions: [{key:'view'},{key:'generate'},{key:'n/a'},{key:'n/a'}] },
  ];

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 400);
  }

  openCreate(): void {
    this.editingUser.set(null);
    this.form = { firstName:'', lastName:'', email:'', phone:'', position:'', role:'viewer', status:'active' };
    this.modalOpen.set(true);
  }
  openEdit(u: User): void {
    this.editingUser.set(u);
    this.form = { firstName:u.firstName, lastName:u.lastName, email:u.email,
      phone:u.phone??'', position:u.position??'', role:u.role, status:u.status };
    this.modalOpen.set(true);
  }
  closeModal(): void { this.modalOpen.set(false); }

  onRoleChange(): void {}

  saveUser(): void {
    if (!this.form.firstName || !this.form.email) {
      this.toast.error('Please fill required fields');
      return;
    }
    const initials = (this.form.firstName[0] + (this.form.lastName[0] ?? '')).toUpperCase();
    if (this.editingUser()) {
      this.accService.update(this.editingUser()!.id, {
        firstName: this.form.firstName, lastName: this.form.lastName,
        email: this.form.email, phone: this.form.phone, position: this.form.position,
        role: this.form.role, status: this.form.status,
        avatarInitials: initials,
        permissions: DEFAULT_PERMISSIONS[this.form.role]
      });
      this.toast.success('Account updated');
    } else {
      this.accService.create({
        firstName: this.form.firstName, lastName: this.form.lastName,
        email: this.form.email, phone: this.form.phone, position: this.form.position,
        role: this.form.role, status: this.form.status,
        avatarInitials: initials,
        avatarColor: '#8b1538',
        permissions: DEFAULT_PERMISSIONS[this.form.role],
        preferences: { language:'es', theme:'light', emailNotifications:true, pushNotifications:false, timezone:'America/Guatemala' }
      });
      this.toast.success('Account created');
    }
    this._accounts.set(this.accService.getAll());
    this.closeModal();
  }

  openPermissions(u: User): void { this.permUser.set({ ...u, permissions: JSON.parse(JSON.stringify(u.permissions)) }); }
  savePermissions(): void {
    const u = this.permUser();
    if (!u) return;
    this.accService.update(u.id, { permissions: u.permissions });
    this._accounts.set(this.accService.getAll());
    this.permUser.set(null);
    this.toast.success('Permissions updated');
  }

  getPermValue(perms: User['permissions'], module: string, action: string): boolean {
    return (perms as any)[module]?.[action] ?? false;
  }
  setPermValue(perms: User['permissions'], module: string, action: string, value: boolean): void {
    if ((perms as any)[module]) (perms as any)[module][action] = value;
  }

  doDelete(): void {
    const u = this.deleteTarget();
    if (!u) return;
    this.accService.delete(u.id);
    this._accounts.set(this.accService.getAll());
    this.deleteTarget.set(null);
    this.toast.success('Account deleted');
  }

  getRoleBadge(role: UserRole): string {
    return { admin:'badge-brand', manager:'badge-gold', accountant:'badge-info', viewer:'badge-purple' }[role] ?? 'badge-info';
  }
}
