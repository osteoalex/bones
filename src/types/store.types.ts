import { ThunkAction, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';

import { RootState } from '../app/store';

export type TAction<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  UnknownAction
>;
export type AppDispatch = ThunkDispatch<RootState, unknown, UnknownAction>;
