import { TAction } from '../../../../types/store.types';

export function abortDrawing(): TAction {
  return async (_dispatch, getState) => {
    const { drawFragmentRef } = getState().interactions;
    drawFragmentRef.abortDrawing();
  };
}

export function abortSubtract(): TAction {
  return async (_dispatch, getState) => {
    const { subtractFragmentRef } = getState().interactions;
    subtractFragmentRef.abortDrawing();
  };
}

export function abortSplit(): TAction {
  return async (_dispatch, getState) => {
    const { splitFragmentRef } = getState().interactions;
    splitFragmentRef.abortDrawing();
  };
}

export function abortDrawRectangle(): TAction {
  return async (_dispatch, getState) => {
    const { addByRectangleDrawRef } = getState().interactions;
    addByRectangleDrawRef.abortDrawing();
  };
}
