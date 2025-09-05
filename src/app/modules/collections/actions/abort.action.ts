import { TAction } from '../../../../types/store.types';
import { setMultipleAddIds } from '../slices/selected.splice';
import { setShowPropsDialog } from '../slices/ui.slice';
import { resetBaseFeatureStyle } from './reset.action';

export function abortDrawing(): TAction {
  return async (_dispatch, getState) => {
    const { drawFragmentRef } = getState().interactions;
    if (drawFragmentRef) {
      drawFragmentRef.abortDrawing();
    }
  };
}

export function abortSubtract(): TAction {
  return async (_dispatch, getState) => {
    const { subtractFragmentRef } = getState().interactions;
    if (subtractFragmentRef) {
      subtractFragmentRef.abortDrawing();
    }
  };
}

export function abortSplit(): TAction {
  return async (_dispatch, getState) => {
    const { splitFragmentRef } = getState().interactions;
    if (splitFragmentRef) {
      splitFragmentRef.abortDrawing();
    }
  };
}

export function abortDrawRectangle(): TAction {
  return async (_dispatch, getState) => {
    const { addByRectangleDrawRef } = getState().interactions;
    if (addByRectangleDrawRef) {
      addByRectangleDrawRef.abortDrawing();
    }
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
