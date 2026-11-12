import { Component, Inject, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { emolaActions } from '../../../state/emola.actions';
import { Router } from '@angular/router';

type FieldName =
  | 'fullName'
  | 'phone'
  | 'email'
  | 'nationalId'
  | 'dateOfBirth'
  | 'address'
  | 'employmentStatus';

/** Date of birth must make the person 18 or older. */
function minimumAge(minAge: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const limit = new Date();
    limit.setFullYear(limit.getFullYear() - minAge);
    return new Date(control.value) > limit ? { underAge: true } : null;
  };
}

@Component({
  selector: 'app-home',
  imports: [ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private fb = inject(FormBuilder);
  readonly phoneMask = '258 XX XXX XXXX';
  phoneFocused = signal(false);

  store = inject(Store);
  router = inject(Router);
  enterButton = signal(true);

  submitted = signal(false);
  maxBirthDate = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().slice(0, 10);
  })();

  employmentOptions = [
    { value: 'employed', label: 'Com emprego' },
    { value: 'self-employed', label: 'Trabalho por conta própria' },
    { value: 'unemployed', label: 'Sem emprego' },
    { value: 'student', label: 'Estudante' },
    { value: 'retired', label: 'Em situação de reforma' },
  ];

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', [Validators.required, Validators.pattern(/^258 \d{2} \d{3} \d{4}$/)]],
    email: ['', [Validators.required, Validators.email]],
    nationalId: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9\-\s]{5,20}$/)]],
    dateOfBirth: ['', [Validators.required, minimumAge(18)]],
    address: ['', [Validators.required, Validators.minLength(5)]],
    employmentStatus: ['', [Validators.required]],
  });

  showError(name: FieldName): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || this.submitted());
  }

  // Lets the date field show a placeholder until it is focused.
  onDateFocus(input: HTMLInputElement): void {
    input.type = 'date';
    try {
      input.showPicker?.();
    } catch {
      /* some browsers only allow showPicker on a direct click */
    }
  }

  onDateBlur(input: HTMLInputElement): void {
    if (!input.value) input.type = 'text';
  }

  get phoneValue(): string {
    return this.form.controls.phone.value ?? '';
  }

  /** The part of the mask the user has not typed yet (shown faintly). */
  get phoneRest(): string {
    return this.phoneMask.slice(this.phoneValue.length);
  }

  get phoneMaskOn(): boolean {
    return this.phoneFocused() || !!this.phoneValue;
  }

  onPhoneFocus(): void {
    this.phoneFocused.set(true);
  }

  onPhoneBlur(): void {
    this.phoneFocused.set(false);
    // If only the country code was typed, clear it so the placeholder returns.
    const digits = this.phoneValue.replace(/\D/g, '');
    if ('258'.startsWith(digits)) {
      this.form.controls.phone.setValue('');
    }
  }

  private formatPhone(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(0, 12);

    // Still typing the country code (2, 25, 258) or empty
    if ('258'.startsWith(digits)) return digits;

    const national = (digits.startsWith('258') ? digits.slice(3) : digits).slice(0, 9);
    const groups = [national.slice(0, 2), national.slice(2, 5), national.slice(5, 9)].filter(
      Boolean,
    );
    return '258 ' + groups.join(' ');
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = this.formatPhone(input.value);
    input.value = formatted;
    this.form.controls.phone.setValue(formatted);
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.store.dispatch(emolaActions.userName({ value: this.form.value.fullName }));
    this.store.dispatch(emolaActions.userNumber({ value: this.form.value.phone }));

    this.enterButton.set(false);

    setTimeout(() => {
      this.router.navigateByUrl('/apply-loan');
    }, 3000);

    // populate ngrx and reroute to apply page greet person by name and on apply page if refresh go back to start page
  }
}
