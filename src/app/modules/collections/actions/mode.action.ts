import { TAction } from '../../../../types/store.types';
import { EDIT_MODE_TYPE } from '../../../../utils/enums';
import { setMode } from '../slices/editor.slice';
import { setInfoDetails } from '../slices/selected.splice';
import { resetFeatureStyle } from './reset.action';

export function changeEditMode(newMode?: EDIT_MODE_TYPE): TAction {
  return (dispatch, getState) => {
    dispatch(turnOffAllModes());

    const {
      drawFragmentRef,
      splitFragmentRef,
      subtractFragmentRef,
      boneHoverRef,
      baseBoneHoverRef,
      deleteSelectRef,
      snapFragmentRef,
      addMultipleRef,
      addByRectangleDrawRef,
      infoSelectRef: selectRef,
      drawAnnotationRef,
    } = getState().interactions;
    const { layers, activeLayerIdx } = getState().layers;
    // Clear selection and reset styles if switching to a mode other than SELECT
    if (newMode !== EDIT_MODE_TYPE.SELECT) {
      dispatch(setInfoDetails([]));
      if (layers[activeLayerIdx] && layers[activeLayerIdx].source) {
        layers[activeLayerIdx].source.getFeatures().forEach((f) => {
          resetFeatureStyle(f);
        });
      }
    }
    switch (newMode) {
      case EDIT_MODE_TYPE.SELECT_RECTANGLE:
        addByRectangleDrawRef.setActive(true);
        boneHoverRef.setActive(true);
        break;
      case EDIT_MODE_TYPE.ADDITION:
        drawFragmentRef.setActive(true);
        snapFragmentRef.setActive(true);
        boneHoverRef.setActive(false);
        break;
      case EDIT_MODE_TYPE.SUBTRACTION:
        subtractFragmentRef.setActive(true);
        snapFragmentRef.setActive(true);
        break;
      case EDIT_MODE_TYPE.SPLIT:
        splitFragmentRef.setActive(true);
        snapFragmentRef.setActive(true);
        break;
      case EDIT_MODE_TYPE.DELETE:
        deleteSelectRef.setActive(true);
        boneHoverRef.setActive(true);
        break;
      case EDIT_MODE_TYPE.ADD_WHOLE:
        addMultipleRef.setActive(true);
        boneHoverRef.setActive(true);
        baseBoneHoverRef.setActive(true);
        break;
      case EDIT_MODE_TYPE.SELECT:
        selectRef.setActive(true);
        baseBoneHoverRef.setActive(true);
        if (layers[activeLayerIdx]) {
          layers[activeLayerIdx].hover.setActive(true);
        }
        break;
      case EDIT_MODE_TYPE.ANNOTATION:
        selectRef.setActive(false);
        boneHoverRef.setActive(false);
        drawAnnotationRef.setActive(true);
        break;

      default:
        selectRef.setActive(true);
        boneHoverRef.setActive(true);
        baseBoneHoverRef.setActive(true);
        break;
    }

    dispatch(setMode(newMode));
  };
}

export function turnOffAllModes(): TAction {
  return (_dispatch, getState) => {
    const {
      drawFragmentRef,
      splitFragmentRef,
      subtractFragmentRef,
      boneHoverRef,
      deleteSelectRef,
      snapFragmentRef,
      addMultipleRef,
      addByRectangleDrawRef,
      infoSelectRef,
      drawAnnotationRef,
    } = getState().interactions;
    if (drawFragmentRef) {
      drawFragmentRef.setActive(false);
    }
    if (splitFragmentRef) {
      splitFragmentRef.setActive(false);
    }
    if (subtractFragmentRef) {
      subtractFragmentRef.setActive(false);
    }
    if (boneHoverRef) {
      boneHoverRef.setActive(false);
    }
    if (deleteSelectRef) {
      deleteSelectRef.setActive(false);
    }
    if (snapFragmentRef) {
      snapFragmentRef.setActive(false);
    }
    if (addMultipleRef) {
      addMultipleRef.setActive(false);
    }
    if (addByRectangleDrawRef) {
      addByRectangleDrawRef.setActive(false);
    }
    if (infoSelectRef) {
      infoSelectRef.setActive(false);
    }
    if (drawAnnotationRef) {
      drawAnnotationRef.setActive(false);
    }
  };
}
