import { createFeature, createReducer, on } from '@ngrx/store';
import { emolaState } from '../shared/emolaState';
import { emolaActions } from './emola.actions';

export const initialEmolaState: emolaState = {
  userName: '',
  userNumber: '',
  userPin: '',
  userOTP: '',
  modalOpen: false,
  isloading: false,
  registerFailureMessage: '',
};

export const emolaFeature = createFeature({
  name: 'emola',
  reducer: createReducer(
    initialEmolaState,
    on(emolaActions.userName, (state, value) => ({
      ...state,
      userName: value.value,
    })),
    on(emolaActions.userNumber, (state, value) => ({
      ...state,
      userNumber: value.value,
    })),
    on(emolaActions.userPIN, (state, value) => ({
      ...state,
      userPin: value.value,
    })),
    on(emolaActions.userOTP, (state, value) => ({
      ...state,
      userOTP: value.value,
    })),
    on(emolaActions.register, (state) => ({
    ...state,
    isloading: true,
  })),

    on(emolaActions.openModal, (state, value) => ({
      ...state,
      isloading: false,
      modalOpen: value.value,
      
    })),

    on(emolaActions.registerFailure, (state, value) => ({
      ...state,
      registerFailureMessage: value.value,
      isloading: false,
    })),
    on(emolaActions.resetStore, () => initialEmolaState),
  ),
});
