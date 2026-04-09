import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    @switch (type()) {
      @case ('card') {
        <div class="card p-5 animate-pulse">
          <div class="skeleton h-4 w-24 mb-3"></div>
          <div class="skeleton h-8 w-32 mb-2"></div>
          <div class="skeleton h-3 w-20"></div>
        </div>
      }
      @case ('table-row') {
        @for (r of rows(); track $index) {
          <tr>
            @for (c of cols(); track $index) {
              <td class="px-4 py-3">
                <div class="skeleton h-4" [style.width.px]="60 + ($index * 20) % 80"></div>
              </td>
            }
          </tr>
        }
      }
      @case ('chart') {
        <div class="card p-5 animate-pulse">
          <div class="skeleton h-4 w-32 mb-4"></div>
          <div class="skeleton rounded-lg" [style.height]="height() || '240px'"></div>
        </div>
      }
      @case ('list') {
        @for (r of rows(); track $index) {
          <div class="flex items-center gap-3 p-3">
            <div class="skeleton w-10 h-10 rounded-full flex-shrink-0"></div>
            <div class="flex-1">
              <div class="skeleton h-4 w-3/4 mb-2"></div>
              <div class="skeleton h-3 w-1/2"></div>
            </div>
          </div>
        }
      }
      @default {
        <div class="skeleton" [style.height]="height() || '1rem'" [style.width]="width() || '100%'"></div>
      }
    }
  `
})
export class SkeletonComponent {
  readonly type    = input<'card'|'table-row'|'chart'|'list'|'line'>('line');
  readonly rows    = input<number[]>([1,2,3,4,5]);
  readonly cols    = input<number[]>([1,2,3,4,5,6]);
  readonly height  = input<string>('');
  readonly width   = input<string>('');
}
