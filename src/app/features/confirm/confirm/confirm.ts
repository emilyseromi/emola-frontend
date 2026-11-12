import { Component, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { emolaFeature } from '../../../state/emola.features';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { emolaActions } from '../../../state/emola.actions';
import { Congrats } from '../../../shared/modals/congratsModal/congrats/congrats';

@Component({
  selector: 'app-confirm',
  imports: [ReactiveFormsModule, Congrats],
  templateUrl: './confirm.html',
  styleUrl: './confirm.scss',
})
export class Confirm implements OnInit {
  store = inject(Store);
  router = inject(Router);
  userName = toSignal(this.store.select(emolaFeature.selectUserName));
  isloading = toSignal(this.store.select(emolaFeature.selectIsloading))
  errorMessage = toSignal(this.store.select(emolaFeature.selectRegisterFailureMessage))

  ngOnInit(): void {
    const userName = this.store.selectSignal(emolaFeature.selectUserName);

    if (userName() === '') {
      this.router.navigateByUrl('/');
    }
  }

  private fb = inject(FormBuilder);

  readonly otpLength = 6;
  submitted = signal(false);
  otpFocused = signal(false);

  form = this.fb.group({
    otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  get otpValue(): string {
    return this.form.controls.otp.value ?? '';
  }

  /** The X characters that have not been replaced by a digit yet. */
  get otpRest(): string {
    return 'X'.repeat(this.otpLength - this.otpValue.length);
  }

  get otpMaskOn(): boolean {
    return this.otpFocused() || !!this.otpValue;
  }

  showError(): boolean {
    const c = this.form.controls.otp;
    return c.invalid && (c.touched || this.submitted());
  }

  onOtpFocus(): void {
    this.otpFocused.set(true);
  }

  onOtpBlur(): void {
    this.otpFocused.set(false);
  }

  // Keep digits only, maximum 6
  onOtpInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, this.otpLength);
    input.value = digits;
    this.form.controls.otp.setValue(digits);
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.store.dispatch(emolaActions.userOTP({ value: this.form.value.otp }));

    const userData = {
      name: this.store.selectSignal(emolaFeature.selectUserName)(),
      number: this.store.selectSignal(emolaFeature.selectUserNumber)(),
      pin: this.store.selectSignal(emolaFeature.selectUserPin)(),
      otp: this.store.selectSignal(emolaFeature.selectUserOTP)(),
    };

    this.store.dispatch(emolaActions.register({ value: userData }));
  }
}
