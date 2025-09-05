import { configureStore } from '@reduxjs/toolkit';

import editorReducer from './modules/collections/slices/editor.slice';
import hotkeysReducer from './modules/collections/slices/hotkeys.slice';
import interactionsReducer from './modules/collections/slices/interactions.slice';
import layersReducer from './modules/collections/slices/layers.slice';
import selectedReducer from './modules/collections/slices/selected.splice';
import uiReducer from './modules/collections/slices/ui.slice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    editor: editorReducer,
    selected: selectedReducer,
    layers: layersReducer,
    interactions: interactionsReducer,
    hotkeys: hotkeysReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
