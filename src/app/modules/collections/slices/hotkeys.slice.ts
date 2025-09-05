import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface HotkeysState {
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
}

const initialState: HotkeysState = {
  ctrl: false,
  alt: false,
  shift: false,
};

export const hotkeysSlice = createSlice({
  name: 'hotkeys',
  initialState,
  reducers: {
    setCtrl(state, action: PayloadAction<boolean>) {
      state.ctrl = action.payload;
    },
    setAlt(state, action: PayloadAction<boolean>) {
      state.alt = action.payload;
    },
    setShift(state, action: PayloadAction<boolean>) {
      state.shift = action.payload;
    },
    setHotkeys(state, action: PayloadAction<Partial<HotkeysState>>) {
      return { ...state, ...action.payload };
    },
  },
});

export const { setCtrl, setAlt, setShift, setHotkeys } = hotkeysSlice.actions;
export default hotkeysSlice.reducer;
