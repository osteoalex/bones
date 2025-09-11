import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

export interface ContextMenuState {
  x: number;
  y: number;
  visible: boolean;
}

export interface UiState {
  showPropsDialog: boolean;
  newLayerPopupVisible: boolean;
  showHints: boolean;
  windowSize: [number, number];
  newItemNameDialogOpen: boolean;
  combineLayersDialogOpen: boolean;
  moveToLayerDialogOpen: boolean;
  copyToLayerDialogOpen: boolean;
  drawerOpen: boolean;
  annotationDialog: string | null;
  loading: boolean;
  contextMenu: {
    x: number;
    y: number;
    visible: boolean;
  };
}

const initialState: UiState = {
  showPropsDialog: false,
  showHints: false,
  windowSize: [window.innerHeight, window.innerWidth],
  newItemNameDialogOpen: false,
  drawerOpen: true,
  combineLayersDialogOpen: false,
  moveToLayerDialogOpen: false,
  newLayerPopupVisible: false,
  annotationDialog: null,
  loading: false,
  contextMenu: { x: 0, y: 0, visible: false },
  copyToLayerDialogOpen: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setShowPropsDialog: (state, action: PayloadAction<boolean>) => {
      state.showPropsDialog = action.payload;
    },
    setShowHints: (state, action: PayloadAction<boolean>) => {
      state.showHints = action.payload;
    },
    setWindowSize: (state, action: PayloadAction<[number, number]>) => {
      state.windowSize = action.payload;
    },
    setNewItemNameDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.newItemNameDialogOpen = action.payload;
    },
    setDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.drawerOpen = action.payload;
    },
    setNewLayerPopupVisible: (state, action: PayloadAction<boolean>) => {
      state.newLayerPopupVisible = action.payload;
    },
    setCombineLayersDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.combineLayersDialogOpen = action.payload;
    },
    setMoveToLayerDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.moveToLayerDialogOpen = action.payload;
    },
    setAnnotationDialog: (state, action: PayloadAction<string | null>) => {
      state.annotationDialog = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setContextMenu: (state, action: PayloadAction<ContextMenuState>) => {
      state.contextMenu = action.payload;
    },
    setCopyToLayerDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.copyToLayerDialogOpen = action.payload;
    },
  },
});

export const {
  setShowPropsDialog,
  setShowHints,
  setWindowSize,
  setNewItemNameDialogOpen,
  setDrawerOpen,
  setNewLayerPopupVisible,
  setCombineLayersDialogOpen,
  setMoveToLayerDialogOpen,
  setAnnotationDialog,
  setLoading,
  setContextMenu,
  setCopyToLayerDialogOpen,
} = uiSlice.actions;

export default uiSlice.reducer;
