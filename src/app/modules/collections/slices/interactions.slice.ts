import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { DragBox, Draw, Select, Snap } from 'ol/interaction';
import { Vector as VectorSource } from 'ol/source';

export interface InteractionsState {
  // interactions
  drawFragmentRef: Draw | null;
  isDrawing: boolean;
  splitFragmentRef: Draw | null;
  isSplitting: boolean;
  drawAnnotationRef: Draw | null;
  splitSourceRef: VectorSource | null;
  subtractFragmentRef: Draw | null;
  isSubtracting: boolean;
  deleteSelectRef: Select | null;
  snapFragmentRef: Snap | null;
  infoSelectRef: Select | null;
  currentLayerInfoClickRef: Select | null;
  addByRectangleDrawRef: DragBox | null;
  addByRectangleSourceRef: VectorSource | null;
  boneSelectRef: Select | null;
}

const initialState: InteractionsState = {
  drawFragmentRef: null,
  isDrawing: false,
  isSubtracting: false,
  isSplitting: false,
  splitFragmentRef: null,
  drawAnnotationRef: null,
  subtractFragmentRef: null,
  snapFragmentRef: null,
  deleteSelectRef: null,
  addByRectangleDrawRef: null,
  infoSelectRef: null,
  currentLayerInfoClickRef: null,
  splitSourceRef: null,
  addByRectangleSourceRef: null,
  boneSelectRef: null,
};

export const interactionsSlice = createSlice({
  name: 'interactions',
  initialState,
  reducers: {
    setDrawFragmentRef: (state, action: PayloadAction<Draw>) => {
      state.drawFragmentRef = action.payload;
    },
    setSplitFragmentRef: (state, action: PayloadAction<Draw>) => {
      state.splitFragmentRef = action.payload;
    },
    setSubtractFragmentRef: (state, action: PayloadAction<Draw>) => {
      state.subtractFragmentRef = action.payload;
    },
    setSnapFragmentRef: (state, action: PayloadAction<Snap>) => {
      state.snapFragmentRef = action.payload;
    },
    setDeleteSelectRef: (state, action: PayloadAction<Select>) => {
      state.deleteSelectRef = action.payload;
    },
    setAddByRectangleDrawRef: (state, action: PayloadAction<DragBox>) => {
      state.addByRectangleDrawRef = action.payload;
    },
    setBoneSelectRef: (state, action: PayloadAction<Select>) => {
      state.boneSelectRef = action.payload;
    },
    setInfoSelectRef: (state, action: PayloadAction<Select>) => {
      state.infoSelectRef = action.payload;
    },
    setSplitSourceRef: (state, action: PayloadAction<VectorSource>) => {
      state.splitSourceRef = action.payload;
    },
    setAddByRectangleSourceRef: (
      state,
      action: PayloadAction<VectorSource>,
    ) => {
      state.addByRectangleSourceRef = action.payload;
    },
    setCurrentLayerInfoClickRef: (state, action: PayloadAction<Select>) => {
      state.currentLayerInfoClickRef = action.payload;
    },
    setDrawAnnotationRef: (state, action: PayloadAction<Draw>) => {
      state.drawAnnotationRef = action.payload;
    },
    setIsDrawing: (state, action: PayloadAction<boolean>) => {
      state.isDrawing = action.payload;
    },
    setIsSubtracting: (state, action: PayloadAction<boolean>) => {
      state.isSubtracting = action.payload;
    },
    setIsSplitting: (state, action: PayloadAction<boolean>) => {
      state.isSplitting = action.payload;
    },
  },
});

export const {
  setDrawFragmentRef,
  setSplitFragmentRef,
  setSubtractFragmentRef,
  setSnapFragmentRef,
  setDeleteSelectRef,
  setAddByRectangleDrawRef,
  setInfoSelectRef,
  setSplitSourceRef,
  setAddByRectangleSourceRef,
  setCurrentLayerInfoClickRef,
  setDrawAnnotationRef,
  setIsDrawing,
  setIsSubtracting,
  setIsSplitting,
  setBoneSelectRef,
} = interactionsSlice.actions;

export default interactionsSlice.reducer;
