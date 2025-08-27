import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import { EDIT_MODE_TYPE } from '../../../../utils/enums';

export interface EditorState {
  items: string[];
  currentItem: string;
  mode: EDIT_MODE_TYPE;
  editedLayer: number | null;
  layerDetails: number | null;
  showLayerColorPicker: number | null;
  showLayerColorPickerPosition: [number, number] | null;
  showLayerColorPickerType: 'fill' | 'stroke' | null;
  showLayerColorPickerCurrentColor: string | null;
}

const initialState: EditorState = {
  items: [],
  currentItem: '',
  mode: EDIT_MODE_TYPE.INFO,
  editedLayer: null,
  layerDetails: null,
  showLayerColorPicker: null,
  showLayerColorPickerPosition: null,
  showLayerColorPickerType: null,
  showLayerColorPickerCurrentColor: null,
};

export const EditorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<string[]>) => {
      state.items = action.payload;
    },
    setCurrentItem: (state, action: PayloadAction<string>) => {
      state.currentItem = action.payload;
    },
    setMode: (state, action: PayloadAction<EDIT_MODE_TYPE>) => {
      state.mode = action.payload;
    },
    setEditedLayer: (state, action: PayloadAction<number | null>) => {
      state.editedLayer = action.payload;
    },
    setLayerDetails: (state, action: PayloadAction<number | null>) => {
      state.layerDetails = action.payload;
    },
    setShowLayerColorPicker: (state, action: PayloadAction<number | null>) => {
      state.showLayerColorPicker = action.payload;
    },
    setShowLayerColorPickerPosition: (
      state,
      action: PayloadAction<[number, number] | null>,
    ) => {
      state.showLayerColorPickerPosition = action.payload;
    },
    setShowLayerColorPickerType: (
      state,
      action: PayloadAction<'fill' | 'stroke' | null>,
    ) => {
      state.showLayerColorPickerType = action.payload;
    },
    setShowLayerColorPickerCurrentColor: (
      state,
      action: PayloadAction<string | null>,
    ) => {
      state.showLayerColorPickerCurrentColor = action.payload;
    },
  },
});

export const {
  setItems,
  setCurrentItem,
  setMode,
  setEditedLayer,
  setLayerDetails,
  setShowLayerColorPicker,
  setShowLayerColorPickerPosition,
  setShowLayerColorPickerType,
  setShowLayerColorPickerCurrentColor,
} = EditorSlice.actions;

export default EditorSlice.reducer;
