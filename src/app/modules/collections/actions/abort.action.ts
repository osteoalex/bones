import { TAction } from '../../../../types/store.types';
import { EDIT_MODE_TYPE } from '../../../../utils/enums';
import {
  setIsDrawing,
  setIsSplitting,
  setIsSubtracting,
} from '../slices/interactions.slice';
import { setMultipleAddIds } from '../slices/selected.slice';
import { setShowPropsDialog } from '../slices/ui.slice';
import { changeEditMode } from './mode.action';
import { resetBaseFeatureStyle } from './reset.action';

export function abortDrawing(): TAction {
  return async (dispatch, getState) => {
    const { drawFragmentRef, isDrawing } = getState().interactions;
    if (drawFragmentRef) {
      if (isDrawing) {
        drawFragmentRef.abortDrawing();
        dispatch(setIsDrawing(false));
      } else {
        dispatch(changeEditMode(EDIT_MODE_TYPE.SELECT));
      }
    }
  };
}

export function abortSubtract(): TAction {
  return async (dispatch, getState) => {
    const { subtractFragmentRef, isSubtracting } = getState().interactions;
    if (subtractFragmentRef) {
      if (isSubtracting) {
        subtractFragmentRef.abortDrawing();
        dispatch(setIsSubtracting(false));
      } else {
        dispatch(changeEditMode(EDIT_MODE_TYPE.SELECT));
      }
    }
  };
}

export function abortSplit(): TAction {
  return async (dispatch, getState) => {
    const { splitFragmentRef, isSplitting } = getState().interactions;
    if (splitFragmentRef) {
      if (isSplitting) {
        splitFragmentRef.abortDrawing();
        dispatch(setIsSplitting(false));
      } else {
        dispatch(changeEditMode(EDIT_MODE_TYPE.SELECT));
      }
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
