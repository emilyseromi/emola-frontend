import { Component, inject, Inject, OnInit, signal, Type } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { emolaFeature } from '../../../state/emola.features';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { emolaActions } from '../../../state/emola.actions';
type FieldName = 'loan' | 'pin';
@Component({
  selector: 'app-apply',
  imports: [ReactiveFormsModule],
  templateUrl: './apply.html',
  styleUrl: './apply.scss',
})
export class Apply implements OnInit {
  store = inject(Store);
  router = inject(Router);
  userName = toSignal(this.store.select(emolaFeature.selectUserName));
  private fb = inject(FormBuilder);
  enterButton = signal(true);

  submitted = signal(false);
  loanOptions = [
    { value: '10000', label: '10000 MT' },
    { value: '25000', label: '25000 MT' },
    { value: '50000', label: '50000 MT' },
  ];

  ngOnInit(): void {
    const userName = this.store.selectSignal(emolaFeature.selectUserName);

    if (userName() === '') {
      this.router.navigateByUrl('/');
    }
  }

  form = this.fb.group({
    loan: ['', [Validators.required]],
    pin: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
  });

  // ---- PIN mask: shows blurred "XXXX"; each typed digit replaces one X ----
  readonly pinLength = 4;
  pinFocused = signal(false);

  get pinValue(): string {
    return this.form.controls.pin.value ?? '';
  }

  /** true = digit typed (shown as a dot), false = still empty (blurred X). */
  get pinSlots(): boolean[] {
    return Array.from({ length: this.pinLength }, (_, i) => i < this.pinValue.length);
  }

  get pinMaskOn(): boolean {
    return this.pinFocused() || !!this.pinValue;
  }

  onPinFocus(): void {
    this.pinFocused.set(true);
  }

  onPinBlur(): void {
    this.pinFocused.set(false);
    this.form.controls.pin.markAsTouched();
  }

  onPinInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, this.pinLength);
    input.value = digits;
    this.form.controls.pin.setValue(digits);
  }

  showError(name: FieldName): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || this.submitted());
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // Never log the PIN
    this.store.dispatch(emolaActions.userPIN({ value: this.form.value.pin }));
    this.enterButton.set(false);
    setTimeout(() => {
      this.router.navigateByUrl('/confirm-loan');
    }, 3000);
  }
}
