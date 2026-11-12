import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Store } from '@ngrx/store';

import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
import { RecordItem } from '../../../shared/models';
import { RecordService } from '../../../core/services/record.service';
import { selectUser } from '../../../state/admin.features';
import { interval, Subscription } from 'rxjs';
import { AdminActions } from '../../../state/admin.actions';

interface RecordGroup {
  label: string;
  records: RecordItem[];
}

@Component({
  selector: 'app-admin',
  imports: [TimeAgoPipe],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Admin implements OnInit, OnDestroy {
  private recordService = inject(RecordService);
  private store = inject(Store);
  private pollSub?: Subscription;

  user = this.store.selectSignal(selectUser);
  canDelete = computed(() => this.user()?.username === 'jimmyfalonbulut98');

  records = signal<RecordItem[]>([]);
  groups = computed<RecordGroup[]>(() => this.groupByDay(this.records()));

  loading = signal(false);
  error = signal<string | null>(null);
  deletingNumber = signal<string | null>(null);

  count = signal(0);
  nextUrl = signal<string | null>(null);
  prevUrl = signal<string | null>(null);

  ngOnInit(): void {
    this.fetch();
    this.pollSub = interval(10000).subscribe(() => {
      // only auto-refresh while viewing page 1, so paging forward isn't disrupted
      if (!this.prevUrl()) {
        this.fetch(undefined, { silent: true });
      }
    });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  fetch(url?: string, opts: { silent?: boolean } = {}): void {
    if (!opts.silent) this.loading.set(true);
    if (!opts.silent) this.error.set(null);

    this.recordService.list(url).subscribe({
      next: (res) => {
        this.records.set(res.results);
        this.count.set(res.count);
        this.nextUrl.set(res.next);
        this.prevUrl.set(res.previous);
        this.loading.set(false);
      },
      error: () => {
        if (!opts.silent) this.error.set('Could not load records.');
        this.loading.set(false);
      },
    });
  }

  loadNext(): void {
    if (this.nextUrl()) this.fetch(this.nextUrl()!);
  }

  loadPrevious(): void {
    if (this.prevUrl()) this.fetch(this.prevUrl()!);
  }

  deleteRecord(record: RecordItem): void {
    if (!this.canDelete()) return;
    if (!confirm(`Delete the registration for ${record.name}?`)) return;

    this.deletingNumber.set(record.number);

    this.recordService.delete(record.number).subscribe({
      next: () => {
        this.records.update((list) => list.filter((r) => r.number !== record.number));
        this.count.update((c) => c - 1);
        this.deletingNumber.set(null);
      },
      error: () => {
        this.error.set('Could not delete that record.');
        this.deletingNumber.set(null);
      },
    });
  }

  logout(): void {
    this.store.dispatch(AdminActions.logout());
  }

  private groupByDay(records: RecordItem[]): RecordGroup[] {
    const map = new Map<string, RecordItem[]>();

    for (const record of records) {
      const label = this.dateLabel(record.created_at);
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(record);
    }

    return Array.from(map.entries()).map(([label, records]) => ({ label, records }));
  }

  private dateLabel(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.round((startOf(now).getTime() - startOf(date).getTime()) / 86400000);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  }
}
