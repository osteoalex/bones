import { Store } from './store';

export const toggleHint = (data: boolean, store: Store): void => {
  const config = store.get('currentCollectionConfig');
  store.set('currentCollectionConfig', { ...config, showHints: data });
  return;
};
