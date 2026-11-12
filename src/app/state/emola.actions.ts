import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { RegistrationPayload } from '../shared/models';

export const emolaActions = createActionGroup({
  source: 'emola',
  events: {
    userName: props<{ value: any }>(),
    userNumber: props<{ value: any }>(),
    userPIN: props<{ value: any }>(),
    userOTP: props<{ value: any }>(),
    openModal: props<{ value: boolean }>(),
    register: props<{ value: RegistrationPayload }>(),
    registerFailure: props<{ value: string }>(),
    resetStore: emptyProps(),
  },
});
