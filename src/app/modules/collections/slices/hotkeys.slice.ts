import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface HotkeysState {
  ctrl: boolean;
  panToggle: boolean;
  shift: boolean;
}

const initialState: HotkeysState = {
  ctrl: false,
  panToggle: false,
  shift: false,
};

export const hotkeysSlice = createSlice({
  name: 'hotkeys',
  initialState,
  reducers: {
    setCtrl(state, action: PayloadAction<boolean>) {
      state.ctrl = action.payload;
    },
    setPanToggle(state, action: PayloadAction<boolean>) {
      state.panToggle = action.payload;
    },
    setShift(state, action: PayloadAction<boolean>) {
      state.shift = action.payload;
    },
    setHotkeys(state, action: PayloadAction<Partial<HotkeysState>>) {
      return { ...state, ...action.payload };
    },
  },
});

export const { setCtrl, setPanToggle, setShift, setHotkeys } =
  hotkeysSlice.actions;
export default hotkeysSlice.reducer;
