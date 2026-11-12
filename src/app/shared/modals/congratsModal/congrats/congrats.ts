import { Component, computed, inject, Input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { emolaFeature } from '../../../../state/emola.features';
import { emolaActions } from '../../../../state/emola.actions';
import { Router } from '@angular/router';

@Component({
  selector: 'app-congrats',
  imports: [],
  templateUrl: './congrats.html',
  styleUrl: './congrats.scss',
})
export class Congrats {
  store = inject(Store);
  router = inject(Router);
  @Input() title = 'Código enviado';
  name = this.store.selectSignal(emolaFeature.selectUserName);

  message = computed(
    () => `Parabéns, ${this.name()}! O seu empréstimo será processado no prazo de 24 horas.`,
  );

  isOpen = toSignal(this.store.select(emolaFeature.selectModalOpen));

  close(): void {
    this.store.dispatch(emolaActions.openModal({ value: false }));
    this.store.dispatch(emolaActions.resetStore());
    this.router.navigateByUrl('/');
  }
}
