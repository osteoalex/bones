import { TAction } from '../../../../types/store.types';
import { setMultipleAddIds } from '../slices/selected.splice';
import { setShowPropsDialog } from '../slices/ui.slice';
import { resetBaseFeatureStyle } from './reset.action';

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

export function abortAll(): TAction {
  return async (dispatch, getState) => {
    dispatch(abortDrawing());
    dispatch(abortSubtract());
    dispatch(abortSplit());
    dispatch(abortDrawRectangle());
    dispatch(setMultipleAddIds([]));
    const { baseSourceRef } = getState().layers;
    if (baseSourceRef) {
      baseSourceRef.forEachFeature((feature) => resetBaseFeatureStyle(feature));
    }
    dispatch(setShowPropsDialog(false));
  };
}
