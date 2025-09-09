import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import Feature from 'ol/Feature';
import { Geometry } from 'ol/geom';

export interface SelectedState {
  selectedBone: Feature | null;
  infoDetails: Feature<Geometry>[];
  multipleAddIds: string[];
  fullArea: number;
  fragmentsArea: number;
}

const initialState: SelectedState = {
  multipleAddIds: [],
  fullArea: 1,
  selectedBone: null,
  infoDetails: [],
  fragmentsArea: 0,
};

export const selectedSlice = createSlice({
  name: 'selected',
  initialState,
  reducers: {
    setMultipleAddIds: (state, action: PayloadAction<string[]>) => {
      state.multipleAddIds = action.payload;
    },
    setFullArea: (state, action: PayloadAction<number>) => {
      state.fullArea = action.payload;
    },
    setSelectedBone: (state, action: PayloadAction<Feature>) => {
      state.selectedBone = action.payload;
    },
    setInfoDetails: (state, action: PayloadAction<Feature<Geometry>[]>) => {
      state.infoDetails = action.payload;
    },
    setFragmentsArea: (state, action: PayloadAction<number>) => {
      state.fragmentsArea = action.payload;
    },
  },
});

export const {
  setMultipleAddIds,
  setFullArea,
  setInfoDetails,
  setFragmentsArea,
  setSelectedBone,
} = selectedSlice.actions;

export default selectedSlice.reducer;
