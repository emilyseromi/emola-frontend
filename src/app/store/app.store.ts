import { authFeature } from '../state/admin.features';
import { emolaFeature } from '../state/emola.features';

export const appStore = {
  [emolaFeature.name]: emolaFeature.reducer,
  [authFeature.name]: authFeature.reducer,
};
