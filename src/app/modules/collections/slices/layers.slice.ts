import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { Map } from 'ol';
import VectorLayer from 'ol/layer/Vector';
import { Vector as VectorSource } from 'ol/source';

import {
  DrawLayer,
  ItemContent,
} from '../../../../types/collection-config-data.interface';

export interface LayersState {
  olMapRef: Map | null;
  baseLayerRef: VectorLayer<VectorSource> | null;
  baseSourceRef: VectorSource | null;
  layersData: ItemContent;
  activeLayerIdx: number;
  layers: DrawLayer[];
}

const initialState: LayersState = {
  olMapRef: null,
  baseSourceRef: null,
  baseLayerRef: null,
  layersData: [],
  activeLayerIdx: 0,
  layers: [],
};

export const layersSlice = createSlice({
  name: 'layers',
  initialState,
  reducers: {
    setOlMapRef: (state, action: PayloadAction<Map>) => {
      state.olMapRef = action.payload;
    },
    setBaseSourceRef: (state, action: PayloadAction<VectorSource>) => {
      state.baseSourceRef = action.payload;
    },
    setBaseLayerRef: (
      state,
      action: PayloadAction<VectorLayer<VectorSource>>,
    ) => {
      state.baseLayerRef = action.payload;
    },
    setLayersData: (state, action: PayloadAction<ItemContent>) => {
      state.layersData = action.payload;
    },
    setActiveLayerIdx: (state, action: PayloadAction<number>) => {
      state.activeLayerIdx = action.payload;
    },
    setLayers: (state, action: PayloadAction<DrawLayer[]>) => {
      state.layers = action.payload;
    },
  },
});

export const {
  setBaseSourceRef,
  setOlMapRef,
  setBaseLayerRef,
  setLayersData,
  setActiveLayerIdx,
  setLayers,
} = layersSlice.actions;

export default layersSlice.reducer;
