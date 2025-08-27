import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { Draw, Select, Snap } from 'ol/interaction';
import { Vector as VectorSource } from 'ol/source';

export interface InteractionsState {
  // interactions
  drawFragmentRef: Draw | null;
  splitFragmentRef: Draw | null;
  drawAnnotationRef: Draw | null;
  splitSourceRef: VectorSource | null;
  subtractFragmentRef: Draw | null;
  deleteSelectRef: Select | null;
  snapFragmentRef: Snap | null;
  boneHoverRef: Select | null;
  baseBoneHoverRef: Select | null;
  addMultipleRef: Select | null;
  infoSelectRef: Select | null;
  currentLayerInfoClickRef: Select | null;
  addByRectangleDrawRef: Draw | null;
  addByRectangleSourceRef: VectorSource | null;
}

const initialState: InteractionsState = {
  drawFragmentRef: null,
  splitFragmentRef: null,
  drawAnnotationRef: null,
  subtractFragmentRef: null,
  boneHoverRef: null,
  baseBoneHoverRef: null,
  snapFragmentRef: null,
  deleteSelectRef: null,
  addMultipleRef: null,
  addByRectangleDrawRef: null,
  infoSelectRef: null,
  currentLayerInfoClickRef: null,
  splitSourceRef: null,
  addByRectangleSourceRef: null,
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
    setBoneHoverRef: (state, action: PayloadAction<Select>) => {
      state.boneHoverRef = action.payload;
    },
    setBaseBoneHoverRef: (state, action: PayloadAction<Select>) => {
      state.baseBoneHoverRef = action.payload;
    },
    setSnapFragmentRef: (state, action: PayloadAction<Snap>) => {
      state.snapFragmentRef = action.payload;
    },
    setDeleteSelectRef: (state, action: PayloadAction<Select>) => {
      state.deleteSelectRef = action.payload;
    },
    setAddMultipleRef: (state, action: PayloadAction<Select>) => {
      state.addMultipleRef = action.payload;
    },
    setAddByRectangleDrawRef: (state, action: PayloadAction<Draw>) => {
      state.addByRectangleDrawRef = action.payload;
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
  },
});

export const {
  setDrawFragmentRef,
  setSplitFragmentRef,
  setSubtractFragmentRef,
  setBoneHoverRef,
  setBaseBoneHoverRef,
  setSnapFragmentRef,
  setDeleteSelectRef,
  setAddMultipleRef,
  setAddByRectangleDrawRef,
  setInfoSelectRef,
  setSplitSourceRef,
  setAddByRectangleSourceRef,
  setCurrentLayerInfoClickRef,
  setDrawAnnotationRef,
} = interactionsSlice.actions;

export default interactionsSlice.reducer;
